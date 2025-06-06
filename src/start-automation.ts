import { Resend } from "resend";
import { fetch, no_action, type action, type final_action } from "./actions.ts";
import { get_object } from "./get-object.ts";
import { issue_command } from "./issue-command.ts";
import { randomUUID } from "node:crypto";
import { compile as make_converter } from "html-to-text";

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

export async function start_automation(
  action_maker: () => action,
  config: config
) {
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
        return;
      }
      case "submit_command": {
        const { command_type, command_data } = action;
        const command_uuid = randomUUID();
        await issue_command({
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
        return;
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
  for (const action of actions) {
    await do_action(action);
  }

  console.log({ depencencies, actions });
}
