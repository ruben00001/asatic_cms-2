import RecordedEventSlice from "^context/recorded-events/RecordedEventContext";
import { useDeleteMutationContext } from "^context/DeleteMutationContext";

import useRecordedEventPageSaveUndo from "^hooks/pages/useRecordedEventPageTopControls";
import { useLeavePageConfirm } from "^hooks/useLeavePageConfirm";

import $Header_ from "../_presentation/$Header_";
import { $SaveText_, UndoButton_, SaveButton_ } from "^components/header";
import DocLanguages from "^components/DocLanguages";
import {
  HeaderAuthorsPopover_,
  HeaderCollectionsPopover_,
  HeaderEntityPageSettingsPopover_,
  HeaderPublishPopover_,
  HeaderSubectsPopover_,
  HeaderTagsPopover_,
} from "^components/header/popovers";

const entityType = "video document";

const Header = () => {
  const {
    handleSave: save,
    handleUndo: undo,
    isChange,
    saveMutationData,
  } = useRecordedEventPageSaveUndo();

  useLeavePageConfirm({ runConfirmOn: isChange });

  return (
    <$Header_
      entityLanguagesPopover={<LanguagesPopover />}
      publishPopover={<PublishPopover />}
      saveButton={
        <SaveButton_
          isChange={isChange}
          isLoadingSave={saveMutationData.isLoading}
          save={save}
        />
      }
      saveText={
        <$SaveText_ isChange={isChange} saveMutationData={saveMutationData} />
      }
      settingsPopover={<SettingsPopover />}
      subjectsPopover={<SubjectsPopover />}
      undoButton={
        <UndoButton_
          isChange={isChange}
          isLoadingSave={saveMutationData.isLoading}
          undo={undo}
        />
      }
      authorsPopover={<AuthorsPopover />}
      collectionsPopover={<CollectionsPopover />}
      tagsPopover={<TagsPopover />}
    />
  );
};

export default Header;

const PublishPopover = () => {
  const [{ publishStatus }, { togglePublishStatus }] =
    RecordedEventSlice.useContext();

  return (
    <HeaderPublishPopover_
      publishStatus={publishStatus}
      togglePublishStatus={togglePublishStatus}
    />
  );
};

const LanguagesPopover = () => {
  const [, { addTranslation, removeTranslation }] =
    RecordedEventSlice.useContext();

  return (
    <DocLanguages.Popover
      docType={entityType}
      addLanguageToDoc={(languageId) => addTranslation({ languageId })}
      removeLanguageFromDoc={(languageId) => removeTranslation({ languageId })}
    />
  );
};

const SubjectsPopover = () => {
  const [{ languagesIds, subjectsIds }, { addSubject, removeSubject }] =
    RecordedEventSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <HeaderSubectsPopover_
      parentData={{
        activeLanguageId,
        parentSubjectsIds: subjectsIds,
        parentLanguagesIds: languagesIds,
        parentType: entityType,
      }}
      parentActions={{
        addSubjectToParent: (subjectId) => addSubject({ subjectId }),
        removeSubjectFromParent: (subjectId) => removeSubject({ subjectId }),
      }}
    />
  );
};

const CollectionsPopover = () => {
  const [
    { languagesIds, collectionsIds },
    { addCollection, removeCollection },
  ] = RecordedEventSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <HeaderCollectionsPopover_
      parentData={{
        activeLanguageId,
        parentCollectionsIds: collectionsIds,
        parentLanguagesIds: languagesIds,
        parentType: entityType,
      }}
      parentActions={{
        addCollectionToParent: (collectionId) =>
          addCollection({ collectionId }),
        removeCollectionFromParent: (collectionId) =>
          removeCollection({ collectionId }),
      }}
    />
  );
};

const AuthorsPopover = () => {
  const [{ authorsIds, languagesIds }, { addAuthor, removeAuthor }] =
    RecordedEventSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <HeaderAuthorsPopover_
      parentData={{
        activeLanguageId,
        parentAuthorsIds: authorsIds,
        parentLanguagesIds: languagesIds,
        parentType: entityType,
      }}
      parentActions={{
        addAuthorToParent: (authorId) => addAuthor({ authorId }),
        removeAuthorFromParent: (authorId) => removeAuthor({ authorId }),
      }}
    />
  );
};

const TagsPopover = () => {
  const [{ tagsIds }, { addTag, removeTag }] = RecordedEventSlice.useContext();

  return (
    <HeaderTagsPopover_
      parentData={{
        parentTagsIds: tagsIds,
        parentType: entityType,
      }}
      parentActions={{
        addTagToParent: (tagId) => addTag({ tagId }),
        removeTagFromParent: (tagId) => removeTag({ tagId }),
      }}
    />
  );
};

const SettingsPopover = () => {
  const [{ id }] = RecordedEventSlice.useContext();
  const [deleteFromDb] = useDeleteMutationContext();

  return (
    <HeaderEntityPageSettingsPopover_
      deleteEntity={() => deleteFromDb({ id, useToasts: true })}
      entityType={entityType}
    />
  );
};