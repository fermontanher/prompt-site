import { useRouter } from "next/router";
export default function Sucesso() {
  const router = useRouter();
  const { plan } = router.query;
  const planNames = { starter: "Starter", pro: "Pro", premium: "Premium" };
  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, sans-serif", padding:"2rem" }}>
      <div style={{ textAlign:"center", maxWidth:520 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(134,239,172,0.15)", border:"1px solid rgba(134,239,172,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", fontSize:"2rem" }}>✓</div>
        <h1 style={{ fontWeight:700, fontSize:"2rem", color:"white", marginBottom:"0.75rem" }}>Pagamento confirmado! 🚀</h1>
        {plan && <p style={{ color:"#a5b4fc", fontWeight:500, marginBottom:"1rem" }}>Plano {planNames[plan] || plan}</p>}
        <p style={{ fontWeight:300, color:"rgba(255,255,255,0.5)", lineHeight:1.75, marginBottom:"2rem" }}>Recebi seu pedido e já estou trabalhando no seu site. Em breve você receberá um contato para iniciarmos o briefing.</p>
        <button onClick={() => router.push("/")} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", border:"none", borderRadius:12, padding:"0.9rem 2rem", fontSize:"1rem", fontWeight:600, cursor:"pointer" }}>Voltar para o início</button>
      </div>
    </div>
  );
}
