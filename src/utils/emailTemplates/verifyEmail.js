export const verifyEmailTemplate = (link, fullName = "") => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>

      <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

                <tr>
                  <td style="background:#ff6b81; color:#fff; text-align:center; padding:20px; font-size:24px; font-weight:bold;">
                    Skintify
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px;">
                    <h2>Hello ${fullName || "there"},</h2>

                    <p>
                      Thank you for registering for an account on <b>Skintify</b>!
                    </p>

                    <p>
                      Please click the button below to verify your email address:
                    </p>

                    <div style="text-align:center; margin:30px 0;">
                      <a href="${link}" style="background:#ff6b81; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
                        Verify Email
                      </a>
                    </div>

                    <p>
                      If the button does not work, copy and paste the following link into your browser:
                    </p>

                    <p style="word-break:break-all; color:#555;">
                      ${link}
                    </p>

                    <p>
                      If you didn't request this, simply ignore this message.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center; padding:15px; font-size:12px; color:#888;">
                    © 2026 Skintify.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>

    </html>
  `;
};