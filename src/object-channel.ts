import assert from "node:assert";
import axios from "axios";
import { forever } from "./forever.ts";

export async function fetch_event_t(): Promise<number> {
  return forever(async () => {
    const x = await axios.get("http://object-reducer:3000/object-apis/get-t");
    assert(typeof x.data === "number");
    return x.data;
  });
}

type change = {
  i: number;
  type: string;
  id: string;
  data: any;
};

export async function poll_change_set(t: number): Promise<change[]> {
  return forever(async () => {
    const x = await axios.get(
      `http://object-reducer:3000/object-apis/poll-change-set?t=${t}`
    );
    return x.data as change[];
  });
}
