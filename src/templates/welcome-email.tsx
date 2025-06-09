type Props = { code: string; username: string };

export function WelcomeEmail({ code, username }: Props) {
  const link = `http://localhost/verify-email/${code}`;
  return (
    <>
      <h1>Username &ldquo;@{username}&rdquo; reserved!</h1>
      <p>Hi {username},</p>
      <p>Thank you for registering.</p>
      <p>
        Please click on{" "}
        <a href={link} style={{ color: "#0000aa" }}>
          this link
        </a>{" "}
        to verify your email.
      </p>
    </>
  );
}
