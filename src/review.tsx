import { createRoot } from "react-dom/client";
import { WelcomeEmail } from "./templates/welcome-email";
import { Wrapper } from "./templates/wrapper";
import { ResetPasswordEmail } from "./templates/reset-password-email";

createRoot(document.getElementById("root")!).render(
  <>
    <div style={{ border: "5px solid black", padding: 0, margin: "10px" }}>
      <Wrapper email="jane@example.com" username="janedoe">
        <WelcomeEmail code={"abcdefghi"} username="janedoe" />
      </Wrapper>
    </div>
    <div style={{ border: "5px solid black", padding: 0, margin: "10px" }}>
      <Wrapper email="jane@example.com" username="janedoe">
        <ResetPasswordEmail code={"abcdefghi"} username="janedoe" />
      </Wrapper>
    </div>
  </>
);
