import { PropsWithChildren } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

type Props = PropsWithChildren & {
  email: string;
  username: string;
};

export function Wrapper({ email, username, children }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <Header />
      {children}
      <Footer email={email} username={username} />
    </div>
  );
}
