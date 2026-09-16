// Komunal: Telegram Bot API sender — plain fetch, 5 s timeout, never throws, never logs the token.
import "server-only"

type SendResult = { ok: true; messageId: number } | { ok: false; error: string }

export async function sendTelegramMessage(payload: {
  text: string
  reply_markup?: unknown
  threadId?: number
}): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId)
    return { ok: false, error: "Telegram is not configured" }

  const redact = (value: string) => value.split(token).join("<token>")

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: payload.text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          ...(payload.threadId ? { message_thread_id: payload.threadId } : {}),
          ...(payload.reply_markup
            ? { reply_markup: payload.reply_markup }
            : {}),
        }),
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      }
    )
    const body = (await res.json().catch(() => null)) as
      | { ok: true; result: { message_id: number } }
      | { ok: false; description?: string }
      | null

    if (body && body.ok) return { ok: true, messageId: body.result.message_id }
    const description = body && !body.ok ? body.description : undefined
    return {
      ok: false,
      error: redact(
        `HTTP ${res.status}${description ? `: ${description}` : ""}`
      ),
    }
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    return { ok: false, error: redact(message).slice(0, 500) }
  }
}
