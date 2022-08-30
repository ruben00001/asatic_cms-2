import {
  PayloadAction,
  createEntityAdapter,
  nanoid,
  createSelector,
} from "@reduxjs/toolkit";

import { blogsApi } from "^redux/services/blogs";

import { RootState } from "^redux/store";
import { Blog } from "^types/blog";
import { EntityPayloadGeneric } from "./types";

import createArticleLikeContentGenericSlice from "./higher-order-reducers/articleLikeContentGeneric";

import { createBlog } from "^data/createDocument";

type Entity = Blog;

const adapter = createEntityAdapter<Entity>();
const initialState = adapter.getInitialState();

const slice = createArticleLikeContentGenericSlice({
  name: "blogs",
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
          payload: createBlog({
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
      blogsApi.endpoints.fetchBlogs.matchFulfilled,
      (state, { payload }) => {
        adapter.upsertMany(state, payload);
      }
    );
    builder.addMatcher(
      blogsApi.endpoints.createBlog.matchFulfilled,
      (state, { payload }) => {
        adapter.addOne(state, payload.blog);
      }
    );
    builder.addMatcher(
      blogsApi.endpoints.deleteBlog.matchFulfilled,
      (state, { payload }) => {
        adapter.removeOne(state, payload.id);
      }
    );
  },
});

export default slice.reducer;

export const {
  addAuthor,
  addBodySection,
  addCollection,
  addSubject,
  addTag,
  addTranslation,
  removeAuthor,
  removeBodySection,
  removeCollection,
  removeOne,
  removeSubject,
  removeTag,
  removeTranslation,
  reorderBody,
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
  updateSummary,
  updateTitle,
} = slice.actions;

const {
  selectAll: selectBlogs,
  selectById: selectBlogById,
  selectIds,
  selectTotal: selectTotalBlogs,
} = adapter.getSelectors((state: RootState) => state.blogs);

type SelectIdsAsserted = (args: Parameters<typeof selectIds>) => string[];
const selectBlogsIds = selectIds as unknown as SelectIdsAsserted;

const selectBlogsByIds = createSelector(
  [selectBlogs, (_state: RootState, ids: string[]) => ids],
  (blogs, ids) => ids.map((id) => blogs.find((s) => s.id === id))
);

export {
  selectBlogs,
  selectBlogById,
  selectTotalBlogs,
  selectBlogsIds,
  selectBlogsByIds,
};
