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
import { render_template } from "./render.tsx";

export function email_automation(): action {
  function handle_content(
    message_id: string,
    { email, content }: objects["email_message"]
  ): action {
    switch (content.type) {
      case "welcome_email": {
        const { code } = content;
        return fetch("email_confirmation_code", code, ({ user_id }) =>
          fetch("user", user_id, ({ username }) =>
            seq([
              send_email({
                to: email,
                message_id,
                title: "Welcome to our platform",
                body: render_template({
                  type: "welcome_email",
                  code,
                  username,
                  email,
                }),
              }),
              submit_command(message_id, "dequeue_email_message", {
                message_id,
                status: { success: true },
              }),
            ])
          )
        );
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
