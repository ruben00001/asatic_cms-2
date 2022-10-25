/* eslint-disable jsx-a11y/alt-text */
import CollectionSlice from "^context/collections/CollectionContext";
import ArticleSlice from "^context/articles/ArticleContext";
import ArticleTranslationSlice from "^context/articles/ArticleTranslationContext";

import { getImageFromArticleBody } from "^helpers/article-like";

import DocLanguages from "^components/DocLanguages";
import {
  Authors_,
  Date_,
  Title_,
  Image_,
} from "^components/pages/curated/_containers/entity-summary";
import { Text_ } from "^components/pages/curated/_containers/article-like/SummaryText_";
import { ToggleUseImageButton_ } from "^components/pages/curated/_containers/ImageMenu_";
import { $Container_ } from "../_presentation/$Summary_";
import { Menu_ } from "../_containers/Menu_";
import { $Title, $SubTitleContainer, $Text, $imageContainer } from "../_styles";

const Summary = () => {
  return (
    <$Container_>
      {(isHovered) => (
        <>
          <Image />
          <Title />
          <$SubTitleContainer>
            <Authors />
            <Date />
          </$SubTitleContainer>
          <Text />
          <Menu isShowing={isHovered} />
        </>
      )}
    </$Container_>
  );
};

export default Summary;

const Image = () => {
  const [
    { summaryImage },
    {
      toggleUseSummaryImage,
      updateSummaryImageSrc,
      updateSummaryImageVertPosition,
    },
  ] = ArticleSlice.useContext();
  const [{ body }] = ArticleTranslationSlice.useContext();

  const imageId = summaryImage.imageId || getImageFromArticleBody(body);

  return (
    <Image_
      containerStyles={$imageContainer}
      actions={{
        toggleUseImage: toggleUseSummaryImage,
        updateImageSrc: (imageId) => updateSummaryImageSrc({ imageId }),
        updateVertPosition: (vertPosition) =>
          updateSummaryImageVertPosition({ vertPosition }),
      }}
      data={{
        imageId,
        vertPosition: summaryImage.vertPosition || 50,
        isUsingImage: summaryImage.useImage,
      }}
    />
  );
};

const Title = () => {
  const [{ title }] = ArticleTranslationSlice.useContext();

  return (
    <$Title>
      <Title_ title={title} />
    </$Title>
  );
};

const Authors = () => {
  const [{ authorsIds }] = ArticleSlice.useContext();
  const [{ activeLanguageId }] = DocLanguages.useContext();

  return (
    <Authors_ activeLanguageId={activeLanguageId} authorsIds={authorsIds} />
  );
};

const Date = () => {
  const [{ publishDate }] = ArticleSlice.useContext();

  return <Date_ publishDate={publishDate} />;
};

const Text = () => {
  const [translation, { updateCollectionSummary }] =
    ArticleTranslationSlice.useContext();

  return (
    <$Text>
      <Text_
        translation={translation}
        updateDocCollectionSummary={(summary) =>
          updateCollectionSummary({ summary })
        }
      />
    </$Text>
  );
};

const Menu = ({ isShowing }: { isShowing: boolean }) => {
  const [{ id: collectionId }] = CollectionSlice.useContext();
  const [
    { summaryImage },
    { toggleUseSummaryImage, removeCollection, routeToEditPage },
  ] = ArticleSlice.useContext();

  return (
    <Menu_
      isShowing={isShowing}
      removeEntityFromCollection={() => removeCollection({ collectionId })}
      routeToEditPage={routeToEditPage}
      extraButtons={
        !summaryImage.useImage ? (
          <ToggleUseImageButton_ toggleUseImage={toggleUseSummaryImage} />
        ) : null
      }
    />
  );
};
