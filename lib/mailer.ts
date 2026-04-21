import nodemailer from "nodemailer";

export async function sendThreatAlertEmail(args: {
  to: string;
  criticalCount: number;
  highCount: number;
  scanTime: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const subject = `IoT Security Checker Alert: ${args.criticalCount} critical findings detected`;
  const text = `Your latest scan at ${args.scanTime} found ${args.criticalCount} critical and ${args.highCount} high-risk findings. Log in to your dashboard to review remediation steps.`;

  await transport.sendMail({
    from: SMTP_FROM,
    to: args.to,
    subject,
    text
  });

  return { sent: true };
}
