import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

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

    // =====================================================
    // CHECK SMTP CONFIGURATION
    // =====================================================

    const requiredEnv = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "CONTACT_TO_EMAIL",
    ];

    const missingEnv = requiredEnv.filter((key) => !process.env[key]);

    if (missingEnv.length > 0) {
      console.error("Missing SMTP environment variables:", missingEnv);

      return res.status(500).json({
        success: false,
        message: "ईमेल सेवा अभी कॉन्फ़िगर नहीं है।",
      });
    }

    // =====================================================
    // SMTP TRANSPORT
    // =====================================================

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,

      port: Number(process.env.SMTP_PORT),

      secure:
        String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",

      auth: {
        user: process.env.SMTP_USER,

        pass: process.env.SMTP_PASS,
      },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    // =====================================================
    // SMTP CONNECTION TEST
    // =====================================================

    await transporter.verify();

    console.log("SMTP connection verified successfully.");

    // =====================================================
    // SEND EMAIL
    // =====================================================

    await transporter.sendMail({
      from: `"Bhagavad Gita Website" <${process.env.SMTP_USER}>`,

      to: process.env.CONTACT_TO_EMAIL,

      replyTo: email.trim(),

      subject: `Contact Form: ${subject.trim()}`,

      text: `
New contact form message

Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}

Message:
${message.trim()}
      `.trim(),

      html: `
        <!doctype html>
        <html>
          <body style="margin:0;padding:0;background:#f7f4ed;font-family:Arial,sans-serif;">
            <div style="max-width:700px;margin:30px auto;background:#ffffff;border-radius:20px;padding:30px;">
              
              <h2 style="margin-top:0;color:#111827;">
                New Contact Form Message
              </h2>

              <div style="margin-top:20px;">
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
              </div>

              <hr style="margin:25px 0;border:none;border-top:1px solid #eeeeee;" />

              <p>
                <strong>Message</strong>
              </p>

              <div style="padding:18px;background:#fffaf0;border-radius:12px;line-height:1.7;">
                ${escapeHtml(message).replace(/\n/g, "<br />")}
              </div>

            </div>
          </body>
        </html>
      `,
    });

    console.log("Contact email sent successfully.");

    return res.status(200).json({
      success: true,
      message: "आपका संदेश सफलतापूर्वक भेज दिया गया।",
    });
  } catch (error) {
    console.error("==========================================");

    console.error("CONTACT EMAIL ERROR");

    console.error("Name:", error.name);

    console.error("Message:", error.message);

    console.error("Code:", error.code);

    console.error("Command:", error.command);

    console.error("Response:", error.response);

    console.error("==========================================");

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
