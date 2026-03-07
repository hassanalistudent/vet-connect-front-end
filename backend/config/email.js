import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// 🔍 Debug: confirm API key is loaded (never print the key itself)
console.log("📧 RESEND CONFIG:", {
  apiKeyLoaded: !!process.env.RESEND_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "VetConnect <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Resend Error:", error);
    throw new Error("Failed to send email");
  }
};