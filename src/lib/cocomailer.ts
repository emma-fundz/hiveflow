import { toast } from "sonner";

interface InviteEmailPayload {
  to: string;
  name: string;
  role: string;
  inviteLink: string;
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
    <p>Hi ${payload.name},</p>
    <p>You have been invited to join <strong>HiveFlow</strong> as a <strong>${payload.role}</strong>.</p>
    <p>Click the link below to accept your invite:</p>
    <p><a href="${payload.inviteLink}">${payload.inviteLink}</a></p>
    <p>If you did not expect this invite, you can safely ignore this email.</p>
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
