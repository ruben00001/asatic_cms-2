import { configureStore } from "@reduxjs/toolkit";

import { articlesApi } from "./services/articles";
import articlesReducer from "./state/articles";
import { authorsApi } from "./services/authors";
import authorsReducer from "./state/authors";
import { tagsApi } from "./services/tags";
import tagsReducer from "./state/tags";
import { languagesApi } from "./services/languages";
import languagesReducer from "./state/languages";
import { savePageApi } from "./services/saves";
import imagesReducer from "./state/images";
import { imagesApi } from "./services/images";
import { imageKeywordsApi } from "./services/imageKeywords";
import { landingApi } from "./services/landing";
import landingReducer from "./state/landing";

export const store = configureStore({
  reducer: {
    articles: articlesReducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    authors: authorsReducer,
    [authorsApi.reducerPath]: authorsApi.reducer,
    tags: tagsReducer,
    [tagsApi.reducerPath]: tagsApi.reducer,
    languages: languagesReducer,
    [languagesApi.reducerPath]: languagesApi.reducer,
    [savePageApi.reducerPath]: savePageApi.reducer,
    images: imagesReducer,
    [imagesApi.reducerPath]: imagesApi.reducer,
    [imageKeywordsApi.reducerPath]: imageKeywordsApi.reducer,
    [landingApi.reducerPath]: landingApi.reducer,
    landing: landingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      articlesApi.middleware,
      authorsApi.middleware,
      tagsApi.middleware,
      languagesApi.middleware,
      savePageApi.middleware,
      imagesApi.middleware,
      imageKeywordsApi.middleware,
      landingApi.middleware
    ),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
