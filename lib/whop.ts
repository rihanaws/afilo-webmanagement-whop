import Whop from "@whop/sdk";

const apiKey = process.env.WHOP_API_KEY;

if (!apiKey) {
  throw new Error("Missing Whop API key: WHOP_API_KEY must be set");
}

export const whopClient = new Whop({ apiKey });
