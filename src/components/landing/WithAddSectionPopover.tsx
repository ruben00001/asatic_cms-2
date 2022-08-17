import {
  Article as ArticleIcon,
  Camera,
  CirclesFour,
  Notepad,
  Robot as RobotIcon,
  User as UserIcon,
} from "phosphor-react";
import { createContext, ReactElement, useContext } from "react";

import { useDispatch, useSelector } from "^redux/hooks";
import { addOne, selectAll as selectLanding } from "^redux/state/landing";

import { LandingSectionAuto } from "^types/landing";

import WithProximityPopover from "^components/WithProximityPopover";

import { checkObjectHasField } from "^helpers/general";
import ContentMenu from "^components/menus/Content";

type ContextValue = { newSectionIndex: number };
const Context = createContext<ContextValue>({} as ContextValue);

const ComponentProvider = ({
  children,
  ...value
}: { children: ReactElement } & ContextValue) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const useComponentContext = () => {
  const context = useContext(Context);
  const contextIsPopulated = checkObjectHasField(context);
  if (!contextIsPopulated) {
    throw new Error("useComponentContext must be used within its provider!");
  }
  return context;
};

const WithAddLandingSectionPopover = ({
  children,
  ...contextProps
}: {
  children: ReactElement;
} & ContextValue) => {
  return (
    <WithProximityPopover
      panel={
        <ComponentProvider {...contextProps}>
          <Panel />
        </ComponentProvider>
      }
    >
      {children}
    </WithProximityPopover>
  );
};

export default WithAddLandingSectionPopover;

const Panel = () => {
  return (
    <ContentMenu show={true}>
      <AddUserCreatedSectionButton />
      <AddAutoCreatedSectionPopover />
    </ContentMenu>
  );
};

const AddUserCreatedSectionButton = () => {
  const { newSectionIndex } = useComponentContext();

  const dispatch = useDispatch();

  const addUserCreatedSection = () =>
    dispatch(addOne({ type: "custom", index: newSectionIndex }));

  return (
    <ContentMenu.Button
      onClick={addUserCreatedSection}
      tooltipProps={{
        text: {
          header: "user-created",
          body: "Add any type of document and edit its size.",
        },
        type: "action",
      }}
    >
      <UserIcon />
    </ContentMenu.Button>
  );
};

const AddAutoCreatedSectionPopover = () => (
  <WithProximityPopover panel={<AddAutoCreatedSectionPanel />}>
    <ContentMenu.Button
      tooltipProps={{
        text: {
          header: "auto-created",
          body: "Choose from document types, e.g. articles, and a swipeable section will be created.",
        },
        placement: "top",
      }}
    >
      <RobotIcon />
    </ContentMenu.Button>
  </WithProximityPopover>
);

const AddAutoCreatedSectionPanel = () => {
  const { newSectionIndex } = useComponentContext();

  const landingSections = useSelector(selectLanding);
  const usedAutoLandingSectionsContentTypes = landingSections
    .flatMap((s) => (s.type === "auto" ? [s] : []))
    .map((s) => s.contentType);

  const isArticleSection =
    usedAutoLandingSectionsContentTypes.includes("article");
  const isBlogSection = usedAutoLandingSectionsContentTypes.includes("blog");
  const isRecordedEventSection =
    usedAutoLandingSectionsContentTypes.includes("recorded-event");
  const isCollectionSection =
    usedAutoLandingSectionsContentTypes.includes("collections");

  const dispatch = useDispatch();

  const addAutoSection = (contentType: LandingSectionAuto["contentType"]) =>
    dispatch(addOne({ type: "auto", index: newSectionIndex, contentType }));

  return (
    <ContentMenu show={true}>
      <ContentMenu.Button
        onClick={() => addAutoSection("article")}
        tooltipProps={{
          text: isArticleSection ? "already used" : "article",
          type: "action",
        }}
        isDisabled={isArticleSection}
      >
        <ArticleIcon />
      </ContentMenu.Button>
      <ContentMenu.Button
        isDisabled={isBlogSection}
        onClick={() => addAutoSection("blog")}
        tooltipProps={{
          text: isBlogSection ? "already used" : "blog",
          type: "action",
        }}
      >
        <Notepad />
      </ContentMenu.Button>
      <ContentMenu.Button
        isDisabled={isRecordedEventSection}
        onClick={() => addAutoSection("recorded-event")}
        tooltipProps={{
          text: isRecordedEventSection ? "already used" : "recorded-event",
          type: "action",
        }}
      >
        <Camera />
      </ContentMenu.Button>
      <ContentMenu.Button
        isDisabled={isCollectionSection}
        onClick={() => addAutoSection("collections")}
        tooltipProps={{
          text: isCollectionSection ? "already used" : "collections",
          type: "action",
        }}
      >
        <CirclesFour />
      </ContentMenu.Button>
    </ContentMenu>
  );
};