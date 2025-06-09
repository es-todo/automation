type Props = { email: string; username?: string };

export function Footer({ email, username }: Props) {
  return (
    <div
      style={{
        fontSize: "small",
        color: "#808080",
        textAlign: "center",
        margin: "20px",
      }}
    >
      <hr />
      <p>Copyright © 2025 my corp. All rights reserved.</p>
      <p>
        This message was sent to {email} and intended for @{username}. If you
        believe this was sent by mistake, please email us on{" "}
        <a href={`mailto:admin@example.com`} style={{ color: "#202020" }}>
          admin@example.com
        </a>
        .
      </p>
    </div>
  );
}
