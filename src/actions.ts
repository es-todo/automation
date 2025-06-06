import {
  type object_type,
  parse_object_type,
} from "schemata/generated/object_type";
import { type command_type } from "schemata/generated/command_type";

export type email_data = {
  to: string;
  message_id: string;
  title: string;
  body: string;
};

export type final_action =
  | {
      type: "submit_command";
      command_uuid: string;
      command_type: string;
      command_data: any;
    }
  | { type: "send_email"; data: email_data }
  | { type: "fail"; reason: string };

export type terminal_action =
  | final_action
  | { type: "seq"; actions: final_action[] };

export type action =
  | {
      type: "fetch";
      object_type: string;
      object_id: string;
      if_found: (data: any) => action;
      if_not: () => action;
    }
  | terminal_action;

export function fetch<T extends object_type["type"]>(
  type: T,
  id: string,
  sk: (data: (object_type & { type: T })["data"]) => action,
  fk?: () => action
): action {
  return {
    type: "fetch",
    object_type: type,
    object_id: id,
    if_found: (data) => {
      const obj = (() => {
        try {
          const x = parse_object_type({ type, data: data });
          return x.data as any;
        } catch (err) {
          console.error({ type, data });
          throw err;
        }
      })();
      return sk(obj);
    },
    if_not: () => {
      if (fk) {
        return fk();
      } else {
        return { type: "fail", reason: "not found" };
      }
    },
  };
}

export function send_email(data: email_data): terminal_action {
  return { type: "send_email", data };
}

export function fail(reason: string): terminal_action {
  return { type: "fail", reason };
}

export function no_action(): terminal_action {
  return { type: "seq", actions: [] };
}

export function seq(actions: terminal_action[]): terminal_action {
  const all_actions: final_action[] = [];
  for (const a of actions) {
    if (a.type === "seq") {
      for (const x of a.actions) {
        all_actions.push(x);
      }
    } else {
      all_actions.push(a);
    }
  }
  return { type: "seq", actions: all_actions };
}

export function submit_command<T extends command_type["type"]>(
  command_uuid: string,
  type: T,
  data: (command_type & { type: T })["data"]
): terminal_action {
  return {
    type: "submit_command",
    command_uuid,
    command_type: type,
    command_data: data,
  };
}
