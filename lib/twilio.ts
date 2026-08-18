import Twilio from "twilio";

let _client: ReturnType<typeof Twilio> | null = null;

function getTwilioClient() {
  if (_client) return _client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error(
      "Missing Twilio credentials: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set"
    );
  }

  _client = Twilio(accountSid, authToken);
  return _client;
}

export function getTwilioClientOrThrow() {
  return getTwilioClient();
}

export function getTwilioPhoneNumber(): string {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!phoneNumber) {
    throw new Error("Missing TWILIO_PHONE_NUMBER environment variable");
  }
  return phoneNumber;
}
