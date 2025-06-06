import "./actions.ts";
import {
  fetch,
  seq,
  fail,
  no_action,
  type action,
  send_email,
  submit_command,
} from "./actions.ts";
import { type objects } from "./objects.ts";

export function email_automation(): action {
  function handle_content(
    message_id: string,
    { email, content }: objects["email_message"]
  ): action {
    switch (content.type) {
      case "welcome_email": {
        const { code } = content;
        return seq([
          send_email({
            to: email,
            message_id,
            title: "Welcome to our platform",
            body: `<html><body>
              <h1>Welcome!</h1>
              <p>
              Click <a href="http://localhost/${code}">this link</a>
              to verify your account.
              </p>
              <p>
              Yours, 
              </p>
            </body></html>`,
          }),
          submit_command(message_id, "dequeue_email_message", {
            message_id,
            status: { success: true },
          }),
        ]);
      }
      default:
        return fail(`message with content type ${content.type} not handled`);
    }
  }
  return fetch(
    "email_message_queue_entry",
    "*",
    ({ next }) =>
      next === "*"
        ? no_action()
        : fetch("email_message", next, (message) =>
            message.status.type === "queued"
              ? handle_content(next, message)
              : fail(`queued message is already ${message.status.type}`)
          ),
    () => no_action()
  );
}
