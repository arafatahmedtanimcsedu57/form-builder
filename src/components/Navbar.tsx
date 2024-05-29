import React, { PropsWithChildren } from "react";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { removeToken } from "../redux/auth/token";

import Logo from "./../assets/img-logo.png";

interface NavbarProps {}

const Navbar: React.FC<PropsWithChildren<NavbarProps>> = ({}) => {
  const authToken = useAppSelector((state) => state.user.access.token);
  const dispatch = useAppDispatch();

  const handleLogout = () => dispatch(removeToken({ action: "LOG ME OUT" }));

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom">
        <div className="container">
          <a
            href="/"
            className="navbar-brand d-flex align-align-items-center gap-2"
          >
            <img src={Logo} alt="logo" width="40px" height="40px" />
            <span className="p-2 fw-bold lh-sm">Form Builder</span>
          </a>

          {authToken ? (
            <span onClick={() => handleLogout()} className="btn navbar-text">
              Logout
            </span>
          ) : (
            <></>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
