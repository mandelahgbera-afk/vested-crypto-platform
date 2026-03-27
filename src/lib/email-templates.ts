/**
 * VESTED EMAIL TEMPLATES
 * Modern, responsive HTML email templates with premium design
 * These are custom templates (not Supabase defaults)
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base email layout with header and footer
 */
const emailBase = (content: string, footerText: string = 'Vested - Crypto Trading Made Simple'): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f7fa; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; }
      .header { background: linear-gradient(135deg, #6938ef 0%, #d534d8 100%); padding: 40px 20px; text-align: center; }
      .header h1 { color: white; font-size: 28px; font-weight: 700; }
      .content { padding: 40px 30px; color: #0C111D; }
      .content p { margin-bottom: 16px; line-height: 1.6; font-size: 16px; }
      .cta-button { display: inline-block; padding: 14px 32px; background-color: #6938ef; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; transition: background-color 0.3s; }
      .cta-button:hover { background-color: #5a2dd1; }
      .feature { background-color: #f5f7fa; padding: 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #6938ef; }
      .feature h3 { color: #6938ef; margin-bottom: 8px; font-size: 14px; font-weight: 600; }
      .feature p { font-size: 14px; color: #A5ACBA; }
      .footer { background-color: #f5f7fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
      .footer p { font-size: 12px; color: #A5ACBA; margin-bottom: 8px; }
      .footer a { color: #6938ef; text-decoration: none; }
      .divider { height: 1px; background-color: #e5e7eb; margin: 24px 0; }
      .highlight { color: #6938ef; font-weight: 600; }
      .code { background-color: #f5f7fa; padding: 12px 16px; border-radius: 6px; font-family: 'Monaco', monospace; font-size: 14px; color: #0C111D; overflow-x: auto; }
      @media (max-width: 600px) {
        .container { width: 100%; }
        .content { padding: 24px 16px; }
        .header { padding: 24px 16px; }
        .cta-button { display: block; text-align: center; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Vested</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>${footerText}</p>
        <p><a href="https://vested.com">Visit Website</a> | <a href="https://vested.com/support">Support</a></p>
        <p>© 2024 Vested. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

/**
 * Email Confirmation Template
 */
export const confirmationEmail = (userName: string, confirmLink: string): EmailTemplate => ({
  subject: 'Confirm your Vested account',
  html: emailBase(`
    <h2>Hello ${userName}! 👋</h2>
    <p>Thank you for creating a Vested account. We&apos;re excited to have you join our crypto trading community!</p>
    <p>Please confirm your email address by clicking the button below:</p>
    <center>
      <a href="${confirmLink}" class="cta-button">Confirm Email Address</a>
    </center>
    <p style="text-align: center; font-size: 12px; color: #A5ACBA; margin-top: 24px;">
      Or copy and paste this link:<br>
      <code class="code">${confirmLink}</code>
    </p>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #A5ACBA;">
      If you didn&apos;t create this account, please ignore this email. This link expires in 24 hours.
    </p>
  `, 'Welcome to Vested'),
  text: `Hello ${userName}!\n\nThank you for creating a Vested account. Please confirm your email by visiting: ${confirmLink}\n\nThis link expires in 24 hours.`,
});

/**
 * Deposit Confirmation Email
 */
export const depositConfirmationEmail = (userName: string, amount: string, currency: string, txHash?: string): EmailTemplate => ({
  subject: 'Deposit received - Vested',
  html: emailBase(`
    <h2>Deposit Confirmed! 💰</h2>
    <p>Hello ${userName},</p>
    <p>We&apos;ve received your deposit and it&apos;s now available in your wallet.</p>
    <div class="feature">
      <h3>DEPOSIT DETAILS</h3>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>Status:</strong> <span class="highlight">Confirmed</span></p>
      ${txHash ? `<p><strong>Transaction:</strong> <code class="code">${txHash}</code></p>` : ''}
    </div>
    <p>You can now start trading, or follow top traders to automatically copy their strategies.</p>
    <center>
      <a href="https://vested.com/dashboard" class="cta-button">View Your Wallet</a>
    </center>
    <div class="divider"></div>
    <h3 style="margin-top: 24px; margin-bottom: 12px;">Next Steps</h3>
    <div class="feature">
      <h3>🎯 EXPLORE TOP TRADERS</h3>
      <p>Discover and follow top-performing traders. Copy their trades automatically.</p>
    </div>
    <div class="feature">
      <h3>📊 SET UP YOUR PORTFOLIO</h3>
      <p>Track your holdings and monitor your profits in real-time.</p>
    </div>
  `, 'Transaction Confirmed'),
  text: `Hello ${userName},\n\nYour deposit of ${amount} ${currency} has been confirmed and is now available in your wallet.\n\nVisit https://vested.com/dashboard to get started.`,
});

/**
 * Withdrawal Confirmation Email
 */
export const withdrawalConfirmationEmail = (userName: string, amount: string, currency: string, address: string): EmailTemplate => ({
  subject: 'Withdrawal initiated - Vested',
  html: emailBase(`
    <h2>Withdrawal Initiated ✨</h2>
    <p>Hello ${userName},</p>
    <p>Your withdrawal request has been received and is being processed.</p>
    <div class="feature">
      <h3>WITHDRAWAL DETAILS</h3>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>To Address:</strong> <code class="code">${address.substring(0, 10)}...${address.substring(address.length - 10)}</code></p>
      <p><strong>Status:</strong> <span class="highlight">Processing</span></p>
    </div>
    <p>We&apos;re processing your withdrawal. You&apos;ll receive another confirmation email once it&apos;s complete.</p>
    <p style="font-size: 12px; color: #A5ACBA;">
      <strong>⏱️ Expected time:</strong> 10-30 minutes depending on network conditions.
    </p>
    <center>
      <a href="https://vested.com/transactions" class="cta-button">Track Transaction</a>
    </center>
  `, 'Withdrawal Processing'),
  text: `Hello ${userName},\n\nYour withdrawal of ${amount} ${currency} has been initiated.\n\nAmount: ${amount} ${currency}\nTo: ${address}\n\nTrack your withdrawal: https://vested.com/transactions`,
});

/**
 * Security Alert Email
 */
export const securityAlertEmail = (userName: string, action: string, deviceInfo?: string): EmailTemplate => ({
  subject: 'Security Alert - Vested',
  html: emailBase(`
    <h2>⚠️ Security Alert</h2>
    <p>Hello ${userName},</p>
    <p>We detected unusual activity on your Vested account:</p>
    <div class="feature" style="border-left-color: #f59e0b;">
      <h3 style="color: #f59e0b;">ACTIVITY DETECTED</h3>
      <p><strong>Action:</strong> ${action}</p>
      ${deviceInfo ? `<p><strong>Device:</strong> ${deviceInfo}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p><strong>Was this you?</strong></p>
    <p>If you recognize this activity, you can ignore this email. If this wasn&apos;t you, please secure your account immediately:</p>
    <center>
      <a href="https://vested.com/profile/security" class="cta-button">Review Account Security</a>
    </center>
    <p style="font-size: 12px; color: #A5ACBA; margin-top: 24px;">
      Never share your password or recovery codes. Vested staff will never ask for these.<br>
      If you need help, contact <a href="mailto:support@vested.com">support@vested.com</a>
    </p>
  `, 'Account Security'),
  text: `Hello ${userName},\n\nWe detected activity on your account: ${action}\n\nIf this wasn't you, please secure your account: https://vested.com/profile/security`,
});

/**
 * Password Reset Email
 */
export const passwordResetEmail = (userName: string, resetLink: string): EmailTemplate => ({
  subject: 'Reset your Vested password',
  html: emailBase(`
    <h2>Password Reset Request</h2>
    <p>Hello ${userName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <center>
      <a href="${resetLink}" class="cta-button">Reset Password</a>
    </center>
    <p style="text-align: center; font-size: 12px; color: #A5ACBA; margin-top: 24px;">
      This link expires in 1 hour.
    </p>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #A5ACBA;">
      If you didn&apos;t request this, please ignore this email. Your password won&apos;t change until you confirm with a new password.
    </p>
  `, 'Password Reset'),
  text: `Hello ${userName},\n\nReset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
});

/**
 * Trade Alert Email (for followed traders)
 */
export const tradeAlertEmail = (traderName: string, action: 'BUY' | 'SELL', cryptoSymbol: string, amount: string, price: string): EmailTemplate => ({
  subject: `Trade Alert: ${traderName} ${action} ${amount} ${cryptoSymbol}`,
  html: emailBase(`
    <h2>Trade Alert 📈</h2>
    <p>Hello,</p>
    <p>Your followed trader <span class="highlight">${traderName}</span> just executed a trade:</p>
    <div class="feature">
      <h3>${action === 'BUY' ? '🟢 BUY' : '🔴 SELL'} ORDER</h3>
      <p><strong>Trader:</strong> ${traderName}</p>
      <p><strong>Asset:</strong> ${amount} ${cryptoSymbol}</p>
      <p><strong>Price:</strong> $${price}</p>
    </div>
    <p>You can enable auto-copy to automatically execute the same trades. Check your settings to manage notifications.</p>
    <center>
      <a href="https://vested.com/copytraders" class="cta-button">View Trader</a>
    </center>
  `, 'Trade Notification'),
  text: `${traderName} just ${action}d ${amount} ${cryptoSymbol} at $${price}. View: https://vested.com/copytraders`,
});

/**
 * Weekly Summary Email
 */
export const weeklySummaryEmail = (userName: string, stats: { profit: string; trades: number; topTrader: string; }): EmailTemplate => ({
  subject: 'Your Weekly Trading Summary - Vested',
  html: emailBase(`
    <h2>Weekly Summary 📊</h2>
    <p>Hello ${userName},</p>
    <p>Here&apos;s how your portfolio performed this week:</p>
    <div class="feature">
      <h3>💵 PROFIT / LOSS</h3>
      <p style="font-size: 24px; color: ${stats.profit.startsWith('-') ? '#ef4444' : '#10b981'}; font-weight: 700;">
        ${stats.profit.startsWith('-') ? '−' : '+'}${stats.profit}
      </p>
    </div>
    <div class="feature">
      <h3>📈 TRADES EXECUTED</h3>
      <p>${stats.trades} trades completed</p>
    </div>
    <div class="feature">
      <h3>⭐ TOP PERFORMER</h3>
      <p>You're following <span class="highlight">${stats.topTrader}</span></p>
    </div>
    <center>
      <a href="https://vested.com/dashboard" class="cta-button">View Full Dashboard</a>
    </center>
  `, 'Weekly Performance Summary'),
  text: `Weekly Summary\n\nProfit/Loss: ${stats.profit}\nTrades: ${stats.trades}\nTop Trader: ${stats.topTrader}\n\nView: https://vested.com/dashboard`,
});
