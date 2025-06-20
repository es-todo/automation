import dom from "react-dom/server";
import { WelcomeEmail } from "./templates/welcome-email";
import { Wrapper } from "./templates/wrapper";
import { ResetPasswordEmail } from "./templates/reset-password-email";
import { objects } from "./objects";
import { ConfirmEmailEmail } from "./templates/confirm-email";
import { AccountEmailChangedEmail } from "./templates/account-email-changed-email";
import { UsernameChangedEmail } from "./templates/username-changed-email";
import { ManualOnboardingEmail } from "./templates/manual-onboarding-email";

type content = objects["email_message"]["content"];

type data = {
  content: content;
  email: string;
  username: string;
};

export const email_title: { [k in content["type"]]: string } = {
  welcome_email: "Welcome to our platform",
  confirm_email_email: "Confirm your email",
  reset_password_email: "Reset your password",
  account_email_changed_email: "Your email has been changed",
  username_changed_email: "Your username has been changed",
  manual_onboarding_email: "You're on Beta!",
};

function route({ username, content }: data) {
  switch (content.type) {
    case "welcome_email":
      return <WelcomeEmail code={content.code} username={username} />;
    case "reset_password_email":
      return <ResetPasswordEmail code={content.code} username={username} />;
    case "confirm_email_email":
      return <ConfirmEmailEmail code={content.code} username={username} />;
    case "account_email_changed_email":
      return (
        <AccountEmailChangedEmail
          new_email={content.new_email}
          username={username}
        />
      );
    case "username_changed_email":
      return (
        <UsernameChangedEmail
          old_username={content.old_username}
          username={username}
        />
      );
    case "manual_onboarding_email":
      return <ManualOnboardingEmail code={content.code} username={username} />;
    default: {
      const invalid: never = content;
      throw invalid;
    }
  }
}

export function render_template({ username, email, content }: data) {
  return dom.renderToString(
    <html>
      <body>
        <Wrapper email={email} username={username}>
          {route({ username, email, content })}
        </Wrapper>
      </body>
    </html>
  );
}
