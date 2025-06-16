type Props = { code: string; username: string };

export function ManualOnboardingEmail({ code, username }: Props) {
  const link = `http://localhost/reset-password/${code}`;
  return (
    <>
      <h1>It's getting close!.</h1>
      <p>Hi {username},</p>
      <p>Thank you for joining our early access program.</p>
      <p>Your user profile has been created.</p>
      <p>
        Please click on{" "}
        <a href={link} style={{ color: "#0000aa" }}>
          this link
        </a>{" "}
        to reset your password and login.
      </p>
    </>
  );
}
