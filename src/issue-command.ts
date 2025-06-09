import axios from "axios";
import { sleep } from "./sleep.ts";

type command_auth =
  | { authenticated: false }
  | { authenticated: true; user_id: string; signature: string };

type command_payload = {
  command_uuid: string;
  command_type: string;
  command_data: any;
  command_auth: command_auth;
};

async function issue_command(payload: command_payload) {
  console.log({ payload });
  while (true) {
    const result = await axios.post(
      "http://event-db:3000/event-apis/submit-command",
      payload,
      {
        validateStatus: () => true,
      }
    );
    if (result.status >= 200 && result.status < 300) {
      console.log(`command ok: ${result.status}: ${result.statusText}`);
      return;
    } else {
      console.error(`command error: ${result.status}: ${result.statusText}`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}

async function get_status_t(): Promise<number> {
  while (true) {
    try {
      const result = await axios.get(
        "http://event-db:3000/event-apis/status-t"
      );
      if (typeof result.data === "number") {
        return result.data;
      } else {
        throw new Error("status-t returned a nonnumber");
      }
    } catch (err) {
      console.error(err);
      console.error(`failed to get status-t`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}

type command_message = {
  type: "queued" | "succeeded" | "failed" | "aborted";
  status_t: number;
  command_uuid: string;
};

async function poll_status(status_t: number): Promise<command_message> {
  console.log({ poll: status_t });
  while (true) {
    try {
      const result = await axios.get(
        `http://event-db:3000/event-apis/poll-status?status_t=${status_t}`
      );
      const data = result.data;
      console.log({ status_t, data });
      if (data === null || typeof data !== "object")
        throw new Error("expected object");
      return data as command_message;
    } catch (err) {
      console.error(err);
      console.error(`failed to get status-t`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}

type command_status = {
  status_type: "queued" | "succeeded" | "failed" | "aborted";
  status_t: number;
};

async function get_command_status(
  command_uuid: string
): Promise<command_status[]> {
  while (true) {
    try {
      const result = await axios.get(
        `http://event-db:3000/event-apis/command-status?command_uuid=${command_uuid}`
      );
      const data = result.data;
      if (data === null || typeof data !== "object")
        throw new Error("expected object");
      return data as command_status[];
    } catch (err) {
      console.error(err);
      console.error(`failed to get command status`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}

async function get_successful_command_event_t(
  command_uuid: string
): Promise<number> {
  while (true) {
    try {
      const result = await axios.get(
        `http://event-db:3000/event-apis/successful-command-event-t?command_uuid=${command_uuid}`
      );
      const data = result.data;
      if (typeof data !== "number") throw new Error("expected number");
      return data;
    } catch (err) {
      console.error(err);
      console.error(`failed to get command status`);
      console.error("retrying in 1000 ms");
      await sleep(1000);
    }
  }
}

async function get_command_outcome(command_uuid: string) {
  let status_t = await get_status_t();
  console.log({ status_t });
  const statuses = await get_command_status(command_uuid);
  console.log({ statuses });
  for (const status of statuses) {
    switch (status.status_type) {
      case "queued":
        continue;
      case "succeeded":
      case "failed":
      case "aborted":
        return status.status_type;
      default:
        const invalid: never = status.status_type;
        throw invalid;
    }
  }
  console.log("HERE");
  while (true) {
    status_t += 1;
    const status = await poll_status(status_t);
    console.log({ status });
    if (status.command_uuid !== command_uuid) continue;
    switch (status.type) {
      case "queued":
        continue;
      case "succeeded":
      case "failed":
      case "aborted":
        return status.type;
      default:
        const invalid: never = status.type;
        throw invalid;
    }
  }
}

export async function issue_command_and_wait_for_completion(
  payload: command_payload
) {
  await issue_command(payload);
  const outcome = await get_command_outcome(payload.command_uuid);
  console.log({ outcome });
  if (outcome === "succeeded") {
    const event_t = await get_successful_command_event_t(payload.command_uuid);
    console.log({ event_t });
    return { type: outcome, event_t };
  } else {
    return { type: outcome };
  }
}
