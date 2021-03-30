import { Header } from "../header";
import styled from "@emotion/styled";

const PageLayoutContent = styled.div`
  padding: 32px;
  padding-top: 16px;
`;

export function PageLayout({ children }) {
  return (
    <PageLayoutContent>
      <Header />
      {children}
    </PageLayoutContent>
  );
}
