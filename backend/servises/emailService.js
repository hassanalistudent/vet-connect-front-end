import { transporter,emailUser } from "../config/email.js";

export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}&email=${email}`;

  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: "Verify your VetConnect account",
    html: `<p>Click <a href="${link}">here</a> to verify your account.</p>`,
  });

  console.log("✅ Verification email sent to", email);
}

export async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: "Reset your VetConnect password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
  });

  console.log("✅ Password reset email sent to", email);
}

export async function sendAppointmentEmail(doctorEmail, doctorName, ownerName, appointment) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor/${appointment._id}/doctor-response`;

  await transporter.sendMail({
    from: emailUser,
    to: doctorEmail,
    subject: "New Appointment Scheduled",
    html: `
      <p>Dear Dr. ${doctorName},</p>
      <p>A new appointment has been scheduled with you.</p>
      <ul>
        <li><strong>Pet Owner:</strong> ${ownerName}</li>
        <li><strong>Date:</strong> ${appointment.appointmentDate}</li>
        <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
        <li><strong>Type:</strong> ${appointment.appointmentType}</li>
        <li><strong>Charges:</strong> ${appointment.charges}</li>
      </ul>
      <p>You can view and respond to this appointment by clicking the link below:</p>
      <p><a href="${link}">View Appointment</a></p>
      <p>Best regards,<br/>VetConnect Team</p>
    `,
  });

  console.log("✅ Appointment email sent to", doctorEmail);
}