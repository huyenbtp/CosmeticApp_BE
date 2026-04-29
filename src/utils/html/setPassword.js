export const getSetPassFormHTML = (token) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Reset Password</title>
    </head>
    <body style="font-family:Arial; background:#f4f6f8; text-align:center; padding-top:80px;">
      
      <div style="background:#fff; width:400px; margin:auto; padding:30px; border-radius:8px;">
        
        <h2>Reset Your Password</h2>

        <form method="POST" action="/auth/reset-password">
          <input type="hidden" name="token" value="${token}" />

          <input 
            type="password" 
            name="newPassword" 
            placeholder="Enter new password"
            required
            style="width:100%; padding:10px; margin-top:15px;"
          />

          <button 
            type="submit"
            style="margin-top:20px; padding:10px 20px; background:#ff6b81; color:#fff; border:none; border-radius:6px;">
            Reset Password
          </button>
        </form>

      </div>

    </body>
  </html>
`;