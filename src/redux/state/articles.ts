import {
  PayloadAction,
  createEntityAdapter,
  nanoid,
  createSelector,
} from "@reduxjs/toolkit";

import { RootState } from "^redux/store";
import { articlesApi } from "^redux/services/articles";

import { createArticle } from "^data/createDocument";

import { Article } from "^types/article";
import { EntityPayloadGeneric } from "./types";

import createArticleLikeContentGenericSlice from "./higher-order-reducers/articleLikeContentGeneric";

type Entity = Article;

const adapter = createEntityAdapter<Entity>();
const initialState = adapter.getInitialState();

const slice = createArticleLikeContentGenericSlice({
  name: "articles",
  initialState,
  reducers: {
    undoOne: adapter.setOne,
    undoAll: adapter.setAll,
    addOne: {
      reducer(state, action: PayloadAction<Entity>) {
        const entity = action.payload;
        adapter.addOne(state, entity);
      },
      prepare() {
        return {
          payload: createArticle({
            id: nanoid(),
            translationId: nanoid(),
          }),
        };
      },
    },
    removeOne(state, action: PayloadAction<EntityPayloadGeneric>) {
      const { id } = action.payload;
      adapter.removeOne(state, id);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      articlesApi.endpoints.fetchArticles.matchFulfilled,
      (state, { payload }) => {
        adapter.upsertMany(state, payload);
      }
    );
    builder.addMatcher(
      articlesApi.endpoints.createArticle.matchFulfilled,
      (state, { payload }) => {
        adapter.addOne(state, payload.article);
      }
    );
    builder.addMatcher(
      articlesApi.endpoints.deleteArticle.matchFulfilled,
      (state, { payload }) => {
        adapter.removeOne(state, payload.id);
      }
    );
  },
});

export default slice.reducer;

export const {
  addBodySection,
  addTranslation,
  moveSection,
  removeBodySection,
  removeOne,
  removeTranslation,
  togglePublishStatus,
  undoAll,
  undoOne,
  updateBodyImageAspectRatio,
  updateBodyImageCaption,
  updateBodyImageSrc,
  updateBodyImageVertPosition,
  updateBodyText,
  updateBodyVideoCaption,
  updateBodyVideoSrc,
  updatePublishDate,
  updateSaveDate,
  updateTitle,
  updateCollectionSummary,
  updateLandingAutoSummary,
  updateLandingCustomSummary,
  addOne: addArticle,
  toggleUseSummaryImage,
  updateLandingCustomImageAspectRatio,
  updateLandingCustomImageVertPosition,
  updateSummaryImageSrc,
  updateSummaryImageVertPosition,
  addRelatedEntity,
  removeRelatedEntity,
} = slice.actions;

const {
  selectAll: selectArticles,
  selectById: selectArticleById,
  selectIds: selectArticlesIds,
  selectTotal: selectTotalArticles,
} = adapter.getSelectors((state: RootState) => state.articles);

// type SelectIdsAsserted = (args: Parameters<typeof selectIds>) => string[];
// const selectArticlesIds = selectIds as unknown as SelectIdsAsserted;

const selectArticlesByIds = createSelector(
  [selectArticles, (_state: RootState, ids: string[]) => ids],
  (articles, ids) => ids.map((id) => articles.find((s) => s.id === id))
);

export {
  selectArticles,
  selectArticleById,
  selectTotalArticles,
  selectArticlesIds,
  selectArticlesByIds,
};
