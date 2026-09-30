// Reads env vars at call time (not module load) so a missing config only
// fails the SMS send, never the whole build or the order-notification flow
// — same lazy pattern as resend.ts, and the caller treats failures as
// non-fatal since the email notification is the primary channel.
export async function sendSms(body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.NOTIFICATION_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    throw new Error(
      "Twilio is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and NOTIFICATION_PHONE_NUMBER"
    );
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toNumber, From: fromNumber, Body: body }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Twilio send failed (${res.status}): ${errorText}`);
  }
}
