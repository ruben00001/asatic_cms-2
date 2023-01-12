import tw from "twin.macro";
import { toast } from "react-toastify";

import ContentMenu from "^components/menus/Content";
import {
  GoToPageIcon,
  NarrowIcon,
  RemoveRelatedEntityIcon,
  TurnOnIcon,
  WidenIcon,
} from "^components/Icons";

export type ArticleLikeMenu_Props = {
  routeToEntityPage: () => void;
  usingImage: boolean;
  toggleUseImageOn: () => void;
  updateComponentSpan: (span: 1 | 2) => void;
  span: 1 | 2;
  ignoreDeclaredSpan: boolean;
  isShowing: boolean;
  removeComponent: () => void;
};

export const ArticleLikeMenu_ = ({
  routeToEntityPage,
  isShowing,
  usingImage,
  toggleUseImageOn,
  ignoreDeclaredSpan,
  removeComponent,
  updateComponentSpan,
  span,
}: ArticleLikeMenu_Props) => {
  const canNarrow = !ignoreDeclaredSpan && span === 2;
  const canWiden = !ignoreDeclaredSpan && span === 1;

  return (
    <ContentMenu show={isShowing} styles={tw`absolute left-0 top-sm`}>
      <ContentMenu.ButtonWithWarning
        tooltipProps={{ text: "remove component", type: "action" }}
        warningProps={{
          callbackToConfirm: () => {
            removeComponent();
            toast.success("removed");
          },
          warningText: "Remove component?",
        }}
      >
        <RemoveRelatedEntityIcon />
      </ContentMenu.ButtonWithWarning>
      <ContentMenu.VerticalBar />
      <ContentMenu.Button
        onClick={routeToEntityPage}
        tooltipProps={{ text: "go to article page" }}
      >
        <GoToPageIcon />
      </ContentMenu.Button>
      <ContentMenu.VerticalBar />
      <ContentMenu.Button
        isDisabled={!canWiden}
        onClick={() => canWiden && updateComponentSpan(2)}
        tooltipProps={{
          text: "widen",
          type: "action",
        }}
      >
        <WidenIcon />
      </ContentMenu.Button>
      <ContentMenu.Button
        isDisabled={!canNarrow}
        onClick={() => canNarrow && updateComponentSpan(1)}
        tooltipProps={{
          text: "narrow",
          type: "action",
        }}
      >
        <NarrowIcon />
      </ContentMenu.Button>
      {!usingImage ? (
        <>
          <ContentMenu.VerticalBar />
          <ContentMenu.Button
            onClick={toggleUseImageOn}
            tooltipProps={{ text: "use image" }}
          >
            <TurnOnIcon />
          </ContentMenu.Button>
        </>
      ) : (
        <></>
      )}
    </ContentMenu>
  );
};