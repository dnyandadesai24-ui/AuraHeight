const axios = require("axios");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY || BREVO_API_KEY === "your-brevo-api-key-here") {
    console.warn("[Mailer] WARNING: BREVO_API_KEY is not set in .env! Emails will NOT be sent.");
} else {
    console.log("[Mailer] Brevo API mailer initialized successfully.");
}

/**
 * Parses a "Name <email@domain.com>" string into { name, email }
 */
function parseSender(fromStr) {
    const match = fromStr.match(/^(.+?)\s*<(.+?)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { email: fromStr.trim() };
}

/**
 * sendMail - drop-in replacement for nodemailer transporter.sendMail()
 * Supports: { from, to, subject, html, text, replyTo }
 */
async function sendMail({ from, to, subject, html, text, replyTo }) {
    if (!BREVO_API_KEY || BREVO_API_KEY === "your-brevo-api-key-here") {
        throw new Error("BREVO_API_KEY is not configured in .env");
    }

    const sender = parseSender(from);

    // Build recipient list — supports single string or comma-separated
    const recipientList = to
        .split(",")
        .map((r) => ({ email: r.trim() }));

    const payload = {
        sender,
        to: recipientList,
        subject,
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    };

    const response = await axios.post(BREVO_API_URL, payload, {
        headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    return {
        messageId: response.data.messageId,
        response: `${response.status} ${response.statusText}`,
    };
}

// Expose a nodemailer-compatible transporter object
const transporter = { sendMail };

module.exports = transporter;