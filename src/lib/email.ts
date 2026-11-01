import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'pentarch.agency';

export async function sendInvitationEmail({
  to,
  orgName,
  orgSlug,
  role,
  password,
}: {
  to: string;
  orgName: string;
  orgSlug: string;
  role: string;
  password?: string;
  invitedByEmail?: string;
}) {
  const loginUrl = `https://admin.${APP_DOMAIN}/login`;

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const credentialsBlock = password
    ? `
        <div style="background: #F8F9FB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px 28px; margin: 28px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0 0 16px 0;">
                <span style="color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.02em;">Your login credentials</span>
              </td>
            </tr>
            <tr>
              <td style="color: #6B7280; font-size: 11px; padding: 8px 0 4px 0; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Email</td>
            </tr>
            <tr>
              <td style="color: #111827; font-size: 14px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; padding: 2px 0 14px 0; word-break: break-all; -webkit-user-select: all; user-select: all; cursor: pointer;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 0;"><div style="border-top: 1px solid #E5E7EB; margin: 0;"></div></td>
            </tr>
            <tr>
              <td style="color: #6B7280; font-size: 11px; padding: 14px 0 4px 0; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Password <span style="font-weight: 400; text-transform: none; letter-spacing: 0; color: #9CA3AF;">&mdash; click to select, then copy</span></td>
            </tr>
            <tr>
              <td style="padding: 2px 0 0 0;">
                <code style="color: #E04412; font-size: 15px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; background: #FFF7F5; padding: 10px 16px; border-radius: 6px; border: 1px solid #FED7CB; display: inline-block; letter-spacing: 0.04em; cursor: pointer; -webkit-user-select: all; user-select: all;">${password}</code>
              </td>
            </tr>
          </table>
        </div>
      `
    : `
        <div style="background: #F8F9FB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px 24px; margin: 28px 0;">
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0;">
            Use your existing Pentarch credentials to log in.
          </p>
        </div>
      `;

  const { data, error } = await resend.emails.send({
    from: `Pentarch Agency <noreply@${APP_DOMAIN}>`,
    to,
    subject: `You've been invited to ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
      <body style="margin: 0; padding: 0; background: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 16px;">

          <!-- Main card -->
          <div style="background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.04);">

            <!-- Top accent bar -->
            <div style="height: 4px; background: linear-gradient(90deg, #E04412 0%, #FF6B47 100%);"></div>

            <div style="padding: 48px 40px 40px 40px;">

              <!-- Logo -->
              <div style="margin-bottom: 32px;">
                <span style="font-size: 16px; font-weight: 700; color: #111827; letter-spacing: 0.14em; text-transform: uppercase;">PENTARCH</span>
              </div>

              <!-- Badge -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; background: #ECFDF5; color: #059669; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid #A7F3D0;">Invitation</span>
              </div>

              <!-- Heading -->
              <h1 style="color: #111827; font-size: 26px; font-weight: 700; margin: 0 0 14px 0; line-height: 1.3; letter-spacing: -0.01em;">
                You're invited to ${orgName}
              </h1>

              <!-- Subtext -->
              <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 4px 0;">
                A <strong style="color: #111827;">Pentarch</strong> admin has added you as a <strong style="color: #111827;">${roleLabel}</strong> to <strong style="color: #111827;">${orgName}</strong>. Log in to access your dashboard, projects, and team resources.
              </p>

              <!-- Credentials -->
              ${credentialsBlock}

              <!-- CTA Button -->
              <div style="margin: 32px 0 28px 0; text-align: center;">
                <a href="${loginUrl}"
                   style="display: inline-block; padding: 14px 40px; background: #E04412; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.02em; line-height: 1;">
                  Open your dashboard &rarr;
                </a>
              </div>

              ${password ? `
                <div style="text-align: center; margin-bottom: 8px;">
                  <p style="color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.5;">
                    For security, please change your password after your first login.
                  </p>
                </div>
              ` : ''}

            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px 0 40px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.6;">
              &copy; ${new Date().getFullYear()} Pentarch Agency &middot;
              <a href="https://${APP_DOMAIN}" style="color: #9CA3AF; text-decoration: none;">${APP_DOMAIN}</a>
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  return data;
}
