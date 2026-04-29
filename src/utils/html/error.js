export const getErrorHTML = (message) => `
  <!DOCTYPE html>
    <html>
    <head>
      <title>Error</title>
    </head>
    <body style="font-family:Arial; text-align:center; margin-top:80px;">
      <h2 style="color:red;">Error</h2>
      <p>${message}</p>
    </body>
  </html>
`;