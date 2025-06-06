import { forever } from "./forever.ts";
import axios from "axios";

export type object_result =
  | { found: false }
  | { found: true; t: number; i: number; data: any };

export async function get_object(
  type: string,
  id: string
): Promise<object_result> {
  return forever(async () => {
    const tstr = encodeURIComponent(type);
    const idstr = encodeURIComponent(id);
    const res = await axios.get(
      `http://object-reducer:3000/object-apis/get-object?type=${tstr}&id=${idstr}`
    );
    return res.data as object_result;
  });
}
