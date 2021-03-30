import { useObservable } from "../../hooks/use-observable";
import { authStoreObservable, isAuthorized } from "../../observables/auth";
import { LogoutButton } from "../logout-button";
import styled from "@emotion/styled";
import { NavLink } from "react-router-dom";
import React from "react";

const UserInfo = ({ userName }) => (
  <div>
    <span>{userName}</span>
  </div>
);

const HeaderContent = styled.div`
  display: flex;
  height: 80px;
  align-items: baseline;
`;

const NavigationItem = styled(NavLink)`
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
`;

const NavigationContent = styled.nav`
  display: flex;
  margin-left: 40px;
  ${NavigationItem} + ${NavigationItem} {
    margin-left: 20px;
  }
`;

const AuthContainer = styled.div`
  margin-left: auto;
  display: flex;

  * + * {
    margin-left: 10px;
  }
`;

function Navigation() {
  return (
    <NavigationContent>
      <NavigationItem to="/game-list">Games</NavigationItem>
      <NavigationItem to="/game">My Game</NavigationItem>
    </NavigationContent>
  );
}

export function Header() {
  const authState = useObservable(authStoreObservable);
  const userName = authState?.user?.name;

  return (
    <HeaderContent>
      <h3>Battle Ships</h3>
      <Navigation />
      <AuthContainer>
        {isAuthorized(authState) && (
          <>
            <UserInfo userName={userName} />
            <LogoutButton />
          </>
        )}
        {!isAuthorized(authState) && (
          <NavLink to="/login">SignIn/SignUp</NavLink>
        )}
      </AuthContainer>
    </HeaderContent>
  );
}
