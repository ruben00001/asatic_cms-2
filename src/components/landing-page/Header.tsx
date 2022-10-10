import useLandingPageTopControls from "^hooks/pages/useLandingPageTopControls";
import { useLeavePageConfirm } from "^hooks/useLeavePageConfirm";

import HeaderGeneric from "^components/header/Header";
import HeaderUI from "^components/header/HeaderUI";
import SaveTextUI from "^components/header/mutation-text/SaveTextUI";
import SaveButton from "^components/header/SaveButton";
import UndoButton from "^components/header/UndoButton";
import SiteLanguage from "^components/SiteLanguage";

const Header = () => {
  const { handleSave, handleUndo, isChange, saveMutationData } =
    useLandingPageTopControls();

  useLeavePageConfirm({ runConfirmOn: isChange });

  return (
    <HeaderGeneric
      leftElements={
        <>
          <SiteLanguage.Popover />
          <HeaderUI.MutationTextContainer>
            <SaveTextUI
              isChange={isChange}
              saveMutationData={saveMutationData}
            />
          </HeaderUI.MutationTextContainer>
        </>
      }
      rightElements={
        <HeaderUI.DefaultButtonSpacing>
          <UndoButton
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
            undo={handleUndo}
          />
          <SaveButton
            isChange={isChange}
            isLoadingSave={saveMutationData.isLoading}
            save={handleSave}
          />
        </HeaderUI.DefaultButtonSpacing>
      }
    />
  );
};

export default Header;
