import { toast } from "sonner";

interface InviteEmailPayload {
  to: string;
  name: string;
  role: string;
  inviteLink: string;
}

const INVITE_FUNCTION_URL = import.meta.env.VITE_COCO_MAILER_INVITE_URL as
  | string
  | undefined;

export async function sendInviteEmail(payload: InviteEmailPayload) {
  if (!INVITE_FUNCTION_URL) {
    console.warn("COCO_MAILER: VITE_COCO_MAILER_INVITE_URL is not set", payload);
    toast.success(`Invite email queued for ${payload.to}`);
    return;
  }

  try {
    const response = await fetch(INVITE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        // ignore
      }
      console.log("COCO_MAILER ERROR:", response.status, errorText);
      toast.error("Failed to send invite email");
      return;
    }

    toast.success(`Invite email sent to ${payload.to}`);
  } catch (err) {
    console.log("COCO_MAILER NETWORK ERROR:", err);
    toast.error("Failed to send invite email");
  }
}
