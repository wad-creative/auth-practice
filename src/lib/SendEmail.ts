import { Brevo, BrevoClient } from "@getbrevo/brevo";

// Env variables
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL!;

if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
  throw new Error(
    "Missing BREVO_API_KEY or FROM_EMAIL in environment variables",
  );
}

// New way to initialize the client
const brevo = new BrevoClient({ apiKey: BREVO_API_KEY });

type SendEmailType = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

//
export const SendEmail = async ({ to, subject, html }: SendEmailType) => {
  try {
    // Use the official Brevo type for the request body
    const emailData: Brevo.SendTransacEmailRequest = {
      sender: { name: "auth practice", email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      ...(html && { htmlContent: html }),
    };

    // New way to send the email
    const response =
      await brevo.transactionalEmails.sendTransacEmail(emailData);
    return response;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
};
