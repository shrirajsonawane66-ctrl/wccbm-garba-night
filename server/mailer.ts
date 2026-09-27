import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './config.ts';

let transport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!config.smtpEnabled) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
    });
  }
  return transport;
}

/**
 * Send the password-reset verification code.
 * - Real delivery via SMTP when configured.
 * - Otherwise dev mode: the code is logged to the server console and the API
 *   echoes it back ONLY in non-production builds so the flow is testable.
 */
export async function sendPasswordResetEmail(
  to: string,
  studentName: string,
  code: string,
): Promise<{ sent: boolean; provider: 'smtp' | 'dev' }> {
  const transporter = getTransport();
  if (!transporter) {
    console.log(`[mail-dev] Password reset OTP for ${to}: ${code}  (valid ${Math.round(config.resetOtpTtlSeconds / 60)} min)`);
    return { sent: true, provider: 'dev' };
  }

  await transporter.sendMail({
    from: config.smtpFrom,
    to,
    subject: 'Western College - Password Reset Code',
    text: [
      `Hello ${studentName},`,
      '',
      'Your password reset verification code is:',
      '',
      code,
      '',
      `This code expires in ${Math.round(config.resetOtpTtlSeconds / 60)} minutes.`,
      '',
      'If you did not request a password reset, ignore this email.',
      '',
      'Western College Garba E-Pass System',
    ].join('\n'),
  });

  return { sent: true, provider: 'smtp' };
}