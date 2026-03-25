// pages/api/checkout.js — Next.js API Route
// Cria uma sessão de pagamento no Stripe e redireciona o usuário

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IDs de preço criados no painel do Stripe
// Dashboard → Products → [plano] → copie o "Price ID" (price_xxx)
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,  // R$ 497
  pro:     process.env.STRIPE_PRICE_PRO,       // R$ 997
  premium: process.env.STRIPE_PRICE_PREMIUM,   // R$ 1.997
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan } = req.body;

  if (!plan || !PRICE_IDS[plan]) {
    return res.status(400).json({ error: "Plano inválido." });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url:  `${baseUrl}/#planos`,
      locale: "pt-BR",
      payment_method_types: ["card"],
      billing_address_collection: "required",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return res.status(500).json({ error: "Erro ao iniciar pagamento. Tente novamente." });
  }
}
