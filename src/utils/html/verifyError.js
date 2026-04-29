export const getVerifyErrorHTML = (message) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Verification Failed</title>
      </head>
      <body style="font-family: Arial; text-align: center; margin-top: 80px;">
        <h1 style="color: red;">❌ Verification Failed</h1>
        <p>${message}</p>
        <p>Please request a new verification email.</p>
      </body>
    </html>
  `;
};