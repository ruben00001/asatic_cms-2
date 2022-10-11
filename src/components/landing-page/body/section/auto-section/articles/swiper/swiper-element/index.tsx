import { ReactElement } from "react";

import { useSelector } from "^redux/hooks";
import { selectArticleById } from "^redux/state/articles";

import ArticleSlice from "^context/articles/ArticleContext";
import ArticleTranslationSlice from "^context/articles/ArticleTranslationContext";

import { selectTranslationForActiveLanguage } from "^helpers/displayContent";

import { Article as ArticleType } from "^types/article";

import SiteLanguage from "^components/SiteLanguage";
import { $SwiperElement } from "../../../_presentation";
import Article from "./Article";

const SwiperElement = ({ articleId }: { articleId: string }) => {
  const article = useSelector((state) => selectArticleById(state, articleId))!;

  return (
    <$SwiperElement>
      {(isHovered) => (
        <>
          <ArticleProviders article={article} key={article.id}>
            <Article />
          </ArticleProviders>
        </>
      )}
    </$SwiperElement>
  );
};

export default SwiperElement;

const ArticleProviders = ({
  article,
  children,
}: {
  children: ReactElement;
  article: ArticleType;
}) => {
  const { id: siteLanguageId } = SiteLanguage.useContext();

  return (
    <ArticleSlice.Provider article={article} key={article.id}>
      {([{ id: articleId, translations }]) => (
        <ArticleTranslationSlice.Provider
          articleId={articleId}
          translation={selectTranslationForActiveLanguage(
            translations,
            siteLanguageId
          )}
        >
          {children}
        </ArticleTranslationSlice.Provider>
      )}
    </ArticleSlice.Provider>
  );
};

/*           {article ? (
            <ArticleProviders article={article} key={article.id}>
              <Article />
            </ArticleProviders>
          ) : (
            <Missing />
          )} */
