/**
 * Builds the email payload for initial email verification.
 *
 * @param {string} firstname - The user's first name.
 * @param {string} rawCode - The plain-text 6-digit verification code.
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildVerificationEmail(firstname, rawCode) {
  return {
    subject: "Confirm your email address",
    text: `Hi ${firstname},

thank you for signing up for ProPerform.

Your verification code is:

${rawCode}

Important: This code is valid for 15 minutes.

If you did not sign up, you can safely ignore this email.

– The ProPerform Team
properform.app`,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0d0e10;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background: #111214;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .header {
        padding: 36px 36px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1F3A8A;
        display: inline-block;
        margin-right: 2px;
      }
      .brand {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        letter-spacing: -0.01em;
      }
      .content {
        padding: 36px;
      }
      .greeting {
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 12px 0;
        letter-spacing: -0.02em;
      }
      .body-text {
        font-size: 14px;
        color: rgba(255,255,255,0.45);
        line-height: 1.65;
        margin: 0 0 28px 0;
      }
      .code-box {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 12px;
        padding: 24px;
        margin: 0 0 28px 0;
        text-align: center;
      }
      .code-label {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
      }
      .code {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 10px;
        font-family: 'Courier New', monospace;
        margin: 0;
      }
      .notice {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 10px;
        padding: 14px 16px;
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        line-height: 1.55;
      }
      .notice strong { color: rgba(255,255,255,0.65); }
      .footer {
        padding: 20px 36px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .footer p {
        font-size: 11.5px;
        color: rgba(255,255,255,0.2);
        line-height: 1.6;
        margin: 0;
      }
      .footer a {
        color: rgba(255,255,255,0.3);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">

        <div class="header">
          <span class="dot"></span>
          <span class="brand">ProPerform</span>
        </div>

        <div class="content">
          <p class="greeting">Hi ${firstname},</p>
          <p class="body-text">
            thank you for signing up! To activate your account, please use the verification code below.
          </p>

          <div class="code-box">
            <p class="code-label">Verification code</p>
            <p class="code">${rawCode}</p>
          </div>

          <div class="notice">
            <strong>⏱ This code is valid for 15 minutes.</strong><br>
            If you did not sign up for ProPerform, you can safely ignore this email.
          </div>
        </div>

        <div class="footer">
          <p>
            <strong style="color:rgba(255,255,255,0.3)">ProPerform</strong> &nbsp;·&nbsp;
            <a href="https://properform.app">properform.app</a><br>
            This is an automatically generated email. Please do not reply to this message.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>
        `,
  };
}

/**
 * Builds the email payload for password reset.
 *
 * @param {string} firstname - The user's first name.
 * @param {string} resetLink - The full password reset URL including the raw token.
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildResetPasswordEmail(firstname, resetLink) {
  return {
    subject: "Reset your password",
    text: `Hi ${firstname},

you requested a password reset for your ProPerform account.

Reset your password here:
${resetLink}

Important: This link is valid for 15 minutes.

If you did not request this, you can safely ignore this email.

– The ProPerform Team
properform.app`,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0d0e10;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background: #111214;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .header {
        padding: 36px 36px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1F3A8A;
        display: inline-block;
        margin-right: 2px;
      }
      .brand {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        letter-spacing: -0.01em;
      }
      .content {
        padding: 36px;
      }
      .greeting {
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 12px 0;
        letter-spacing: -0.02em;
      }
      .body-text {
        font-size: 14px;
        color: rgba(255,255,255,0.45);
        line-height: 1.65;
        margin: 0 0 32px 0;
      }
      .btn-wrap {
        margin: 0 0 32px 0;
      }
      .btn {
        display: inline-block;
        background: #1F3A8A;
        color: #ffffff !important;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        padding: 13px 28px;
        border-radius: 10px;
        letter-spacing: -0.01em;
      }
      .link-fallback {
        margin: 0 0 28px 0;
      }
      .link-label {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .link-url {
        font-size: 12px;
        color: rgba(255,255,255,0.3);
        word-break: break-all;
        line-height: 1.5;
      }
      .notice {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 10px;
        padding: 14px 16px;
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        line-height: 1.55;
      }
      .notice strong { color: rgba(255,255,255,0.65); }
      .footer {
        padding: 20px 36px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .footer p {
        font-size: 11.5px;
        color: rgba(255,255,255,0.2);
        line-height: 1.6;
        margin: 0;
      }
      .footer a {
        color: rgba(255,255,255,0.3);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">

        <div class="header">
          <span class="dot"></span>
          <span class="brand">ProPerform</span>
        </div>

        <div class="content">
          <p class="greeting">Hi ${firstname},</p>
          <p class="body-text">
            you requested a password reset for your ProPerform account.
            Click the button below to set a new password.
          </p>

          <div class="btn-wrap">
            <a href="${resetLink}" class="btn">Reset password</a>
          </div>

          <div class="link-fallback">
            <p class="link-label">Or copy this link</p>
            <p class="link-url">${resetLink}</p>
          </div>

          <div class="notice">
            <strong>⏱ This link is valid for 15 minutes.</strong><br>
            If you did not request this, you can safely ignore this email.
          </div>
        </div>

        <div class="footer">
          <p>
            <strong style="color:rgba(255,255,255,0.3)">ProPerform</strong> &nbsp;·&nbsp;
            <a href="https://properform.app">properform.app</a><br>
            This is an automatically generated email. Please do not reply to this message.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>`,
  };
}

/**
 * Builds the email payload for resending a verification code.
 *
 * @param {string} firstname - The user's first name.
 * @param {string} rawCode - The new plain-text 6-digit verification code.
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildResendVerificationEmail(firstname, rawCode) {
  return {
    subject: "Your new verification code",
    text: `Hi ${firstname},

here is your new verification code:

${rawCode}

Important: This code is valid for 15 minutes.

If you did not request this code, you can safely ignore this email.

– The ProPerform Team
properform.app`,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0d0e10;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background: #111214;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .header {
        padding: 36px 36px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1F3A8A;
        display: inline-block;
        margin-right: 2px;
      }
      .brand {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        letter-spacing: -0.01em;
      }
      .content {
        padding: 36px;
      }
      .greeting {
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 12px 0;
        letter-spacing: -0.02em;
      }
      .body-text {
        font-size: 14px;
        color: rgba(255,255,255,0.45);
        line-height: 1.65;
        margin: 0 0 28px 0;
      }
      .code-box {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 12px;
        padding: 24px;
        margin: 0 0 28px 0;
        text-align: center;
      }
      .code-label {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
      }
      .code {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 10px;
        font-family: 'Courier New', monospace;
        margin: 0;
      }
      .notice {
        background: rgba(31,58,138,0.08);
        border: 1px solid rgba(31,58,138,0.2);
        border-radius: 10px;
        padding: 14px 16px;
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        line-height: 1.55;
      }
      .notice strong { color: rgba(255,255,255,0.65); }
      .footer {
        padding: 20px 36px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .footer p {
        font-size: 11.5px;
        color: rgba(255,255,255,0.2);
        line-height: 1.6;
        margin: 0;
      }
      .footer a {
        color: rgba(255,255,255,0.3);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">

        <div class="header">
          <span class="dot"></span>
          <span class="brand">ProPerform</span>
        </div>

        <div class="content">
          <p class="greeting">Hi ${firstname},</p>
          <p class="body-text">
            you requested a new verification code. Use the code below to complete your verification.
          </p>

          <div class="code-box">
            <p class="code-label">Verification code</p>
            <p class="code">${rawCode}</p>
          </div>

          <div class="notice">
            <strong>⏱ This code is valid for 15 minutes.</strong><br>
            If you did not request this code, you can safely ignore this email.
          </div>
        </div>

        <div class="footer">
          <p>
            <strong style="color:rgba(255,255,255,0.3)">ProPerform</strong> &nbsp;·&nbsp;
            <a href="https://properform.app">properform.app</a><br>
            This is an automatically generated email. Please do not reply to this message.
          </p>
        </div>

      </div>
    </div>
  </body>
</html>`,
  };
}
