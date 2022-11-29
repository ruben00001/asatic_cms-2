import tw from "twin.macro";
import AuthorSlice from "^context/authors/AuthorContext";
import useUpdateStoreRelatedEntitiesOnDelete from "^hooks/authors/useUpdateStoreRelatedEntitiesOnDelete";
import { Author as AuthorType } from "^types/author";
import { useDeleteMutationContext } from "../../../DeleteMutationContext";
import Controls from "./Controls";
import RelatedDocumentsSection from "./related-documents";
import Translations from "./translations";

// todo: save for this page.

const Author = ({ author }: { author: AuthorType }) => {
  return (
    <AuthorSlice.Provider author={author}>
      <Content />
    </AuthorSlice.Provider>
  );
};

export default Author;

const Content = () => {
  const [deleteAuthorFromDb] = useDeleteMutationContext();
  const [{ id: authorId, articlesIds, blogsIds, recordedEventsIds }] =
    AuthorSlice.useContext();
  const updateStoreRelatedEntitiesOnDelete =
    useUpdateStoreRelatedEntitiesOnDelete();

  const handleDelete = async () => {
    await deleteAuthorFromDb({
      id: authorId,
      subEntities: { articlesIds, blogsIds, recordedEventsIds },
      useToasts: false,
    });
    updateStoreRelatedEntitiesOnDelete();
  };

  return (
    <div css={[tw`flex`]} className="group">
      <div>
        <Controls deleteEntity={handleDelete} entityName="author" />
      </div>
      <div css={[tw`mr-sm`]}>
        <div css={[tw`w-[3px] h-[25px] bg-green-200`]} />
      </div>
      <div css={[tw`flex-grow`]}>
        <Translations />
        <div css={[tw`mt-md`]}>
          <RelatedDocumentsSection />
        </div>
      </div>
    </div>
  );
};
