type Props = { code: string; username: string };

export function ResetPasswordEmail({ code, username }: Props) {
  const link = `http://localhost/reset-password/${code}`;
  return (
    <>
      <h1>Reset your password.</h1>
      <p>Hi {username},</p>
      <p>A password reset code was requested to be sent to you.</p>
      <p>
        Please click on{" "}
        <a href={link} style={{ color: "#0000aa" }}>
          this link
        </a>{" "}
        to reset your password.
      </p>
    </>
  );
}
