import useUpdateSubEntitiesInStoreOnParentDelete from "^hooks/useUpdateSubEntitiesInStoreOnParentDelete";
import { useDeleteArticleMutation } from "^redux/services/articles";

const useDeleteArticle = ({
  articleId,
  authorsIds,
  collectionsIds,
  deleteArticleFromDb,
  subjectsIds,
  tagsIds,
}: {
  deleteArticleFromDb: ReturnType<typeof useDeleteArticleMutation>[0];
  articleId: string;
  authorsIds: string[];
  collectionsIds: string[];
  subjectsIds: string[];
  tagsIds: string[];
}) => {
  // const [{ id: articleId, authorsIds, collectionsIds, subjectsIds, tagsIds }] =
  // ArticleSlice.useContext();
  // const [deleteArticleFromDb] = useDeleteArticleMutation();

  const props = {
    entityId: articleId,
    authorsIds,
    collectionsIds,
    subjectsIds,
    tagsIds,
  };

  const updateSubEntitiesInStore =
    useUpdateSubEntitiesInStoreOnParentDelete(props);

  const handleDelete = async () => {
    await deleteArticleFromDb({
      ...props,
      useToasts: true,
    });
    updateSubEntitiesInStore();
  };

  return handleDelete;
};

export default useDeleteArticle;