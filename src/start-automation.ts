import { Resend } from "resend";
import { fetch, no_action, type action, type final_action } from "./actions.ts";
import { get_object } from "./get-object.ts";
import { issue_command_and_wait_for_completion } from "./issue-command.ts";
import { randomUUID } from "node:crypto";
import { compile as make_converter } from "html-to-text";
import { fetch_event_t, poll_change_set } from "./object-channel.ts";

const convert = make_converter({
  wordwrap: 80,
  selectors: [{ selector: "a", options: { hideLinkHrefIfSameAsText: true } }],
});

type config = {
  resend_api_key: string;
  email_from: string;
  automation_user_id: string;
  sign: (text: string) => string;
};

type depencencies = Record<string, Record<string, true>>;

async function single_run(action_maker: () => action, config: config) {
  const resend = new Resend(config.resend_api_key);

  async function do_action(action: final_action) {
    switch (action.type) {
      case "send_email": {
        const { message_id, to, title, body } = action.data;
        const res = await resend.emails.send(
          {
            to: to,
            from: config.email_from,
            html: body,
            text: convert(body),
            subject: title,
          },
          {
            idempotencyKey: message_id,
          }
        );
        if (res.error) {
          console.error(res);
          throw new Error(res.error.name);
        }
        console.log(res);
        return 0;
      }
      case "submit_command": {
        const { command_type, command_data } = action;
        const command_uuid = randomUUID();
        const outcome = await issue_command_and_wait_for_completion({
          command_uuid,
          command_type,
          command_data,
          command_auth: {
            authenticated: true,
            user_id: config.automation_user_id,
            signature: config.sign(
              `${command_uuid}:${config.automation_user_id}`
            ),
          },
        });
        if (outcome.type !== "succeeded") {
          throw new Error(`command ${outcome}`);
        }
        return outcome.event_t;
      }
      default: {
        throw new Error(`action ${action.type} is not implemented`);
      }
    }
  }

  type action_outcome = { depencencies: depencencies; actions: final_action[] };

  async function analyze_action(action: action): Promise<action_outcome> {
    const depencencies: depencencies = {};
    function push_dep(type: string, id: string) {
      if (!depencencies[type]) depencencies[type] = {};
      depencencies[type][id] = true;
    }
    async function process_action(action: action): Promise<final_action[]> {
      switch (action.type) {
        case "fetch": {
          const { object_type, object_id, if_found, if_not } = action;
          push_dep(object_type, object_id);
          const res = await get_object(object_type, object_id);
          if (res.found) {
            return process_action(if_found(res.data));
          } else {
            return process_action(if_not());
          }
        }
        case "seq": {
          return action.actions;
        }
        default: {
          throw new Error(`action ${action.type} is not implemented`);
        }
      }
    }
    const final_actions = await process_action(action);
    return { actions: final_actions, depencencies };
  }

  const { depencencies, actions } = await analyze_action(
    fetch("user_roles", config.automation_user_id, ({ roles }) =>
      roles.includes("automation") ? action_maker() : no_action()
    )
  );
  if (actions.some((x) => x.type === "fail")) {
    console.log(actions);
    throw new Error(`actions failed`);
  }
  let event_t = 0;
  for (const action of actions) {
    const t = await do_action(action);
    event_t = Math.max(event_t, t);
  }

  console.log({ actions });
  return { depencencies, event_t };
}

export async function start_automation(
  action_maker: () => action,
  config: config
) {
  let max_event_t = await fetch_event_t();
  console.log(`init event_t = ${max_event_t}`);
  while (true) {
    const { depencencies, event_t } = await single_run(action_maker, config);
    max_event_t = Math.max(max_event_t + 1, event_t);
    console.log(`waiting for event_t = ${max_event_t}`);
    await poll_change_set(max_event_t);
  }
}
