import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, text, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: htmlContent || text, // Add HTML content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};
