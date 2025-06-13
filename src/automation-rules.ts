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
import { email_title, render_template } from "./render.tsx";

type content = objects["email_message"]["content"];

export function email_automation(): action {
  type data = {
    message_id: string;
    username: string;
    email: string;
    content: content;
  };
  function handle_content({
    message_id,
    username,
    email,
    content,
  }: data): action {
    return seq([
      send_email({
        to: email,
        message_id,
        title: email_title[content.type],
        body: render_template({
          content,
          username,
          email,
        }),
      }),
      submit_command(message_id, "dequeue_email_message", {
        message_id,
        status: { success: true },
      }),
    ]);
  }
  return fetch(
    "email_message_queue_entry",
    "*",
    ({ next }) =>
      next === "*"
        ? no_action()
        : fetch("email_message", next, ({ user_id, email, content }) =>
            fetch("user", user_id, ({ username }) =>
              fetch("email_message_delivery_status", next, ({ status }) =>
                status.type === "queued"
                  ? handle_content({
                      message_id: next,
                      content,
                      email,
                      username,
                    })
                  : fail(`queued message is already ${status.type}`)
              )
            )
          ),
    () => no_action()
  );
}
