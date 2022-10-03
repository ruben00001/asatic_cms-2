import { ReactElement } from "react";
import tw from "twin.macro";

import { StickyProvider } from "^context/StickyContext";

import ContainerUtility from "^components/ContainerUtilities";

export default function ContentCanvas({
  children,
}: {
  children: ReactElement;
}) {
  return (
    <ContainerUtility.Height
      styles={tw`h-full grid place-items-center bg-gray-50 border-t-2 border-gray-200`}
    >
      {(containerHeight) =>
        containerHeight ? (
          <Canvas containerHeight={containerHeight}>{children}</Canvas>
        ) : null
      }
    </ContainerUtility.Height>
  );
}

const Canvas = ({
  children,
  containerHeight,
}: {
  children: ReactElement;
  containerHeight: number;
}) => {
  return (
    <StickyProvider>
      <main
        css={[
          tw`relative w-[95%] max-w-[720px] pl-lg pr-xl overflow-y-auto overflow-x-hidden bg-white shadow-md`,
        ]}
        style={{ height: containerHeight * 0.95 }}
      >
        {children}
      </main>
    </StickyProvider>
  );
};
