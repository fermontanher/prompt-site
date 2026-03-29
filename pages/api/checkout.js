import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro:     process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { plan } = req.body;
  if (!plan || !PRICE_IDS[plan]) return res.status(400).json({ error: "Plano inválido." });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${baseUrl}/sucesso?plan=${plan}`,
      cancel_url: `${baseUrl}/#planos`,
      locale: "pt-BR",
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao iniciar pagamento." });
  }
}
