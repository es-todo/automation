import { createRoot } from "react-dom/client";
import { WelcomeEmail } from "./templates/welcome-email";
import { Wrapper } from "./templates/wrapper";

createRoot(document.getElementById("root")!).render(
  <div style={{ border: "5px solid black", padding: 0, margin: "10px" }}>
    <Wrapper email="jane@example.com" username="janedoe">
      <WelcomeEmail code={"abcdefghi"} username="janedoe" />
    </Wrapper>
  </div>
);
