import React from "react";
import {
  Layout,
  // @ts-ignore
} from "@bobaboard/ui-components";
import SideMenu from "../components/SideMenu";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../components/Auth";
// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const { isPending, user } = useAuth();

  return (
    <div className="main">
      <LoginModal isOpen={loginOpen} onCloseModal={() => setLoginOpen(false)} />
      <Layout
        mainContent={
          <div className="main">
            <h1>Welcome to BobaBoard!</h1>
            <p>I haven't implemented this main page yet! Woops.</p>
            <p>
              Please open the menu to the side and click on a board to get
              started.
            </p>
            <style jsx>{`
              .main {
                margin: 20px auto;
                width: 100%;
                color: white;
                text-align: center;
              }
            `}</style>
          </div>
        }
        sideMenuContent={<SideMenu />}
        title={`Hello!`}
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
        onUserBarClick={() => setLoginOpen(true)}
        user={user}
        loading={isPending}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}

export default HomePage;
