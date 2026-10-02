import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "नाम आवश्यक है।",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "ईमेल आवश्यक है।",
      });
    }

    if (!subject?.trim()) {
      return res.status(400).json({
        success: false,
        message: "विषय आवश्यक है।",
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "संदेश आवश्यक है।",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "मान्य ईमेल पता दर्ज करें।",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure:
        String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Bhagavad Gita Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email.trim(),

      subject: `Contact: ${subject.trim()}`,

      text: `
New contact message

Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}

Message:
${message.trim()}
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>New Contact Message</h2>

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Subject:</strong>
            ${escapeHtml(subject)}
          </p>

          <hr />

          <p>
            <strong>Message:</strong>
          </p>

          <p>
            ${escapeHtml(message).replace(/\n/g, "<br />")}
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "आपका संदेश सफलतापूर्वक भेज दिया गया।",
    });
  } catch (error) {
    console.error("Contact email error:", error);

    return res.status(500).json({
      success: false,
      message: "संदेश भेजने में समस्या हुई। कृपया बाद में पुनः प्रयास करें।",
    });
  }
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
