const { Cocobase } = require('cocobase');

const COCO_MAILER_BASE_URL = 'https://coco-mailer-api.vercel.app';
const MAILER_CONFIG_KEY =
  process.env.VITE_COCO_MAILER_CONFIG_KEY || process.env.COCO_MAILER_CONFIG_KEY;
const OWNER_EMAIL =
  process.env.VITE_OWNER_EMAIL || process.env.OWNER_EMAIL || 'admin@clubmanager.com';

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  if (!MAILER_CONFIG_KEY) {
    console.error('GLOBAL BROADCAST: Missing mailer config key');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Email configuration missing' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { subject, title, message, ctaUrl, ctaLabel, email, userId } = body;

    if (!email || email !== OWNER_EMAIL) {
      console.warn('GLOBAL BROADCAST: Unauthorized sender', { email, userId });
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Not authorized' }),
      };
    }

    if (!subject || !title || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing subject, title, or message' }),
      };
    }

    const db = new Cocobase({
      apiKey: process.env.VITE_COCOBASE_API_KEY,
      projectId: process.env.VITE_COCOBASE_PROJECT_ID,
    });

    let memberDocs = [];
    try {
      memberDocs = await db.listDocuments('members', {
        sort: 'created_at',
        order: 'desc',
      });
    } catch (err) {
      console.error('GLOBAL BROADCAST: Failed to list members', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to load recipients' }),
      };
    }

    const emailSet = new Set();
    for (const doc of memberDocs) {
      const data = (doc && doc.data) || {};
      const addr = (data.email || '').trim();
      if (addr) {
        emailSet.add(addr.toLowerCase());
      }
    }

    const recipients = Array.from(emailSet);

    if (!recipients.length) {
      console.warn('GLOBAL BROADCAST: No recipients found from members');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No recipients found' }),
      };
    }

    const safeMessage = String(message || '');
    const safeCtaLabel = ctaLabel || 'Open HiveFlow';
    const safeCtaUrl = ctaUrl || (process.env.VITE_APP_BASE_URL || 'https://hiveflow.app');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:radial-gradient(circle at top,#1f2937,#020617);padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:rgba(15,23,42,0.96);border-radius:24px;border:1px solid rgba(148,163,184,0.3);box-shadow:0 18px 45px rgba(15,23,42,0.8);overflow:hidden;">
                <tr>
                  <td style="padding:24px 32px 12px 32px;text-align:center;border-bottom:1px solid rgba(30,64,175,0.4);background:radial-gradient(circle at top left,rgba(34,211,238,0.2),transparent),radial-gradient(circle at top right,rgba(129,140,248,0.22),transparent);">
                    <div style="display:inline-block;padding:10px 18px;border-radius:999px;background:rgba(15,23,42,0.9);border:1px solid rgba(148,163,184,0.5);margin-bottom:14px;">
                      <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a5b4fc;">Global HiveFlow Announcement</span>
                    </div>
                    <h1 style="margin:0 0 8px 0;color:#e5e7eb;font-size:22px;line-height:1.3;">${title}</h1>
                    <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">
                      ${safeMessage.replace(/\n/g, '<br/>')}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 8px 32px;">
                    <div style="text-align:center;margin:12px 0 18px 0;">
                      <a
                        href="${safeCtaUrl}"
                        style="display:inline-block;padding:11px 26px;border-radius:999px;background:linear-gradient(90deg,#22d3ee,#6366f1);color:#020617;font-weight:600;font-size:14px;text-decoration:none;box-shadow:0 12px 30px rgba(56,189,248,0.45);"
                      >
                        ${safeCtaLabel}
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 24px 32px;color:#6b7280;font-size:11px;line-height:1.6;text-align:center;border-top:1px solid rgba(31,41,55,0.9);background:radial-gradient(circle at bottom,rgba(15,23,42,0.9),rgba(2,6,23,1));">
                    <p style="margin:0 0 4px 0;">You are receiving this email because you have an account on HiveFlow or belong to a HiveFlow community.</p>
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

    const url = `${COCO_MAILER_BASE_URL}/api/send-mail/${MAILER_CONFIG_KEY}`;

    const mailBody = {
      recipient_list: recipients,
      subject,
      content: htmlContent,
      is_html: true,
    };

    let mailResponseText = '';
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailBody),
      });
      mailResponseText = await resp.text();
      if (!resp.ok) {
        console.error('GLOBAL BROADCAST: Mailer error', resp.status, mailResponseText);
        return {
          statusCode: 502,
          body: JSON.stringify({ error: 'Failed to send global email' }),
        };
      }
    } catch (err) {
      console.error('GLOBAL BROADCAST: Mailer network error', err);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Failed to send global email' }),
      };
    }

    // Persist the announcement so the app can show it in-app
    try {
      await db.createDocument('global_announcements', {
        title,
        message: safeMessage,
        subject,
        ctaUrl: safeCtaUrl,
        ctaLabel: safeCtaLabel,
        createdAt: new Date().toISOString(),
        sentBy: email,
        recipientsCount: recipients.length,
      });
    } catch (err) {
      console.error('GLOBAL BROADCAST: Failed to persist global announcement', err);
      // Do not fail the whole request if persisting the record fails
    }

    console.log('GLOBAL BROADCAST: Sent', {
      recipientsCount: recipients.length,
      owner: email,
      mailResponseText,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, recipientsCount: recipients.length }),
    };
  } catch (err) {
    console.error('GLOBAL BROADCAST: Handler error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
