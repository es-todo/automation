type Props = { code: string; username: string };

export function ConfirmEmailEmail({ code, username }: Props) {
  const link = `http://localhost/verify-email/${code}`;
  return (
    <>
      <h1>Confirm Your Email</h1>
      <p>Hi {username},</p>
      <p>Your account is now associated with this email.</p>
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
