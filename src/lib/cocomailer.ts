import { toast } from "sonner";

interface InviteEmailPayload {
  to: string;
  name: string;
  role: string;
  inviteLink: string;
}

interface NotificationEmailPayload {
  recipients: string[];
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

const COCO_MAILER_BASE_URL = "https://coco-mailer-api.vercel.app";
const COCO_MAILER_CONFIG_KEY = import.meta.env
  .VITE_COCO_MAILER_CONFIG_KEY as string | undefined;

export async function sendInviteEmail(payload: InviteEmailPayload) {
  if (!COCO_MAILER_CONFIG_KEY) {
    console.warn(
      "COCO_MAILER: VITE_COCO_MAILER_CONFIG_KEY is not set",
      payload,
    );
    toast.error("Email configuration missing (COCO_MAILER key not set)");
    return;
  }

  const url = `${COCO_MAILER_BASE_URL}/api/send-mail/${COCO_MAILER_CONFIG_KEY}`;

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>You're invited to HiveFlow</title>
    </head>
    <body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:radial-gradient(circle at top,#1f2937,#020617);padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:rgba(15,23,42,0.96);border-radius:24px;border:1px solid rgba(148,163,184,0.3);box-shadow:0 18px 45px rgba(15,23,42,0.8);overflow:hidden;">
              <tr>
                <td style="padding:24px 32px 12px 32px;text-align:center;border-bottom:1px solid rgba(30,64,175,0.4);background:radial-gradient(circle at top left,rgba(34,211,238,0.2),transparent),radial-gradient(circle at top right,rgba(129,140,248,0.22),transparent);">
                  <div style="display:inline-block;padding:10px 18px;border-radius:999px;background:rgba(15,23,42,0.9);border:1px solid rgba(148,163,184,0.5);margin-bottom:14px;">
                    <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a5b4fc;">HiveFlow Workspace Invite</span>
                  </div>
                  <h1 style="margin:0 0 8px 0;color:#e5e7eb;font-size:24px;line-height:1.3;">You've been invited to join a community</h1>
                  <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">
                    Hi <strong style="color:#e5e7eb;">${payload.name}</strong>, you've been invited to join a workspace on
                    <span style="color:#22d3ee;font-weight:600;">HiveFlow</span> as a
                    <span style="color:#a5b4fc;font-weight:600;">${payload.role}</span>.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 8px 32px;">
                  <p style="margin:0 0 16px 0;color:#e5e7eb;font-size:14px;line-height:1.7;">
                    HiveFlow helps you bring your members, events, announcements and files together in a single, beautiful
                    dashboard. Click the button below to accept your invite, create a password and join the workspace.
                  </p>
                  <div style="text-align:center;margin:28px 0 18px 0;">
                    <a
                      href="${payload.inviteLink}"
                      style="display:inline-block;padding:12px 28px;border-radius:999px;background:linear-gradient(90deg,#22d3ee,#6366f1);color:#020617;font-weight:600;font-size:14px;text-decoration:none;box-shadow:0 12px 30px rgba(56,189,248,0.45);"
                    >
                      Accept invite &amp; join workspace
                    </a>
                  </div>
                  <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;text-align:center;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin:8px 0 0 0;color:#9ca3af;font-size:11px;line-height:1.6;word-break:break-all;text-align:center;">
                    <a href="${payload.inviteLink}" style="color:#22d3ee;text-decoration:none;">${payload.inviteLink}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 24px 32px;color:#6b7280;font-size:11px;line-height:1.6;text-align:center;border-top:1px solid rgba(31,41,55,0.9);background:radial-gradient(circle at bottom,rgba(15,23,42,0.9),rgba(2,6,23,1));">
                  <p style="margin:0 0 4px 0;">You received this email because an admin added you as a member of their HiveFlow workspace.</p>
                  <p style="margin:0;">If you weren't expecting this, you can safely ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const body = {
    recipient_list: [payload.to],
    subject: `You have been invited to join HiveFlow as a ${payload.role}`,
    content: htmlContent,
    is_html: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("COCO_MAILER ERROR:", response.status, text);
      toast.error("Failed to send invite email");
      return;
    }

    console.log("COCO_MAILER RESPONSE:", text);
    toast.success(`Invite email sent to ${payload.to}`);
  } catch (err) {
    console.error("COCO_MAILER NETWORK ERROR:", err);
    toast.error("Failed to send invite email");
  }
}

export async function sendNotificationEmail(payload: NotificationEmailPayload) {
  if (!COCO_MAILER_CONFIG_KEY) {
    console.warn(
      "COCO_MAILER: VITE_COCO_MAILER_CONFIG_KEY is not set for notification email",
      payload,
    );
    toast.error("Email configuration missing (COCO_MAILER key not set)");
    return;
  }

  if (!payload.recipients || payload.recipients.length === 0) {
    console.warn("COCO_MAILER NOTIFICATION: no recipients provided", payload);
    return;
  }

  const url = `${COCO_MAILER_BASE_URL}/api/send-mail/${COCO_MAILER_CONFIG_KEY}`;

  const safeBody = payload.body || "";

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${payload.subject}</title>
    </head>
    <body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:radial-gradient(circle at top,#1f2937,#020617);padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:rgba(15,23,42,0.96);border-radius:24px;border:1px solid rgba(148,163,184,0.3);box-shadow:0 18px 45px rgba(15,23,42,0.8);overflow:hidden;">
              <tr>
                <td style="padding:24px 32px 12px 32px;text-align:center;border-bottom:1px solid rgba(30,64,175,0.4);background:radial-gradient(circle at top left,rgba(34,211,238,0.2),transparent),radial-gradient(circle at top right,rgba(129,140,248,0.22),transparent);">
                  <div style="display:inline-block;padding:10px 18px;border-radius:999px;background:rgba(15,23,42,0.9);border:1px solid rgba(148,163,184,0.5);margin-bottom:14px;">
                    <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a5b4fc;">HiveFlow Update</span>
                  </div>
                  <h1 style="margin:0 0 8px 0;color:#e5e7eb;font-size:22px;line-height:1.3;">${payload.title}</h1>
                  <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">
                    ${safeBody.replace(/\n/g, "<br/>")}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 8px 32px;">
                  <div style="text-align:center;margin:12px 0 18px 0;">
                    <a
                      href="${payload.ctaUrl}"
                      style="display:inline-block;padding:11px 26px;border-radius:999px;background:linear-gradient(90deg,#22d3ee,#6366f1);color:#020617;font-weight:600;font-size:14px;text-decoration:none;box-shadow:0 12px 30px rgba(56,189,248,0.45);"
                    >
                      ${payload.ctaLabel}
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 24px 32px;color:#6b7280;font-size:11px;line-height:1.6;text-align:center;border-top:1px solid rgba(31,41,55,0.9);background:radial-gradient(circle at bottom,rgba(15,23,42,0.9),rgba(2,6,23,1));">
                  <p style="margin:0 0 4px 0;">You are receiving this email because you are a member of a HiveFlow workspace.</p>
                  <p style="margin:0;">If you weren't expecting this, you can safely ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const body = {
    recipient_list: payload.recipients,
    subject: payload.subject,
    content: htmlContent,
    is_html: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("COCO_MAILER NOTIFICATION ERROR:", response.status, text);
      toast.error("Failed to send notification email");
      return;
    }

    console.log("COCO_MAILER NOTIFICATION RESPONSE:", text);
  } catch (err) {
    console.error("COCO_MAILER NOTIFICATION NETWORK ERROR:", err);
    toast.error("Failed to send notification email");
  }
}
