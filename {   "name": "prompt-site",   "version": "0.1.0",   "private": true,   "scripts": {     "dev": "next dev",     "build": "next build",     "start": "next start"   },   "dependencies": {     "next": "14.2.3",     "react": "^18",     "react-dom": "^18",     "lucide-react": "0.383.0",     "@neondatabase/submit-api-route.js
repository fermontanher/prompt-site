// pages/api/submit.js  — Next.js API Route
// Receives briefing form data and stores it in Neon (PostgreSQL)

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, contact, business, audience, differentiator, plan } = req.body;

  // Basic validation
  if (!name || !contact || !business) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, contato e descrição do negócio." });
  }

  // Connect to Neon via the DATABASE_URL env variable
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      INSERT INTO submissions (name, contact, business, audience, differentiator, plan)
      VALUES (
        ${name},
        ${contact},
        ${business},
        ${audience  || null},
        ${differentiator || null},
        ${plan      || null}
      )
    `;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[submit] DB error:", err);
    return res.status(500).json({ error: "Erro ao salvar. Tente novamente." });
  }
}
