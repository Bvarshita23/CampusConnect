import nodemailer from "nodemailer";

// ✅ Exported as named function (not default)
export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`📨 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};
