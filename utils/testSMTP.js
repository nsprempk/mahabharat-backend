import "dotenv/config";
import nodemailer from "nodemailer";

const required = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_TO_EMAIL",
];

console.log("");
console.log("==========================================");
console.log("          SMTP DIAGNOSTIC TEST");
console.log("==========================================");

for (const key of required) {
  console.log(`${key}: ${process.env[key] ? "SET" : "MISSING"}`);
}

console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);

console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);

console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`);

console.log(`SMTP_USER: ${process.env.SMTP_USER}`);

console.log(`CONTACT_TO_EMAIL: ${process.env.CONTACT_TO_EMAIL}`);

console.log("==========================================");
console.log("");

if (required.some((key) => !process.env[key])) {
  console.error("Missing required SMTP environment variable(s).");

  process.exit(1);
}

const port = Number(process.env.SMTP_PORT);

const secure = String(process.env.SMTP_SECURE).toLowerCase() === "true";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,

  port,

  secure,

  auth: {
    user: process.env.SMTP_USER,

    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,

  logger: true,
  debug: true,
});

try {
  console.log("Testing SMTP connection...");

  await transporter.verify();

  console.log("");
  console.log("✅ SMTP CONNECTION SUCCESSFUL");
  console.log("");

  console.log("Sending test email...");

  const info = await transporter.sendMail({
    from: `"Bhagavad Gita Website" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO_EMAIL,

    subject: "Bhagavad Gita SMTP Test",

    text: "This is a test email from the Bhagavad Gita website.",
  });

  console.log("");
  console.log("✅ TEST EMAIL SENT");

  console.log("Message ID:", info.messageId);

  console.log("");
  console.log("Check the recipient inbox.");
} catch (error) {
  console.log("");
  console.log("❌ SMTP TEST FAILED");

  console.log("Name:", error.name);

  console.log("Code:", error.code);

  console.log("Command:", error.command);

  console.log("Response Code:", error.responseCode);

  console.log("Response:", error.response);

  console.log("Message:", error.message);

  console.log("");
  process.exit(1);
}
