import express from "express";
import { sendEmail } from "../utils/emailHelper.js";

const router = express.Router();

router.get("/send-test", async (req, res) => {
  try {
    await sendEmail(
      "yourpersonalemail@gmail.com", // change to your real email
      "Test Email from Campus Connect",
      "✅ This is a test email from your Campus Connect backend!"
    );
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Send test error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
