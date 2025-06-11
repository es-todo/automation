import dom from "react-dom/server";
import { WelcomeEmail } from "./templates/welcome-email";
import { Wrapper } from "./templates/wrapper";
import { ResetPasswordEmail } from "./templates/reset-password-email";

type data = {
  type: "welcome_email" | "reset_password_email";
  code: string;
  username: string;
  email: string;
};

function route(data: data) {
  switch (data.type) {
    case "welcome_email":
      return <WelcomeEmail code={data.code} username={data.username} />;
    case "reset_password_email":
      return <ResetPasswordEmail code={data.code} username={data.username} />;
    default:
      throw new Error(`unhandled ${data.type}`);
  }
}

export function render_template(data: data) {
  return dom.renderToString(
    <html>
      <body>
        <Wrapper email={data.email} username={data.username}>
          {route(data)}
        </Wrapper>
      </body>
    </html>
  );
}
