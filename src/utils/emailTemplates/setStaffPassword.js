export const setStaffPasswordTemplate = (link, fullName = "") => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Set Your Password</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 0;">
            
            <table width="500" cellpadding="0" cellspacing="0" 
              style="background:#fff; border-radius:8px; padding:30px;">

              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0; color:#333;">Welcome to Skintify</h2>
                </td>
              </tr>

              <tr>
                <td style="color:#555; font-size:14px; line-height:1.6;">
                  <h2>Hi ${fullName || "there"},</h2>
                  <p>Your account has been created by the administrator.</p>
                  <p>Please click the button below to set your password and activate your account:</p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:20px 0;">
                  <a href="${link}" 
                    style="background:#007bff; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:14px;">
                    Set Your Password
                  </a>
                </td>
              </tr>

              <tr>
                <td style="color:#777; font-size:12px; word-break:break-all;">
                  <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                  <p>${link}</p>
                </td>
              </tr>

              <tr>
                <td style="padding-top:20px; color:#999; font-size:12px;">
                  <p>This link will expire in 24 hours.</p>
                  <p>If you did not expect this email, please contact your administrator.</p>
                </td>
              </tr>

              <tr>
                <td style="padding-top:20px; text-align:center; font-size:12px; color:#bbb;">
                  <p>© Skintify.</p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
  </html>
`;