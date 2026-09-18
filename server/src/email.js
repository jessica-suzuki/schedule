// Envio de e-mail via Resend (https://resend.com). Usa fetch nativo do
// Node — sem dependência extra no package.json.

const RESEND_API_URL = 'https://api.resend.com/emails'

export async function enviarEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESET_EMAIL_FROM || 'onboarding@resend.dev'

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      `RESEND_API_KEY não configurada — e-mail não enviado. Assunto: "${subject}" para ${to}.`
    )
    return { enviado: false }
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    const corpo = await res.text().catch(() => '')
    throw new Error(`Falha ao enviar e-mail via Resend (${res.status}): ${corpo}`)
  }

  return { enviado: true }
}

export function emailRedefinirSenha(link) {
  return {
    subject: 'Redefinir sua senha — Studio Michelle Lima',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#7a2e3a;">Redefinir sua senha</h2>
        <p>Recebemos um pedido para redefinir a senha da sua conta no painel do Studio Michelle Lima.</p>
        <p>
          <a href="${link}" style="display:inline-block; background:#7a2e3a; color:#fff; padding:12px 24px; border-radius:24px; text-decoration:none; font-weight:600;">
            Redefinir senha
          </a>
        </p>
        <p>Ou copie e cole este link no navegador:</p>
        <p style="word-break: break-all; color:#555;">${link}</p>
        <p style="color:#888; font-size:13px;">
          Este link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.
        </p>
      </div>
    `,
  }
}
