import nodemailer from "nodemailer"

const DEFAULT_APP_URL = "https://lawliet-lilac.vercel.app"

function getMailboxCredentials() {
  const user = process.env.GMAIL_USER?.trim()
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "")

  if (!user || !password) {
    throw new Error("Gmail delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.")
  }

  return { user, password }
}

function getAppUrl() {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    DEFAULT_APP_URL
  )
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function getTransporter() {
  const { user, password } = getMailboxCredentials()

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass: password,
    },
  })
}

export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim())
}

async function sendMail(options: {
  to: string
  subject: string
  text: string
  html: string
}) {
  const { user } = getMailboxCredentials()
  return getTransporter().sendMail({
    from: `LawlietGPT Support <${user}>`,
    replyTo: user,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
}

export async function sendPasswordResetEmail(params: {
  email: string
  name?: string | null
  token: string
}) {
  const recipientName = params.name?.trim() || "there"
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(params.token)}`
  const safeName = escapeHtml(recipientName)

  return sendMail({
    to: params.email,
    subject: "Reset your LawlietGPT password",
    text: `Hi ${recipientName},\n\nWe received a request to reset your LawlietGPT password. Use this link within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email. Your password will not change unless the link is used.\n\nLawlietGPT Support`,
    html: `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:18px"><div style="font-size:24px;font-weight:700;color:#3157d5">LawlietGPT</div><h1 style="font-size:24px;margin:28px 0 12px">Reset your password</h1><p>Hi ${safeName},</p><p>We received a request to reset your LawlietGPT password. This link expires in <strong>30 minutes</strong> and can only be used once.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;padding:13px 20px;background:#3157d5;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Reset password</a></p><p style="font-size:13px;color:#5d687d">If you did not request this, you can safely ignore this email. Your password will not change unless the link is used.</p><p style="font-size:13px;color:#5d687d">If the button does not work, copy and paste this link into your browser:<br>${resetUrl}</p><p style="margin-top:28px;font-size:13px;color:#5d687d">LawlietGPT Support</p></div></body></html>`,
  })
}

export async function sendWelcomeEmail(params: {
  email: string
  name?: string | null
}) {
  const recipientName = params.name?.trim() || "there"
  const safeName = escapeHtml(recipientName)
  const signInUrl = `${getAppUrl()}/auth/signin`

  return sendMail({
    to: params.email,
    subject: "Welcome to LawlietGPT",
    text: `Hi ${recipientName},\n\nYour LawlietGPT account is ready. Sign in here: ${signInUrl}\n\nIf you need help, contact LawlietGPT Support at ${getMailboxCredentials().user}.`,
    html: `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:18px"><div style="font-size:24px;font-weight:700;color:#3157d5">LawlietGPT</div><h1 style="font-size:24px;margin:28px 0 12px">Welcome to LawlietGPT</h1><p>Hi ${safeName},</p><p>Your account is ready. Start a conversation with Lawliet whenever you are ready.</p><p style="margin:28px 0"><a href="${signInUrl}" style="display:inline-block;padding:13px 20px;background:#3157d5;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Sign in</a></p><p style="font-size:13px;color:#5d687d">Need help? Reply to this email and our support team will assist you.</p><p style="margin-top:28px;font-size:13px;color:#5d687d">LawlietGPT Support</p></div></body></html>`,
  })
}

export async function sendSupportNotification(params: {
  subject: string
  message: string
  replyTo?: string
}) {
  const { user } = getMailboxCredentials()
  return getTransporter().sendMail({
    from: `LawlietGPT Website <${user}>`,
    replyTo: params.replyTo || user,
    to: user,
    subject: params.subject,
    text: params.message,
  })
}

export async function sendPasswordChangedEmail(params: {
  email: string
  name?: string | null
}) {
  const recipientName = params.name?.trim() || "there"
  const safeName = escapeHtml(recipientName)
  const signInUrl = `${getAppUrl()}/auth/signin`

  return sendMail({
    to: params.email,
    subject: "Your LawlietGPT password was changed",
    text: `Hi ${recipientName},\n\nYour LawlietGPT password was changed successfully. If you did not make this change, contact ${getMailboxCredentials().user} immediately.\n\nSign in: ${signInUrl}\n\nLawlietGPT Support`,
    html: `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:18px"><div style="font-size:24px;font-weight:700;color:#3157d5">LawlietGPT</div><h1 style="font-size:24px;margin:28px 0 12px">Password changed</h1><p>Hi ${safeName},</p><p>Your LawlietGPT password was changed successfully.</p><p style="font-size:13px;color:#5d687d">If you did not make this change, contact support immediately at ${getMailboxCredentials().user}.</p><p style="margin:28px 0"><a href="${signInUrl}" style="display:inline-block;padding:13px 20px;background:#3157d5;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Sign in to LawlietGPT</a></p><p style="margin-top:28px;font-size:13px;color:#5d687d">LawlietGPT Support</p></div></body></html>`,
  })
}
