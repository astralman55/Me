// POST /api/subscribe — forwards an email address to Buttondown.
// Set BUTTONDOWN_API_KEY in Vercel → Project → Settings → Environment Variables.
// No dependencies. Accepts JSON (from site.js) or a plain form post (no-JS fallback).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  const wantsJson = (req.headers.accept || "").includes("application/json");
  const reply = (status, body) => {
    if (wantsJson) return res.status(status).json(body);
    const q = status < 300 ? "subscribed=1" : "error=1";
    res.writeHead(303, { Location: `/subscribe?${q}` });
    return res.end();
  };

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const email = String(body.email || "").trim().toLowerCase();

  // Honeypot: bots fill hidden fields. Pretend it worked.
  if (body.website) return reply(200, { message: "Thanks!" });
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply(400, { error: "That doesn't look like an email address." });
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) {
    console.error("BUTTONDOWN_API_KEY is not set");
    return reply(503, { error: "The newsletter isn't open yet. Check back soon." });
  }

  try {
    const r = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: email, referrer_url: req.headers.referer || "" })
    });
    if (r.ok) return reply(200, { message: "You're in. Check your inbox to confirm." });

    const text = await r.text();
    // Already subscribed is a success from the reader's point of view.
    if (r.status === 400 && /already|exists/i.test(text)) {
      return reply(200, { message: "You're already subscribed. Thanks!" });
    }
    console.error("Buttondown error", r.status, text);
    return reply(502, { error: "Couldn't subscribe right now. Try again in a minute." });
  } catch (err) {
    console.error(err);
    return reply(502, { error: "Couldn't subscribe right now. Try again in a minute." });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return Object.fromEntries(new URLSearchParams(s)); }
}
