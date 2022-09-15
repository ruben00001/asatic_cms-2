import tw from "twin.macro";

import BlogSlice from "^context/blogs/BlogContext";

import { MyOmit } from "^types/utilities";

import DocLanguages from "^components/DocLanguages";

import PublishPopoverUnpopulated from "^components/header/PublishPopover";
import SubjectsPopoverUnpopulated from "^components/header/SubjectsPopover";
import TagsPopoverUnpopulated from "^components/header/TagsPopover";
import SaveTextUI, {
  Props as SaveTextProps,
} from "^components/header/SaveTextUI";
import { HeaderGeneric } from "^components/header/Header";
import HeaderUI from "^components/header/HeaderUI";
import SettingsPopoverUnpopulated from "^components/header/SettingsPopover";
import UndoButton, {
  Props as UndoButtonProps,
} from "^components/header/UndoButton";
import SaveButton, {
  Props as SaveButtonProps,
} from "^components/header/SaveButton";
import CollectionsPopoverUnpopulated from "^components/header/CollectionsPopover";
import AuthorsPopoverUnpopulated from "^components/header/AuthorsPopover";

type Props = MyOmit<SaveButtonProps, "isLoadingSave"> &
  SaveTextProps &
  MyOmit<UndoButtonProps, "isLoadingSave">;

const Header = ({ isChange, save, saveMutationData, undo }: Props) => {
  return (
    <HeaderGeneric
      leftElements={
        <>
          <HeaderUI.DefaultButtonSpacing>
            <PublishPopover />
            <DocLanguagesPopover />
          </HeaderUI.DefaultButtonSpacing>
          <div css={[tw`ml-md`]}>
            <SaveTextUI
              isChange={isChange}
              saveMutationData={saveMutationData}
            />
          </div>
        </>
      }
      rightElements={
        <HeaderUI.DefaultButtonSpacing>
          <SubjectsPopover />
          <CollectionsPopover />
          <HeaderUI.VerticalBar />
          <AuthorsPopover />
          <HeaderUI.VerticalBar />
          <TagsPopover />
          <HeaderUI.VerticalBar />
          <UndoButton
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
            undo={undo}
          />
          <SaveButton
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
            save={save}
          />
          <HeaderUI.VerticalBar />
          <SettingsPopover />
        </HeaderUI.DefaultButtonSpacing>
      }
    />
  );
};

export default Header;

const PublishPopover = () => {
  const [{ publishStatus }, { togglePublishStatus }] = BlogSlice.useContext();

  return (
    <PublishPopoverUnpopulated
      isPublished={publishStatus === "published"}
      toggleStatus={togglePublishStatus}
    />
  );
};

const DocLanguagesPopover = () => {
  const [, { addTranslation, removeTranslation }] = BlogSlice.useContext();

  return (
    <DocLanguages.Popover
      docType="blog"
      addLanguageToDoc={(languageId) => addTranslation({ languageId })}
      removeLanguageFromDoc={(languageId) => removeTranslation({ languageId })}
    />
  );
};

const SubjectsPopover = () => {
  const [{ languagesIds, subjectsIds }, { addSubject, removeSubject }] =
    BlogSlice.useContext();
  const { activeLanguageId } = DocLanguages.useContext();

  return (
    <SubjectsPopoverUnpopulated
      docActiveLanguageId={activeLanguageId}
      docLanguagesById={languagesIds}
      docSubjectsById={subjectsIds}
      docType="blog"
      onAddSubjectToDoc={(subjectId) => addSubject({ subjectId })}
      onRemoveSubjectFromDoc={(subjectId) => removeSubject({ subjectId })}
    />
  );
};

const CollectionsPopover = () => {
  const [
    { languagesIds, collectionsIds },
    { addCollection, removeCollection },
  ] = BlogSlice.useContext();
  const { activeLanguageId } = DocLanguages.useContext();

  return (
    <CollectionsPopoverUnpopulated
      docActiveLanguageId={activeLanguageId}
      docLanguagesById={languagesIds}
      docCollectionsById={collectionsIds}
      docType="blog"
      onAddCollectionToDoc={(collectionId) => addCollection({ collectionId })}
      onRemoveCollectionFromDoc={(collectionId) =>
        removeCollection({ collectionId })
      }
    />
  );
};

const AuthorsPopover = () => {
  const [{ authorsIds, languagesIds }, { addAuthor, removeAuthor }] =
    BlogSlice.useContext();
  const { activeLanguageId } = DocLanguages.useContext();

  return (
    <AuthorsPopoverUnpopulated
      docActiveLanguageId={activeLanguageId}
      docAuthorIds={authorsIds}
      docLanguageIds={languagesIds}
      onAddAuthorToDoc={(authorId) => addAuthor({ authorId })}
      onRemoveAuthorFromDoc={(authorId) => removeAuthor({ authorId })}
    />
  );
};

const TagsPopover = () => {
  const [{ tagsIds }, { addTag, removeTag }] = BlogSlice.useContext();

  return (
    <TagsPopoverUnpopulated
      docTagsById={tagsIds}
      docType="collection"
      onRemoveFromDoc={(tagId) => removeTag({ tagId })}
      onAddToDoc={(tagId) => addTag({ tagId })}
    />
  );
};

const SettingsPopover = () => {
  const [, { removeOne }] = BlogSlice.useContext();

  return (
    <SettingsPopoverUnpopulated
      deleteDocFunc={removeOne}
      docType="collection"
    />
  );
};
