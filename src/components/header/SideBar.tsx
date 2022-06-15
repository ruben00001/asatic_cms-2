import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  ArrowRight,
  Article,
  GitBranch,
  List,
  PenNib,
  SignOut,
  Translate,
} from "phosphor-react";
import { ReactElement } from "react";
import tw, { css } from "twin.macro";
import { ROUTES } from "^constants/routes";
import s_button from "^styles/button";

// tags, languages, authors

const SideBar = () => {
  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button css={[s_top.button]}>
            <List />
          </Menu.Button>
          <Transition
            as="div"
            show={open}
            css={[s_top.panelShell]}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0 -translate-x-full"
            enterTo="transform opacity-100 translate-x-0"
            leave="transition duration-100 ease-out"
            leaveFrom="transform opacity-100 translate-x-0"
            leaveTo="transform opacity-0 -translate-x-full"
          >
            <Menu.Items css={[s_top.itemsContainer]}>
              <Content />
            </Menu.Items>
          </Transition>
          <Transition
            as="div"
            show={open}
            css={[s_top.overlay]}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-100 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          />
        </>
      )}
    </Menu>
  );
};

export default SideBar;

const s_top = {
  button: css`
    ${s_button.icon} ${s_button.selectors} ${tw`text-2xl `}
  `,
  panelShell: tw`z-50 fixed top-0 left-0 h-screen`,
  itemsContainer: tw`bg-white py-sm pl-md pr-3xl border-r-2 h-full`,
  overlay: tw`z-40 fixed inset-0 bg-overlayMid`,
};

const routeData = [
  { name: "articles", route: ROUTES.ARTICLES, icon: <Article /> },
];

const Content = () => {
  return (
    <div css={[tw`flex flex-col gap-3xl h-full`]}>
      <div css={[tw`flex flex-col gap-xl items-start`]}>
        <div css={[tw`uppercase font-medium text-2xl`]}>Asatic</div>
        <div>
          {routeData.map((rd) => (
            <PageLink icon={rd.icon} route={"/" + rd.route} key={rd.name}>
              {rd.name}
            </PageLink>
          ))}
        </div>
        <div css={[tw`flex flex-col gap-sm items-start`]}>
          {[
            { type: "author", text: "authors", icon: <PenNib /> },
            { type: "languages", text: "languages", icon: <Translate /> },
            { type: "tags", text: "tags", icon: <GitBranch /> },
          ].map((item) => (
            <PageLink icon={item.icon} route="" key={item.type}>
              {item.text}
            </PageLink>
          ))}
        </div>
      </div>
      <div>
        <Logout />
      </div>
    </div>
  );
};

const PageLink = ({
  icon,
  route,
  children,
}: {
  children: string;
  route: string;
  icon: ReactElement;
}) => {
  return (
    <Menu.Item>
      <Link href={route}>
        <a css={[s_pageLink.item]} className="group">
          <span css={[s_pageLink.icon]}>{icon}</span>
          <span css={[s_pageLink.text]}>{children}</span>
          <span css={[s_pageLink.linkArrowIcon]}>
            <ArrowRight />
          </span>
        </a>
      </Link>
    </Menu.Item>
  );
};

const s_pageLink = {
  item: tw`flex gap-sm items-center cursor-pointer capitalize text-gray-600`,
  text: tw`hover:text-gray-800 transition-colors ease-in-out duration-75`,
  icon: tw`text-2xl text-gray-400`,
  linkArrowIcon: tw`text-xl translate-x-0 group-hover:translate-x-1 group-hover:opacity-100 opacity-0 text-blue-500 transition-all duration-75 ease-in-out`,
};

const Logout = () => {
  return (
    <button
      css={[s_pageLink.item]}
      className="group"
      onClick={() => null}
      type="button"
    >
      <span
        css={[
          s_pageLink.icon,
          tw`group-hover:text-red-warning transition-colors ease-in-out duration-75`,
        ]}
      >
        <SignOut />
      </span>
      <span css={[s_pageLink.text]}>Logout</span>
    </button>
  );
};