type Props = { username: string; new_email: string };

export function AccountEmailChangedEmail({ username, new_email }: Props) {
  return (
    <>
      <h1>Your email has been changed</h1>
      <p>Hi {username},</p>
      <p>
        The email associated with your account has changed to {new_email}. You
        will shortly receive an email on {new_email} to verify.
      </p>
      <p>
        IMPORTANT: If you have not made this change, please login to your
        account and change it back immediately. If you have trouble accessing
        your account, please contact us immediately for assistance.
      </p>
    </>
  );
}
