import { createContext, ReactElement, useContext } from "react";

import { useDispatch } from "^redux/hooks";
import {
  addBodySection,
  reorderBody,
  removeBodySection,
  removeTranslation,
  updateSummary,
  updateTitle,
} from "^redux/state/blogs";

import { checkObjectHasField } from "^helpers/general";

import { OmitFromMethods } from "^types/utilities";
import { BlogTranslation } from "^types/blog";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function BlogTranslationSlice() {}

const actionsInitial = {
  addBodySection,
  reorderBody,
  removeBodySection,
  removeTranslation,
  updateSummary,
  updateTitle,
};

type ActionsInitial = typeof actionsInitial;

type Actions = OmitFromMethods<ActionsInitial, "id" | "translationId">;

type ContextValue = [translation: BlogTranslation, actions: Actions];
const Context = createContext<ContextValue>([{}, {}] as ContextValue);

BlogTranslationSlice.Provider = function BlogTranslationProvider({
  children,
  translation,
  blogId,
}: {
  children: ReactElement;
  translation: BlogTranslation;
  blogId: string;
}) {
  const { id: translationId } = translation;

  const dispatch = useDispatch();

  const sharedArgs = {
    id: blogId,
    translationId,
  };

  const actions: Actions = {
    addBodySection: (args) =>
      dispatch(addBodySection({ ...sharedArgs, ...args })),
    removeBodySection: (args) =>
      dispatch(removeBodySection({ ...sharedArgs, ...args })),
    removeTranslation: () => dispatch(removeTranslation({ ...sharedArgs })),
    reorderBody: (args) => dispatch(reorderBody({ ...sharedArgs, ...args })),
    updateSummary: (args) =>
      dispatch(updateSummary({ ...sharedArgs, ...args })),
    updateTitle: (args) => dispatch(updateTitle({ ...sharedArgs, ...args })),
  };

  const value = [translation, actions] as ContextValue;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

BlogTranslationSlice.useContext = function useBlogTranslationContext() {
  const context = useContext(Context);
  const contextIsEmpty = !checkObjectHasField(context[0]);
  if (contextIsEmpty) {
    throw new Error(
      "useBlogTranslationContext must be used within its provider!"
    );
  }
  return context;
};
