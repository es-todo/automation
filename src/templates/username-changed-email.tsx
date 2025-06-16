type Props = { username: string; old_username: string };

export function UsernameChangedEmail({ username, old_username }: Props) {
  const link = `http://localhost/user/${username}`;
  return (
    <>
      <h1>Your username has been changed</h1>
      <p>Hi {username},</p>
      <p>
        Your old username, <b>@{old_username}</b>, is now changed to your new
        username <b>@{username}</b>.
      </p>
      <p>
        Here's a <a href={link}>link to your new profile page</a>.
      </p>
      <p>
        IMPORTANT: If you have not made this change, please login to your
        account and change it back immediately. If you have trouble accessing
        your account, please contact us immediately for assistance.
      </p>
    </>
  );
}
