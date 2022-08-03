import { NextPage } from "next";
import {
  Gear as GearIcon,
  TagSimple as TagSimpleIcon,
  PlusCircle as PlusCircleIcon,
  Translate as TranslateIcon,
  Trash as TrashIcon,
  Image as ImageIcon,
  YoutubeLogo as YoutubeLogoIcon,
  Copy as CopyIcon,
  ArrowSquareOut as ArrowSquareOutIcon,
  Books as BooksIcon,
  CirclesFour as CirclesFourIcon,
  WarningCircle as WarningCircleIcon,
  PenNib as PenNibIcon,
} from "phosphor-react";

import { Collection as CollectionKey } from "^lib/firebase/firestore/collectionKeys";

import HandleRouteValidity from "^components/HandleRouteValidity";
import Head from "^components/Head";
import QueryDatabase from "^components/QueryDatabase";
import useGetSubRouteId from "^hooks/useGetSubRouteId";
import { useSelector } from "^redux/hooks";
import { selectById as selectRecordedEventId } from "^redux/state/recordedEvents";
import tw from "twin.macro";
import {
  RecordedEventProvider,
  useRecordedEventContext,
} from "^context/RecordedEventContext";
import {
  SelectTranslationProvider,
  useSelectTranslationContext,
} from "^context/SelectTranslationContext";
import useRecordedEventsPageTopControls from "^hooks/pages/useRecordedEventPageTopControls";
import HeaderGeneric from "^components/header/HeaderGeneric";
import PublishPopover from "^components/header/PublishPopover";
import SaveTextUI from "^components/header/SaveTextUI";
import WithTranslations from "^components/WithTranslations";
import { selectById as selectLanguageById } from "^redux/state/languages";
import { capitalizeFirstLetter } from "^helpers/general";
import WithTooltip from "^components/WithTooltip";
import s_button from "^styles/button";
import LanguageError from "^components/LanguageError";
import UndoButtonUI from "^components/header/UndoButtonUI";
import SaveButtonUI from "^components/header/SaveButtonUI";
import WithDocSubjects from "^components/WithSubjects";
import HeaderIconButton from "^components/header/IconButton";
import MissingTranslation from "^components/MissingTranslation";
import WithCollections from "^components/WithCollections";
import { s_header } from "^styles/header";
import WithTags from "^components/WithTags";
import WithProximityPopover from "^components/WithProximityPopover";
import { useDeleteRecordedEventMutation } from "^redux/services/recordedEvents";
import { s_popover } from "^styles/popover";
import WithWarning from "^components/WithWarning";
import { s_menu } from "^styles/menus";
import MeasureHeight from "^components/MeasureHeight";
import {
  RecordedEventTranslationProvider,
  useRecordedEventTranslationContext,
} from "^context/RecordedEventTranslationContext";
import InlineTextEditor from "^components/editors/Inline";
import { selectById as selectAuthorById } from "^redux/state/authors";
import { AuthorProvider, useAuthorContext } from "^context/AuthorContext";
import { ReactElement } from "react";
import WithEditDocAuthors from "^components/WithEditDocAuthors";

// todo: should only allow documents to be part of one collection? How to handle the display if multiple?
// todo: check out lrb's youtube video - minimal

const RecordedEventPage: NextPage = () => {
  return (
    <>
      <Head />
      <QueryDatabase
        collections={[
          CollectionKey.AUTHORS,
          CollectionKey.COLLECTIONS,
          CollectionKey.LANGUAGES,
          CollectionKey.RECORDEDEVENTS,
          CollectionKey.SUBJECTS,
          CollectionKey.TAGS,
        ]}
      >
        <HandleRouteValidity docType="recordedEvent">
          <PageContent />
        </HandleRouteValidity>
      </QueryDatabase>
    </>
  );
};

export default RecordedEventPage;

const PageContent = () => {
  const recordedEventId = useGetSubRouteId();
  const recordedEvent = useSelector((state) =>
    selectRecordedEventId(state, recordedEventId)
  )!;

  return (
    <div css={[tw`h-screen overflow-hidden flex flex-col`]}>
      <RecordedEventProvider recordedEvent={recordedEvent}>
        <SelectTranslationProvider translations={recordedEvent.translations}>
          <>
            <Header />
            <Main />
          </>
        </SelectTranslationProvider>
      </RecordedEventProvider>
    </div>
  );
};

const Header = () => {
  const { handleSave, handleUndo, isChange, saveMutationData } =
    useRecordedEventsPageTopControls();

  const [{ publishInfo }, { togglePublishStatus }] = useRecordedEventContext();

  return (
    <HeaderGeneric confirmBeforeLeavePage={isChange}>
      <div css={[tw`flex justify-between items-center`]}>
        <div css={[tw`flex items-center gap-lg`]}>
          <div css={[tw`flex items-center gap-sm`]}>
            <PublishPopover
              isPublished={publishInfo.status === "published"}
              toggleStatus={togglePublishStatus}
            />
            <TranslationsPopover />
          </div>
          <SaveTextUI isChange={isChange} saveMutationData={saveMutationData} />
        </div>
        <div css={[tw`flex items-center gap-sm`]}>
          <SubjectsPopover />
          <CollectionsPopover />
          <TagsPopover />
          <div css={[s_header.verticalBar]} />
          <HeaderAuthorsPopover />
          <div css={[s_header.verticalBar]} />
          <UndoButtonUI
            handleUndo={handleUndo}
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
          />
          <SaveButtonUI
            handleSave={handleSave}
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
          />
          <div css={[s_header.verticalBar]} />
          <Settings />
          <div css={[s_header.verticalBar]} />
        </div>
      </div>
    </HeaderGeneric>
  );
};

const TranslationsPopover = () => {
  const [{ translations }, { addTranslation, deleteTranslation }] =
    useRecordedEventContext();
  const [{ id: activeTranslationId }, { updateActiveTranslation }] =
    useSelectTranslationContext();

  const handleDeleteTranslation = (translationToDeleteId: string) => {
    const translationToDeleteIsActive =
      translationToDeleteId === activeTranslationId;

    if (translationToDeleteIsActive) {
      const remainingTranslations = translations.filter(
        (t) => t.id !== translationToDeleteId
      );
      const newActiveTranslationId = remainingTranslations[0].id;
      updateActiveTranslation(newActiveTranslationId);
    }

    deleteTranslation({ translationId: translationToDeleteId });
  };

  return (
    <WithTranslations
      activeTranslationId={activeTranslationId}
      docType="recorded event"
      updateActiveTranslation={updateActiveTranslation}
      addToDoc={(languageId) => addTranslation({ languageId })}
      removeFromDoc={handleDeleteTranslation}
      translations={translations}
    >
      <TranslationsPopoverLabel />
    </WithTranslations>
  );
};

const TranslationsPopoverLabel = () => {
  const [activeTranslation] = useSelectTranslationContext();

  const activeTranslationLanguage = useSelector((state) =>
    selectLanguageById(state, activeTranslation.languageId)
  );

  const activeTranslationLanguageNameFormatted = activeTranslationLanguage
    ? capitalizeFirstLetter(activeTranslationLanguage.name)
    : null;

  return (
    <WithTooltip text="translations" placement="right">
      <button css={[tw`flex gap-xxxs items-center`]}>
        <span css={[s_button.subIcon, tw`text-sm -translate-y-1`]}>
          <TranslateIcon />
        </span>
        {activeTranslationLanguage ? (
          <span css={[tw`text-sm`]}>
            {activeTranslationLanguageNameFormatted}
          </span>
        ) : (
          <LanguageError tooltipPlacement="bottom">Error</LanguageError>
        )}
      </button>
    </WithTooltip>
  );
};

const SubjectsPopover = () => {
  const [{ subjectIds, translations }, { removeSubject, addSubject }] =
    useRecordedEventContext();
  const [{ languageId: activeLanguageId }] = useSelectTranslationContext();

  const languageIds = translations.map((t) => t.languageId);

  return (
    <WithDocSubjects
      docActiveLanguageId={activeLanguageId}
      docLanguagesById={languageIds}
      docSubjectsById={subjectIds}
      docType="recorded event"
      onAddSubjectToDoc={(subjectId) => addSubject({ subjectId })}
      onRemoveSubjectFromDoc={(subjectId) => removeSubject({ subjectId })}
    >
      {({ isMissingTranslation }) => (
        <SubjectsPopoverButtonUI isMissingTranslation={isMissingTranslation} />
      )}
    </WithDocSubjects>
  );
};

const SubjectsPopoverButtonUI = ({
  isMissingTranslation,
}: {
  isMissingTranslation: boolean;
}) => (
  <div css={[tw`relative`]}>
    <HeaderIconButton tooltipText="subjects">
      <BooksIcon />
    </HeaderIconButton>
    {isMissingTranslation ? (
      <div
        css={[
          tw`z-40 absolute top-0 right-0 translate-x-2 -translate-y-0.5 scale-90`,
        ]}
      >
        <MissingTranslation tooltipText="missing translation" />
      </div>
    ) : null}
  </div>
);

const CollectionsPopover = () => {
  const [{ collectionIds, translations }, { addCollection, removeCollection }] =
    useRecordedEventContext();
  const [{ languageId: activeLanguageId }] = useSelectTranslationContext();

  const languageIds = translations.map((t) => t.languageId);

  return (
    <WithCollections
      docActiveLanguageId={activeLanguageId}
      docCollectionsById={collectionIds}
      docLanguagesById={languageIds}
      docType="recorded event"
      onAddCollectionToDoc={(collectionId) => addCollection({ collectionId })}
      onRemoveCollectionFromDoc={(collectionId) =>
        removeCollection({ collectionId })
      }
    >
      {({ isMissingTranslation }) => (
        <CollectionsPopoverButtonUI
          isMissingTranslation={isMissingTranslation}
        />
      )}
    </WithCollections>
  );
};

const CollectionsPopoverButtonUI = ({
  isMissingTranslation,
}: {
  isMissingTranslation: boolean;
}) => (
  <div css={[tw`relative`]}>
    <HeaderIconButton tooltipText="collections">
      <CirclesFourIcon />
    </HeaderIconButton>
    {isMissingTranslation ? (
      <div
        css={[
          tw`z-40 absolute top-0 right-0 translate-x-2 -translate-y-0.5 scale-90`,
        ]}
      >
        <MissingTranslation tooltipText="missing translation" />
      </div>
    ) : null}
  </div>
);

const TagsPopover = () => {
  const [{ tagIds }, { removeTag, addTag }] = useRecordedEventContext();

  return (
    <WithTags
      docTagsById={tagIds}
      docType="recorded event"
      onRemoveFromDoc={(tagId) => removeTag({ tagId })}
      onAddToDoc={(tagId) => addTag({ tagId })}
    >
      <HeaderIconButton tooltipText="tags">
        <TagSimpleIcon />
      </HeaderIconButton>
    </WithTags>
  );
};

const WithAuthorsPopover = ({
  children,
}: {
  children:
    | ReactElement
    | (({
        isMissingTranslation,
      }: {
        isMissingTranslation: boolean;
      }) => ReactElement);
}) => {
  const [{ authorIds, translations }, { addAuthor, removeAuthor }] =
    useRecordedEventContext();
  const languageIds = translations.map((t) => t.languageId);

  const [{ languageId }] = useSelectTranslationContext();

  return (
    <WithEditDocAuthors
      docActiveLanguageId={languageId}
      docAuthorIds={authorIds}
      docLanguageIds={languageIds}
      onAddAuthorToDoc={(authorId) => addAuthor({ authorId })}
      onRemoveAuthorFromDoc={(authorId) => removeAuthor({ authorId })}
    >
      {({ isMissingTranslation }) => (
        <>
          {typeof children === "function"
            ? children({ isMissingTranslation })
            : children}
        </>
      )}
    </WithEditDocAuthors>
  );
};

const HeaderAuthorsPopover = () => (
  <WithAuthorsPopover>
    {({ isMissingTranslation }) => (
      <div css={[tw`relative`]}>
        <HeaderIconButton tooltipText="authors">
          <PenNibIcon />
        </HeaderIconButton>
        {isMissingTranslation ? (
          <div
            css={[
              tw`z-40 absolute top-0 right-0 translate-x-2 -translate-y-0.5 scale-90`,
            ]}
          >
            <MissingTranslation tooltipText="missing translation" />
          </div>
        ) : null}
      </div>
    )}
  </WithAuthorsPopover>
);

const Settings = () => {
  return (
    <WithProximityPopover panelContentElement={<SettingsPanel />}>
      <HeaderIconButton tooltipText="settings">
        <GearIcon />
      </HeaderIconButton>
    </WithProximityPopover>
  );
};

const SettingsPanel = () => {
  const [deleteRecordedEventFromDb] = useDeleteRecordedEventMutation();
  const [{ id }] = useRecordedEventContext();

  return (
    <div css={[s_popover.panelContainer, tw`py-xs min-w-[25ch]`]}>
      <WithWarning
        callbackToConfirm={() =>
          deleteRecordedEventFromDb({ id, useToasts: true })
        }
        warningText={{
          heading: "Delete recorded event",
          body: "Are you sure you want? This can't be undone.",
        }}
      >
        <button
          className="group"
          css={[
            s_menu.listItemText,
            tw`w-full text-left px-sm py-xs flex gap-sm items-center transition-colors ease-in-out duration-75`,
          ]}
        >
          <span css={[tw`group-hover:text-red-warning`]}>
            <TrashIcon />
          </span>
          <span>Delete recorded event</span>
        </button>
      </WithWarning>
    </div>
  );
};

const Main = () => {
  return (
    <MeasureHeight
      styles={tw`h-full grid place-items-center bg-gray-50 border-t-2 border-gray-200`}
    >
      {(containerHeight) =>
        containerHeight ? (
          <main
            css={[
              tw`w-[95%] max-w-[720px] pl-lg pr-xl overflow-y-auto overflow-x-hidden bg-white shadow-md`,
            ]}
            style={{ height: containerHeight * 0.95 }}
          >
            <RecordedEvent />
          </main>
        ) : null
      }
    </MeasureHeight>
  );
};

const RecordedEvent = () => {
  const [{ id }] = useRecordedEventContext();
  const [translation] = useSelectTranslationContext();

  return (
    <RecordedEventTranslationProvider
      recordedEventId={id}
      translation={translation}
    >
      <RecordedEventUI />
    </RecordedEventTranslationProvider>
  );
};

const RecordedEventUI = () => (
  <article css={[tw`h-full flex flex-col`]}>
    <header css={[tw`flex flex-col items-start gap-sm pt-lg pb-md border-b`]}>
      {/* <Date /> */}
      {/* <Collections /> */}
      <Title />
      <HandleIsAuthor />
      {/* <Authors /> */}
    </header>
    {/* <Body /> */}
    <br />
    <br />
    <br />
    <br />
  </article>
);

const Title = () => {
  const [{ title }, { updateTitle }] = useRecordedEventTranslationContext();

  return (
    <TitleUI
      title={title || ""}
      updateTitle={(title) => updateTitle({ title })}
    />
  );
};

const TitleUI = ({
  title,
  updateTitle,
}: {
  title: string;
  updateTitle: (text: string) => void;
}) => (
  <div css={[tw`text-3xl font-serif-eng font-medium`]}>
    <InlineTextEditor
      injectedValue={title || ""}
      onUpdate={updateTitle}
      placeholder="Title..."
    />
  </div>
);

const HandleIsAuthor = () => {
  const [{ authorIds }] = useRecordedEventContext();

  if (!authorIds.length) {
    return null;
  }

  return <Authors />;
};

const Authors = () => {
  const [{ authorIds }] = useRecordedEventContext();

  return (
    <AuthorsUI
      authors={authorIds.map((id) => (
        <HandleAuthorValidity authorId={id} key={id} />
      ))}
    />
  );
};

const AuthorsUI = ({ authors }: { authors: ReactElement[] }) => (
  <div>{authors}</div>
);

const HandleAuthorValidity = ({ authorId }: { authorId: string }) => {
  const author = useSelector((state) => selectAuthorById(state, authorId));

  return author ? (
    <AuthorProvider author={author}>
      <ValidAuthor />
    </AuthorProvider>
  ) : (
    <InvalidAuthorUI />
  );
};

const InvalidAuthorUI = () => (
  <div>
    <WithTooltip
      text={{
        header: "Author error",
        body: "A author was added to this document that can't be found. Try refreshing the page. If the problem persists, contact the site developer.",
      }}
    >
      <span css={[tw`text-red-500 bg-white`]}>
        <WarningCircleIcon />
      </span>
    </WithTooltip>
  </div>
);

const ValidAuthor = () => {
  const [{ translations }] = useAuthorContext();
  const [{ languageId }] = useSelectTranslationContext();

  const translation = translations.find((t) => t.languageId === languageId);

  return (
    <ValidAuthorUI
      text={translation ? translation.name : <MissingAuthorTranslation />}
    />
  );
};

const ValidAuthorUI = ({ text }: { text: string | ReactElement }) => (
  <div>{text}</div>
);

const MissingAuthorTranslation = () => (
  <MissingTranslation tooltipText="missing author translation" />
);
