import ArticleSlice from "^context/articles/ArticleContext";
import { useDeleteMutationContext } from "^context/DeleteMutationContext";

import useArticlePageSaveUndo from "^hooks/pages/useArticlePageTopControls";
import { useLeavePageConfirm } from "^hooks/useLeavePageConfirm";

import $Header_ from "../_presentation/$Header_";
import { $SaveText_, UndoButton_, SaveButton_ } from "^components/header";
import DocLanguages from "^components/DocLanguages";
import {
  AuthorsPopover_,
  CollectionsPopover_,
  PublishPopover_,
  EntityPageSettingsPopover_ as SettingsPopover_,
  SubjectsPopover_,
  TagsPopover_,
} from "^components/rich-popover";
import {
  AuthorsHeaderButton,
  CollectionsHeaderButton,
  SubjectsHeaderButton,
  TagsHeaderButton,
  HeaderDeployButton,
  HeaderPublishButton,
} from "^components/header/popover-buttons";

const entityType = "article";

const Header = () => {
  const {
    handleSave: save,
    handleUndo: undo,
    isChange,
    saveMutationData,
  } = useArticlePageSaveUndo();

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
    ArticleSlice.useContext();

  return (
    <PublishPopover_
      publishStatus={publishStatus}
      togglePublishStatus={togglePublishStatus}
    >
      <HeaderPublishButton />
    </PublishPopover_>
  );
};

const LanguagesPopover = () => {
  const [, { addTranslation, removeTranslation }] = ArticleSlice.useContext();

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
    ArticleSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <SubjectsPopover_
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
    >
      <SubjectsHeaderButton />
    </SubjectsPopover_>
  );
};

const CollectionsPopover = () => {
  const [
    { languagesIds, collectionsIds },
    { addCollection, removeCollection },
  ] = ArticleSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <CollectionsPopover_
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
    >
      <CollectionsHeaderButton />
    </CollectionsPopover_>
  );
};

const AuthorsPopover = () => {
  const [{ authorsIds, languagesIds }, { addAuthor, removeAuthor }] =
    ArticleSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <AuthorsPopover_
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
    >
      <AuthorsHeaderButton />
    </AuthorsPopover_>
  );
};

const TagsPopover = () => {
  const [{ tagsIds }, { addTag, removeTag }] = ArticleSlice.useContext();

  return (
    <TagsPopover_
      parentData={{
        parentTagsIds: tagsIds,
        parentType: entityType,
      }}
      parentActions={{
        addTagToParent: (tagId) => addTag({ tagId }),
        removeTagFromParent: (tagId) => removeTag({ tagId }),
      }}
    >
      <TagsHeaderButton />
    </TagsPopover_>
  );
};

const SettingsPopover = () => {
  const [{ id }] = ArticleSlice.useContext();
  const [deleteFromDb] = useDeleteMutationContext();

  return (
    <SettingsPopover_
      deleteEntity={() => deleteFromDb({ id, useToasts: true })}
      entityType={entityType}
    >
      <HeaderDeployButton />
    </SettingsPopover_>
  );
};
