import { ReactElement } from "react";

import { useSelector } from "^redux/hooks";
import { selectDocSubjectsStatus } from "^redux/state/complex-selectors/subjects";

import Popover from "^components/ProximityPopover";
import {
  ComponentContextValue,
  ComponentProvider,
  useComponentContext,
} from "./Context";
import Panel from "./panel";

export function SubjectsPopover_({
  children: button,
  ...contextProps
}: {
  children: ReactElement;
  parentData: ComponentContextValue[0];
  parentActions: ComponentContextValue[1];
}) {
  return (
    <Popover>
      <ComponentProvider {...contextProps}>
        <>
          <Popover.Panel>
            <Panel />
          </Popover.Panel>
          <Popover.Button>{button}</Popover.Button>
        </>
      </ComponentProvider>
    </Popover>
  );
}

export type SubjectsPopoverButtonProps = {
  children:
    | ReactElement
    | (({
        subjectStatus,
      }: {
        subjectStatus: ReturnType<typeof selectDocSubjectsStatus>;
      }) => ReactElement);
};

export function SubjectsPopoverButton_({
  children,
}: SubjectsPopoverButtonProps) {
  const [{ parentSubjectsIds: parentSubjectsIds, parentLanguagesIds }] =
    useComponentContext();
  const subjectStatus = useSelector((state) =>
    selectDocSubjectsStatus(state, parentSubjectsIds, parentLanguagesIds)
  );

  return typeof children === "function"
    ? children({ subjectStatus: subjectStatus })
    : children;
}
