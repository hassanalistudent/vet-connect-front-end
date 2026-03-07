import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER || "jamison.hayes@ethereal.email";
const emailPass = process.env.EMAIL_PASS || "9m1Z73cQwN4wzChmFa";

console.log("📧 Email config:", {
  service: process.env.RESEND_API_KEY ? "Resend" : "Ethereal",
  userSet: !!emailUser,
});

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port:process.env.SMTP_PORT || 587,
  auth: { user: emailUser, pass: emailPass },
});

export { emailUser };