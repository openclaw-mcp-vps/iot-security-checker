import { Resend } from "resend";

interface ThreatAlertPayload {
  to: string;
  deviceLabel: string;
  cve: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
}

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return null;
  }
  return new Resend(key);
}

export async function sendThreatAlert(payload: ThreatAlertPayload) {
  const client = getClient();

  if (!client) {
    return { sent: false, reason: "RESEND_API_KEY missing" };
  }

  const from = process.env.ALERT_FROM_EMAIL || "alerts@iotsecuritychecker.com";

  const result = await client.emails.send({
    from,
    to: payload.to,
    subject: `New ${payload.severity.toUpperCase()} IoT threat: ${payload.cve}`,
    html: `<p>A new threat was detected for <strong>${payload.deviceLabel}</strong>.</p>
      <p><strong>${payload.cve}</strong>: ${payload.summary}</p>
      <p>Recommended action: patch firmware and isolate the device on your IoT VLAN.</p>`
  });

  return { sent: Boolean(result.data?.id), id: result.data?.id };
}
