import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  ReactElement,
  SetStateAction,
  useState,
} from "react";
import tw from "twin.macro";
import {
  FileMinus,
  FilePlus,
  Plus,
  Translate,
  WarningCircle,
} from "phosphor-react";
import { v4 as generateUId } from "uuid";

import { useSelector, useDispatch } from "^redux/hooks";
import {
  selectAll,
  addOne,
  selectById,
  updateName,
  addTranslation,
} from "^redux/state/authors";
import { selectById as selectLanguageById } from "^redux/state/languages";

import { fuzzySearch } from "^helpers/general";

import useFocused from "^hooks/useFocused";

import WithProximityPopover from "./WithProximityPopover";
import WithTooltip from "./WithTooltip";
import WithWarning from "./WithWarning";

import s_transition from "^styles/transition";
import { s_popover } from "^styles/popover";
import { Author as AuthorType } from "^types/author";
import LanguageError from "./LanguageError";
import InlineTextEditor from "./editors/Inline";

// todo: want to highlight and make changeable author translations for the translations of the doc. Show other translations but de-emphasised.
// todo: on addAuthor, allow language choice, but only for doc languages
// todo: authorlist item flexs properly when line overflow?

// todo: author names not unique. reinforces need to be able to see author relationship to docs, such as articles.

const WithEditDocAuthors = ({
  children,
  docAuthorIds,
  docLanguageIds,
  onRemoveAuthorFromDoc,
  onAddAuthorToDoc,
  docActiveLanguageId,
}: {
  children: ReactElement;
  docAuthorIds: string[];
  docLanguageIds: string[];
  docActiveLanguageId: string;
  onRemoveAuthorFromDoc: (authorId: string) => void;
  onAddAuthorToDoc: (authorId: string) => void;
}) => {
  return (
    <WithProximityPopover
      panelContentElement={
        <Panel
          docAuthorsIds={docAuthorIds}
          docLanguageIds={docLanguageIds}
          docActiveLanguageId={docActiveLanguageId}
          onAddAuthorToDoc={onAddAuthorToDoc}
          removeAuthorFromDoc={onRemoveAuthorFromDoc}
        />
      }
    >
      {children}
    </WithProximityPopover>
  );
};

export default WithEditDocAuthors;

const Panel = ({
  docAuthorsIds,
  docLanguageIds,
  removeAuthorFromDoc,
  onAddAuthorToDoc,
  docActiveLanguageId,
}: {
  docAuthorsIds: string[];
  docLanguageIds: string[];
  docActiveLanguageId: string;
  onAddAuthorToDoc: (authorId: string) => void;
  removeAuthorFromDoc: (authorId: string) => void;
}) => {
  const areDocAuthors = Boolean(docAuthorsIds.length);

  return (
    <PanelUI
      areDocAuthors={areDocAuthors}
      docAuthorsList={
        <AuthorsListUI
          areDocAuthors={areDocAuthors}
          listItems={
            <AuthorsListItems
              docAuthorIds={docAuthorsIds}
              docLanguageIds={docLanguageIds}
              removeAuthorFromDoc={removeAuthorFromDoc}
            />
          }
        />
      }
      inputWithSelect={
        <AuthorsInputWithSelect
          docActiveLanguageId={docActiveLanguageId}
          docAuthorIds={docAuthorsIds}
          onAddAuthorToDoc={onAddAuthorToDoc}
        />
      }
    />
  );
};

const PanelUI = ({
  areDocAuthors,
  docAuthorsList,
  inputWithSelect,
}: {
  areDocAuthors: boolean;
  docAuthorsList: ReactElement;
  inputWithSelect: ReactElement;
}) => {
  return (
    <div css={[s_popover.container]}>
      <div>
        <h4 css={[tw`font-medium text-lg`]}>Authors</h4>
        <p css={[tw`text-gray-600 mt-xs text-sm`]}>
          {!areDocAuthors
            ? "You haven't added any authors to this article yet."
            : "Edit author(s) for this document's language(s)"}
        </p>
      </div>
      <div css={[tw`flex flex-col gap-lg items-start`]}>
        {docAuthorsList}
        {inputWithSelect}
      </div>
    </div>
  );
};

const AuthorsListUI = ({
  areDocAuthors,
  listItems,
}: {
  areDocAuthors: boolean;
  listItems: ReactElement;
}) => {
  return areDocAuthors ? (
    <div css={[tw`flex flex-col gap-sm`]}>{listItems}</div>
  ) : null;
};

const AuthorsListItems = ({
  docAuthorIds,
  docLanguageIds,
  removeAuthorFromDoc,
}: {
  docAuthorIds: string[];
  docLanguageIds: string[];
  removeAuthorFromDoc: (authorId: string) => void;
}) => {
  return (
    <>
      {docAuthorIds.map((id, i) => (
        <AuthorsListItem
          authorId={id}
          docLanguageIds={docLanguageIds}
          index={i}
          removeAuthorFromDoc={() => removeAuthorFromDoc(id)}
          key={id}
        />
      ))}
    </>
  );
};

const AuthorsListItem = ({
  authorId,
  docLanguageIds,
  index,
  removeAuthorFromDoc,
}: {
  authorId: string;
  docLanguageIds: string[];
  index: number;
  removeAuthorFromDoc: () => void;
}) => {
  const number = index + 1;

  return (
    <AuthorsListItemUI
      author={<Author authorId={authorId} docLanguageIds={docLanguageIds} />}
      number={number}
      removeFromDocButton={
        <RemoveFromDoc removeAuthorFromDoc={removeAuthorFromDoc} />
      }
    />
  );
};

const AuthorsListItemUI = ({
  author,
  number,
  removeFromDocButton,
}: {
  number: number;
  author: ReactElement;
  removeFromDocButton: ReactElement;
}) => {
  return (
    <div css={[tw`relative flex items-center`]} className="group">
      <span css={[tw`text-gray-600 mr-sm`]}>{number}.</span>
      <div css={[tw`relative flex items-center gap-sm`]}>
        {removeFromDocButton}
        <div
          css={[
            // * group-hover:z-50 for input tooltip; translate-x value is from the size of removeAuthor button and flex spacing.
            tw`translate-x-[-40px] group-hover:z-40 group-hover:translate-x-0 transition-transform duration-75 ease-in delay-300`,
          ]}
        >
          {author}
        </div>
      </div>
    </div>
  );
};

const Author = ({
  authorId,
  docLanguageIds,
}: {
  authorId: string;
  docLanguageIds: string[];
}) => {
  const author = useSelector((state) => selectById(state, authorId));

  return author ? (
    <AuthorUI
      translations={
        <AuthorTranslations
          authorId={authorId}
          docLanguageIds={docLanguageIds}
          translations={author.translations}
        />
      }
    />
  ) : (
    <AuthorErrorUI />
  );
};

const AuthorUI = ({ translations }: { translations: ReactElement }) => {
  return <div css={[tw`flex gap-sm items-center`]}>{translations}</div>;
};

const RemoveFromDoc = ({
  removeAuthorFromDoc,
}: {
  removeAuthorFromDoc: () => void;
}) => {
  return (
    <RemoveFromDocUI
      removeFromDoc={removeAuthorFromDoc}
      tooltipText="remove author from document"
      warningText="Remove author from document?"
    />
  );
};

const RemoveFromDocUI = ({
  removeFromDoc,
  tooltipText,
  warningText,
}: {
  removeFromDoc: () => void;
  tooltipText: string;
  warningText: string;
}) => {
  return (
    <WithWarning
      callbackToConfirm={removeFromDoc}
      warningText={{ heading: warningText }}
      type="moderate"
    >
      {({ isOpen: warningIsOpen }) => (
        <WithTooltip
          text={tooltipText}
          placement="top"
          isDisabled={warningIsOpen}
          type="action"
        >
          <button
            css={[
              tw`group-hover:visible group-hover:opacity-100 invisible opacity-0 transition-opacity ease-in-out duration-75`,
              tw`text-gray-600 p-xxs hover:bg-gray-100 hover:text-red-warning active:bg-gray-200 rounded-full grid place-items-center`,
            ]}
            type="button"
          >
            <FileMinus />
          </button>
        </WithTooltip>
      )}
    </WithWarning>
  );
};

const AuthorErrorUI = () => {
  return (
    <WithTooltip
      text={{
        header: "Author error",
        body: "An author was added to this document that can't be found. Try refreshing the page. If the problem persists, contact the site developer.",
      }}
    >
      <span css={[tw`text-red-500 bg-white group-hover:z-50`]}>
        <WarningCircle />
      </span>
    </WithTooltip>
  );
};

const AuthorTranslations = ({
  authorId,
  docLanguageIds,
  translations,
}: {
  authorId: string;
  docLanguageIds: string[];
  translations: AuthorType["translations"];
}) => {
  const nonDocLanguageTranslations = translations.filter(
    (t) => !docLanguageIds.includes(t.languageId)
  );

  return (
    <AuthorTranslationsUI
      docLanguageTranslations={
        <>
          {docLanguageIds.map((languageId, i) => (
            <AuthorTranslation
              index={i}
              authorId={authorId}
              languageId={languageId}
              translation={translations.find(
                (t) => t.languageId === languageId
              )}
              type="doc"
              key={languageId}
            />
          ))}
        </>
      }
      nonDocLanguageTranslations={
        <>
          {nonDocLanguageTranslations.map((t, i) => (
            <AuthorTranslation
              authorId={authorId}
              index={i}
              languageId={t.languageId}
              translation={t}
              type="non-doc"
              key={t.id}
            />
          ))}
        </>
      }
    />
  );
};

const AuthorTranslationsUI = ({
  docLanguageTranslations,
  nonDocLanguageTranslations,
}: {
  docLanguageTranslations: ReactElement;
  nonDocLanguageTranslations: ReactElement;
}) => {
  return (
    <div css={[tw`flex items-center gap-lg`]}>
      <div css={[tw`flex items-center gap-sm`]}>{docLanguageTranslations}</div>
      <div css={[tw`flex items-center gap-sm`]}>
        <div css={[tw`flex items-center gap-xxs`]}>
          <div css={[tw`h-[20px] w-[0.5px] bg-gray-200`]} />
          <div css={[tw`h-[20px] w-[0.5px] bg-gray-200`]} />
        </div>
        {nonDocLanguageTranslations}
      </div>
    </div>
  );
};

const AuthorTranslation = ({
  // docLanguageIds,
  authorId,
  index,
  languageId,
  translation,
  type,
}: {
  // docLanguageIds: string[];
  authorId: string;
  index: number;
  languageId: string;
  translation: AuthorType["translations"][number] | undefined;
  type: "doc" | "non-doc";
}) => {
  // const isDocLanguage = docLanguageIds.includes(languageId);
  const dispatch = useDispatch();
  const isFirst = Boolean(index === 0);

  const handleUpdateAuthorTranslation = (name: string) => {
    if (translation) {
      dispatch(
        updateName({ id: authorId, translationId: translation.id, name })
      );
    } else {
      dispatch(addTranslation({ id: authorId, languageId, name }));
    }

    return;
  };
  const translationText = translation?.name;

  return (
    <AuthorTranslationUI
      isDocLanguage={type === "doc"}
      isFirst={isFirst}
      language={<AuthorTranslationLanguage languageId={languageId} />}
      // translationText={translation?.name || ''}
      translationText={
        <WithTooltip
          text={{
            header: "Edit author translation",
            body: "Updating this author will affect this author across all documents it's a part of.",
          }}
        >
          <div>
            <InlineTextEditor
              initialValue={translationText}
              onUpdate={(text) => handleUpdateAuthorTranslation(text)}
              placeholder="author..."
              disabled={type === "non-doc"}
              minWidth={30}
            />
          </div>
        </WithTooltip>
      }
    />
  );
};

const AuthorTranslationUI = ({
  isDocLanguage,
  isFirst,
  language,
  translationText,
}: // input
{
  isDocLanguage: boolean;
  isFirst: boolean;
  language: ReactElement;
  translationText: ReactElement;
  // input: ReactElement
}) => {
  return (
    <div css={[tw`flex gap-sm items-center`]}>
      {!isFirst ? <div css={[tw`h-[20px] w-[0.5px] bg-gray-200`]} /> : null}
      <div
        css={[
          tw`flex gap-xs`,
          !isDocLanguage && tw`pointer-events-none opacity-40`,
        ]}
      >
        {/* <p>{translationText}</p> */}
        <span>{translationText}</span>
        <p css={[tw`flex gap-xxxs items-center`]}>
          <span css={[tw`text-xs -translate-y-1 text-gray-500`]}>
            <Translate />
          </span>
          {language}
        </p>
      </div>
    </div>
  );
};

const AuthorTranslationLanguage = ({ languageId }: { languageId: string }) => {
  const language = useSelector((state) =>
    selectLanguageById(state, languageId)
  );

  return language ? (
    <AuthorTranslationLanguageUI languageText={language.name} />
  ) : (
    <LanguageError />
  );
};

const AuthorTranslationLanguageUI = ({
  languageText,
}: {
  languageText: string;
}) => {
  return (
    <span css={[tw`capitalize text-gray-600 text-sm`]}>{languageText}</span>
  );
};

const inputId = "author-input";

const AuthorsInputWithSelect = ({
  docActiveLanguageId,
  docAuthorIds,
  onAddAuthorToDoc,
}: {
  docActiveLanguageId: string;
  docAuthorIds: string[];
  onAddAuthorToDoc: (authorId: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const [inputIsFocused, focusHandlers] = useFocused();

  return (
    <AuthorsInputWithSelectUI
      input={
        <AuthorInput
          focusHandlers={focusHandlers}
          languageId={docActiveLanguageId}
          onAddAuthorToDoc={onAddAuthorToDoc}
          setValue={setInputValue}
          value={inputValue}
        />
      }
      language={
        <InputLanguage languageId={docActiveLanguageId} show={inputIsFocused} />
      }
      select={
        <AuthorsSelect
          docAuthorIds={docAuthorIds}
          onAddAuthorToDoc={onAddAuthorToDoc}
          query={inputValue}
          show={inputValue.length > 1 && inputIsFocused}
        />
      }
    />
  );
};

const AuthorsInputWithSelectUI = ({
  input,
  language,
  select,
}: {
  input: ReactElement;
  language: ReactElement;
  select: ReactElement;
}) => {
  return (
    <div>
      <div css={[tw`relative`]}>
        {input}
        {language}
        {select}
      </div>
      {/*       <AuthorsSelect
        docAuthorIds={docAuthorIds}
        docType={docType}
        onSubmit={(languageId) => {
          onSubmit(languageId);
          setInputValue("");
        }}
        query={inputValue}
        show={inputIsFocused && inputValue.length > 1}
      />
      <div
        css={[
          tw`absolute top-2 right-0 -translate-y-full flex items-center gap-xxs bg-white`,
          s_transition.toggleVisiblity(inputIsFocused),
          tw`transition-opacity duration-75 ease-in-out`,
        ]}
      >
        <span css={[tw`text-sm -translate-y-1 text-gray-400`]}>
          <Translate weight="light" />
        </span>
        <span css={[tw`capitalize text-gray-400 text-sm`]}>English</span>
      </div> */}
    </div>
  );
};

const AuthorInput = ({
  onAddAuthorToDoc,
  focusHandlers,
  languageId,
  setValue,
  value,
}: {
  focusHandlers: {
    onFocus: () => void;
    onBlur: () => void;
  };
  languageId: string;
  onAddAuthorToDoc: (authorId: string) => void;
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
}) => {
  const dispatch = useDispatch();

  const submitNewAuthor = () => {
    const id = generateUId();
    dispatch(addOne({ id, name: value, languageId }));
    onAddAuthorToDoc(id);
    setValue("");
  };

  return (
    <AuthorInputUI
      focusHandlers={focusHandlers}
      inputValue={value}
      onChange={(e) => setValue(e.target.value)}
      onSubmit={(e) => {
        e.preventDefault();
        submitNewAuthor();
      }}
    />
  );
};

const AuthorInputUI = ({
  focusHandlers,
  inputValue,
  onChange,
  onSubmit,
}: {
  focusHandlers: {
    onFocus: () => void;
    onBlur: () => void;
  };
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div css={[tw`relative`]}>
        <input
          css={[
            tw`px-lg py-1 text-sm outline-none border-2 border-transparent focus:border-gray-200 rounded-sm`,
          ]}
          id={inputId}
          value={inputValue}
          onChange={onChange}
          placeholder="Add a new author..."
          type="text"
          autoComplete="off"
          {...focusHandlers}
        />
        <label
          css={[tw`absolute left-2 top-1/2 -translate-y-1/2 text-gray-500`]}
          htmlFor={inputId}
        >
          <Plus />
        </label>
      </div>
    </form>
  );
};

const InputLanguage = ({
  languageId,
  show,
}: {
  languageId: string;
  show: boolean;
}) => {
  const language = useSelector((state) =>
    selectLanguageById(state, languageId)
  );

  return (
    <InputLanguageUI
      languageText={language ? language.name : <LanguageError />}
      show={show}
    />
  );
};

const InputLanguageUI = ({
  languageText,
  show,
}: {
  languageText: ReactElement | string;
  show: boolean;
}) => {
  return (
    <div
      css={[
        tw`absolute top-2 right-0 -translate-y-full flex items-center gap-xxs bg-white`,
        s_transition.toggleVisiblity(show),
        tw`transition-opacity duration-75 ease-in-out`,
      ]}
    >
      <span css={[tw`text-sm -translate-y-1 text-gray-400`]}>
        <Translate weight="light" />
      </span>
      <span css={[tw`capitalize text-gray-400 text-sm`]}>{languageText}</span>
    </div>
  );
};

const AuthorsSelect = ({
  docAuthorIds,
  onAddAuthorToDoc,
  query,
  show,
}: {
  docAuthorIds: string[];
  onAddAuthorToDoc: (authorId: string) => void;
  query: string;
  show: boolean;
}) => {
  const allAuthors = useSelector(selectAll);

  const authorsMatchingQuery = fuzzySearch(
    ["translations.name"],
    allAuthors,
    query
  ).map((f) => f.item);

  return (
    <AuthorsSelectUI
      authorsMatchingQuery={
        <AuthorsMatchingQuery
          authorMatches={authorsMatchingQuery}
          docAuthorIds={docAuthorIds}
          onAddAuthorToDoc={onAddAuthorToDoc}
        />
      }
      show={show}
    />
  );
};

const AuthorsSelectUI = ({
  authorsMatchingQuery,
  show,
}: {
  authorsMatchingQuery: ReactElement;
  show: boolean;
}) => {
  return (
    <div
      css={[
        tw`absolute -bottom-2 translate-y-full w-full bg-white border-2 border-gray-200 rounded-sm py-sm text-sm shadow-lg`,
        show ? tw`opacity-100` : tw`opacity-0 h-0`,
        tw`transition-opacity duration-75 ease-linear`,
      ]}
    >
      {authorsMatchingQuery}
    </div>
  );
};

const AuthorsMatchingQuery = ({
  authorMatches,
  docAuthorIds,
  onAddAuthorToDoc,
}: {
  authorMatches: AuthorType[];
  docAuthorIds: string[];
  onAddAuthorToDoc: (authorId: string) => void;
}) => {
  return (
    <AuthorsMatchingQueryUI
      authorMatches={
        <>
          {authorMatches.map((a) => (
            <AuthorMatch
              author={a}
              docAuthorIds={docAuthorIds}
              onAddAuthorToDoc={onAddAuthorToDoc}
              key={a.id}
            />
          ))}
        </>
      }
    />
  );
};

const AuthorsMatchingQueryUI = ({
  authorMatches,
}: {
  authorMatches: ReactElement;
}) => {
  return (
    <div css={[tw`flex flex-col gap-xs items-start`]}>{authorMatches}</div>
  );
};

const AuthorMatch = ({
  author,
  docAuthorIds,
  onAddAuthorToDoc,
}: {
  author: AuthorType;
  docAuthorIds: string[];
  onAddAuthorToDoc: (authorId: string) => void;
}) => {
  const { id, translations } = author;
  const isDocAuthor = docAuthorIds.includes(id);

  return (
    <AuthorMatchUI
      addAuthorToDoc={() => !isDocAuthor && onAddAuthorToDoc(id)}
      canAddToDoc={!isDocAuthor}
      translations={<AuthorMatchTranslations translations={translations} />}
    />
  );
};

const AuthorMatchUI = ({
  addAuthorToDoc,
  canAddToDoc,
  translations,
}: {
  addAuthorToDoc: () => void;
  canAddToDoc: boolean;
  translations: ReactElement;
}) => {
  return (
    <WithTooltip
      text="add author to document"
      type="action"
      isDisabled={!canAddToDoc}
    >
      <button
        css={[
          tw`text-left py-1 relative w-full px-sm`,
          !canAddToDoc && tw`pointer-events-none`,
        ]}
        className="group"
        onClick={addAuthorToDoc}
        type="button"
      >
        <span
          css={[
            tw`text-gray-600 group-hover:text-gray-800`,
            !canAddToDoc && tw`text-gray-400`,
          ]}
        >
          {translations}
        </span>
        {canAddToDoc ? (
          <span
            css={[
              s_transition.onGroupHover,
              tw`absolute right-2 top-1/2 -translate-y-1/2 text-green-600`,
            ]}
          >
            <FilePlus />
          </span>
        ) : null}
      </button>
    </WithTooltip>
  );
};

// text overflow - have ellipsis ideally
const AuthorMatchTranslations = ({
  translations,
}: {
  translations: AuthorType["translations"][number][];
}) => {
  const validTranslations = translations.filter((t) => t.name.length);
  return (
    <AuthorMatchTranslationsUI
      translations={
        <>
          {validTranslations.map((t, i) => (
            <AuthorMatchTranslation index={i} translation={t} key={t.id} />
          ))}
        </>
      }
    />
  );
};

const AuthorMatchTranslationsUI = ({
  translations,
}: {
  translations: ReactElement;
}) => {
  return <div css={[tw`flex items-center gap-xs`]}>{translations}</div>;
};

const AuthorMatchTranslation = ({
  index,
  translation,
}: {
  index: number;
  translation: AuthorType["translations"][number];
}) => {
  return (
    <AuthorMatchTranslationUI isFirst={index === 0} text={translation.name} />
  );
};

const AuthorMatchTranslationUI = ({
  isFirst,
  text,
}: {
  isFirst: boolean;
  text: string;
}) => {
  return (
    <div css={[tw`flex items-center gap-xs`]}>
      {!isFirst ? <span css={[tw`w-[0.5px] h-[15px] bg-gray-200`]} /> : null}
      <p css={[]}>{text}</p>
    </div>
  );
};