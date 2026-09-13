import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { escapeHtml, stripHeaderUnsafe } from "@/lib/security";

export interface SendRegistrationEmailOptions {
  name: string;
  prn: string;
  email: string;
  agentId: string;
  domain: string;
  teamName: string;
  qrCodeDataUrl: string;
  dashboardUrl: string;
}

const OUTBOX_DIR = process.env.VERCEL
  ? path.join("/tmp", "techopedia_outbox")
  : path.join(process.cwd(), "data", "outbox");

export async function sendRegistrationEmail(
  opts: SendRegistrationEmailOptions
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  const { name, prn, email, agentId, domain, teamName, qrCodeDataUrl, dashboardUrl } = opts;

  // All participant-controlled fields are HTML-escaped before interpolation
  // below — `name`/`teamName`/`domain`/`prn` come straight from the public
  // registration form, and this string is written verbatim to disk and
  // served as text/html by /api/email-preview, so an unescaped value here
  // would be a stored XSS vector.
  const safeName = escapeHtml(name);
  const safePrn = escapeHtml(prn);
  const safeDomain = escapeHtml(domain);
  const safeTeamName = escapeHtml(teamName);
  const safeAgentId = escapeHtml(agentId);
  const safeDashboardUrl = escapeHtml(dashboardUrl);

  // Build high-impact Marvel/Stark Industries HTML template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Techopedia Level 15 — Agent Credentials</title>
  <style>
    body { margin: 0; padding: 0; background-color: #06070a; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 20px auto; background: #0c0f16; border: 1px solid #ed1d24; border-radius: 12px; overflow: hidden; box-shadow: 0 0 30px rgba(237, 29, 36, 0.4); }
    .header { background: linear-gradient(135deg, #ed1d24, #8b0000); padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
    .header p { margin: 6px 0 0; font-size: 13px; letter-spacing: 2px; color: #ffd700; font-weight: bold; }
    .content { padding: 30px 25px; }
    .greeting { font-size: 18px; margin-bottom: 15px; color: #ffffff; }
    .card-box { background: #131722; border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .badge { display: inline-block; background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700; color: #ffd700; font-size: 11px; padding: 4px 12px; border-radius: 999px; letter-spacing: 1.5px; font-weight: bold; margin-bottom: 10px; }
    .agent-id { font-size: 24px; font-weight: bold; color: #ed1d24; letter-spacing: 2px; margin: 6px 0; font-family: monospace; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 15px 0; text-align: left; }
    .meta-table td { padding: 8px 10px; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .meta-table td.label { color: #94a3b8; width: 40%; font-weight: 600; }
    .meta-table td.value { color: #ffffff; font-weight: bold; }
    .qr-container { margin: 25px 0 15px; text-align: center; }
    .qr-img { width: 180px; height: 180px; border: 3px solid #ffd700; border-radius: 8px; background: #ffffff; padding: 6px; }
    .qr-note { font-size: 12px; color: #cbd5e1; margin-top: 8px; }
    .btn-wrap { text-align: center; margin: 30px 0 20px; }
    .btn { display: inline-block; background: linear-gradient(120deg, #ed1d24, #b31016); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; letter-spacing: 1.5px; font-size: 14px; border: 1px solid #ffd700; box-shadow: 0 0 18px rgba(237, 29, 36, 0.6); }
    .footer { background: #080a0f; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TECHOPEDIA LEVEL 15</h1>
      <p>S.H.I.E.L.D. AGENT CLEARANCE CONFIRMED</p>
    </div>
    <div class="content">
      <div class="greeting">Welcome to the Multiverse, <strong>Agent ${safeName}</strong>!</div>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Your official delegate credentials for <strong>Techopedia Level 15 (IEEE SIESGST)</strong> have been locked in.
        Show your personal QR Code at the registration desk and game stalls to check in, play arena challenges, and climb the live national leaderboard.
      </p>

      <div class="card-box">
        <div class="badge">AGENT CLEARANCE: LEVEL 15</div>
        <div class="agent-id">${safeAgentId}</div>

        <table class="meta-table">
          <tr><td class="label">Participant Name</td><td class="value">${safeName}</td></tr>
          <tr><td class="label">Permanent Reg No (PRN)</td><td class="value">${safePrn}</td></tr>
          <tr><td class="label">Event Domain</td><td class="value" style="color: #ffd700;">${safeDomain}</td></tr>
          <tr><td class="label">Team Name</td><td class="value">${safeTeamName || "Solo Operator"}</td></tr>
          <tr><td class="label">Welcome Point Bonus</td><td class="value" style="color: #00ff9c;">+100 PTS UNLOCKED</td></tr>
        </table>

        <div class="qr-container">
          <img class="qr-img" src="${qrCodeDataUrl}" alt="Techopedia 15 Access QR Code" />
          <div class="qr-note">⚡ Scan at game stalls to play Bug Blitz, CTF & accumulate points</div>
        </div>

        <div class="btn-wrap">
          <a class="btn" href="${safeDashboardUrl}" target="_blank">▸ OPEN DIGITAL DASHBOARD</a>
        </div>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Direct link: <a href="${safeDashboardUrl}" style="color: #ffd700;">${safeDashboardUrl}</a>
      </p>
    </div>
    <div class="footer">
      IEEE SIESGST · Techopedia Level 15 Organizing Committee · Navi Mumbai, India<br/>
      This is an automated encrypted dispatch from Stark Protocol Systems.
    </div>
  </div>
</body>
</html>
`;

  // Always save a copy to the local outbox for instant offline inspection and zero-setup testing.
  // agentId is server-generated, but the filename is still sanitized defensively
  // against path traversal (e.g. "../../etc") before touching the filesystem.
  const safeFileId = agentId.replace(/[^a-zA-Z0-9_-]/g, "");
  try {
    if (!fs.existsSync(OUTBOX_DIR)) {
      fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    }
    const outboxPath = path.join(OUTBOX_DIR, `${safeFileId}.html`);
    fs.writeFileSync(outboxPath, htmlContent, "utf8");
  } catch (e) {
    console.error("Outbox write error:", e);
  }

  // If SMTP is configured via environment variables, dispatch live email
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Strip CR/LF from anything going into a header value — an unescaped
      // newline in `name` could otherwise inject extra email headers.
      const subject = stripHeaderUnsafe(
        `⚡ Techopedia Level 15 Credentials — Agent ${agentId} (${name})`
      );

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Techopedia 15 IEEE'}" <${smtpUser}>`,
        to: stripHeaderUnsafe(email),
        subject,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("⚠️ SMTP live dispatch error (saved to outbox):", msg);
      return { success: true, previewUrl: `/api/email-preview?id=${agentId}`, error: msg };
    }
  }

  // Return preview URL if running without external SMTP
  return {
    success: true,
    previewUrl: `/api/email-preview?id=${agentId}`,
  };
}
