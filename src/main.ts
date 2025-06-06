import { email_automation } from "./automation-rules.ts";
import { start_automation } from "./start-automation.ts";
import { create_sign } from "./signing.ts";
import { readFileSync } from "node:fs";

const sign = create_sign(readFileSync("private.pem", { encoding: "utf8" }));

function get_env(key: string): string {
  const val = process.env[key];
  if (val) return val;
  throw new Error(`environment variable ${key} is not defined`);
}

const resend_api_key = get_env("RESEND_API_KEY");
const email_from = get_env("EMAIL_FROM");
const automation_user_id = get_env("AUTOMATION_USER_ID");

start_automation(email_automation, {
  resend_api_key,
  email_from,
  sign,
  automation_user_id,
}).then(() => {
  throw new Error(`unexpected exit`);
});
