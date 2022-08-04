import { createContext, ReactElement, useContext } from "react";

import { useDispatch } from "^redux/hooks";
import { updateBodyTextContent } from "^redux/state/articles";

import { checkObjectHasField } from "^helpers/general";

import { ArticleTextSection } from "^types/article";
import { OmitFromMethods } from "^types/utilities";

const actionsInitial = {
  updateBodyTextContent,
};

type ActionsInitial = typeof actionsInitial;

type Actions = OmitFromMethods<
  ActionsInitial,
  "id" | "translationId" | "sectionId"
>;

type ContextValue = [section: ArticleTextSection, actions: Actions];
const Context = createContext<ContextValue>([{}, {}] as ContextValue);

const ArticleTranslationBodyTextSectionProvider = ({
  children,
  translationId,
  articleId,
  section,
}: {
  children: ReactElement;
  translationId: string;
  articleId: string;
  section: ArticleTextSection;
}) => {
  const { id: sectionId } = section;

  const dispatch = useDispatch();

  const sharedArgs = {
    id: articleId,
    translationId,
    sectionId,
  };

  const actions: Actions = {
    updateBodyTextContent: (args) =>
      dispatch(updateBodyTextContent({ ...sharedArgs, ...args })),
  };

  const value = [section, actions] as ContextValue;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const useArticleTranslationBodyTextSectionContext = () => {
  const context = useContext(Context);
  const contextIsEmpty = !checkObjectHasField(context[0]);
  if (contextIsEmpty) {
    throw new Error(
      "useArticleTranslationBodyTextSectionContext must be used within its provider!"
    );
  }
  return context;
};

export {
  ArticleTranslationBodyTextSectionProvider,
  useArticleTranslationBodyTextSectionContext,
};
