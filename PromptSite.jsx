import { useState, useEffect, useRef, useCallback } from "react";
import {
  MousePointer2, ArrowRight, Check, X, Sparkles, Clock,
  DollarSign, AlertTriangle, Zap, Globe, Code, Shield,
  Rocket, Star, Users, Bot, Layers, Terminal, ChevronDown,
  TrendingUp, Target, Lock, Menu
} from "lucide-react";

// ─── Google Fonts Loader ──────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    if (!document.querySelector("#inter-font-link")) {
      const link = document.createElement("link");
      link.id = "inter-font-link";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);
  return null;
};

// ─── Particle Canvas ──────────────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const bgParticlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const frameRef = useRef(0);

  const rnd = (min, max) => Math.random() * (max - min) + min;

  const init = useCallback((w, h) => {
    const count = Math.floor(w * h * 0.00012);
    const ps = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ps.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, size: rnd(1, 2.5), accent: Math.random() > 0.88 });
    }
    particlesRef.current = ps;

    const bgCount = Math.floor(w * h * 0.00004);
    const bg = [];
    for (let i = 0; i < bgCount; i++) {
      bg.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        size: rnd(0.5, 1.5), alpha: rnd(0.1, 0.35), phase: Math.random() * Math.PI * 2,
      });
    }
    bgParticlesRef.current = bg;
  }, []);

  const animate = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Radial glow
    const pulse = Math.sin(t * 0.0007) * 0.04 + 0.08;
    const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.65);
    grd.addColorStop(0, `rgba(99,102,241,${pulse})`);
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background stars
    for (const p of bgParticlesRef.current) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const tw = Math.sin(t * 0.002 + p.phase) * 0.5 + 0.5;
      ctx.globalAlpha = p.alpha * (0.3 + 0.7 * tw);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const mouse = mouseRef.current;
    const R = 150;

    for (const p of particlesRef.current) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (mouse.active && dist < R && dist > 0) {
        const f = ((R - dist) / R) * 1.3;
        p.vx -= (dx / dist) * f * 5;
        p.vy -= (dy / dist) * f * 5;
      }
      p.vx += (p.ox - p.x) * 0.08;
      p.vy += (p.oy - p.y) * 0.08;
      p.vx *= 0.9; p.vy *= 0.9;
      p.x += p.vx; p.y += p.vy;

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const op = Math.min(0.2 + speed * 0.12, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.accent
        ? `rgba(99,102,241,${Math.min(op + 0.4, 1)})`
        : `rgba(255,255,255,${op})`;
      ctx.fill();
    }

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
      const ctx = canvasRef.current.getContext("2d");
      ctx.scale(dpr, dpr);
      init(width, height);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [init]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, overflow: "hidden", cursor: "crosshair" }}
      onMouseMove={(e) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (r) mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
      }}
      onMouseLeave={() => { mouseRef.current.active = false; }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      fontFamily: "Inter, sans-serif", fontWeight: 300,
      transition: "all 0.4s ease",
      background: scrolled || menuOpen ? "rgba(0,0,0,0.95)" : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(14px)" : "none",
      borderBottom: scrolled || menuOpen ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ color: "white", fontSize: "1.1rem", fontWeight: 300, letterSpacing: "0.03em" }}>Prompt Site</span>
        </div>

        {/* Links — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2.5rem" }}>
            {["Como funciona", "Planos", "Tecnologias"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", fontWeight: 300, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
                {l}
              </a>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* CTA — desktop only */}
          {!isMobile && (
            <button style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
              border: "none", borderRadius: 999, padding: "0.6rem 1.4rem",
              fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "Inter, sans-serif", transition: "transform 0.2s, opacity 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Começar agora
            </button>
          )}

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: "transparent", border: "none", color: "white",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0.25rem"
            }}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "1.25rem 1.5rem 1.5rem",
          display: "flex", flexDirection: "column", gap: "1.25rem"
        }}>
          {["Como funciona", "Planos", "Tecnologias"].map((l) => (
            <a key={l} href="#" onClick={() => setMenuOpen(false)}
              style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", fontWeight: 300, textDecoration: "none" }}>
              {l}
            </a>
          ))}
          <button onClick={() => setMenuOpen(false)} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
            border: "none", borderRadius: 999, padding: "0.75rem 1.4rem",
            fontSize: "0.95rem", fontWeight: 500, cursor: "pointer",
            fontFamily: "Inter, sans-serif", marginTop: "0.25rem"
          }}>
            Começar agora
          </button>
        </div>
      )}
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section style={{ position: "relative", minHeight: "100vh", background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <ParticleCanvas />
    {/* Gradient fade to black at bottom */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 40%, rgba(0,0,0,1) 100%)", zIndex: 10 }} />

    <div style={{ position: "relative", zIndex: 20, textAlign: "center", padding: "7rem 1.5rem 4rem", maxWidth: 860, margin: "0 auto" }}>
      {/* Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "2rem", padding: "0.4rem 1.1rem", borderRadius: 999, border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", backdropFilter: "blur(8px)" }}>
        <Sparkles size={12} color="#a5b4fc" />
        <span style={{ color: "#a5b4fc", fontSize: "11px", letterSpacing: "0.18em", fontFamily: "monospace", textTransform: "uppercase" }}>IA · Design · Estratégia</span>
      </div>

      {/* Main headline */}
      <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(2.2rem, 5.5vw, 5rem)", lineHeight: 1.08, color: "white", marginBottom: "1.75rem" }}>
        Você descreve o negócio.{" "}
        <br />
        <span style={{ fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          O site aparece.
        </span>
      </h1>

      {/* Subheadline */}
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "1.1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.55)", maxWidth: 600, margin: "0 auto 2.5rem" }}>
        Narrativa estratégica, animações que impressionam, copy que converte —
        entregue em até 48h.{" "}
        <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Sem reunião, sem burocracia, sem espera.</strong>
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 999, padding: "1rem 2.2rem", fontSize: "1.05rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", transition: "transform 0.2s, box-shadow 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
          Quero meu site agora <ArrowRight size={18} />
        </button>
        <button
          onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
          style={{ background: "transparent", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "1rem 2.2rem", fontSize: "1.05rem", fontWeight: 300, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "color 0.2s, border-color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
          Fale conosco
        </button>
      </div>

      {/* Scroll hint */}
      <div style={{ marginTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.25)", animation: "bounce 2s infinite" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", fontFamily: "monospace", textTransform: "uppercase" }}>interaja com as partículas</span>
        <MousePointer2 size={14} />
      </div>
    </div>
  </section>
);

// ─── Pain Points ──────────────────────────────────────────────────────────────
const PainSection = () => {
  const pains = [
    { icon: Clock, title: "Meses esperando um site que deveria levar dias", desc: "Briefing, reuniões, aprovações, revisões, mais reuniões... quando entrega, o mercado já mudou. Seu concorrente já tá online enquanto você espera." },
    { icon: DollarSign, title: "Preços de agência que não fazem sentido", desc: "R$ 8.000 a R$ 30.000 por um site que nem é seu — fica na hospedagem deles, com contrato de manutenção eterna. Um saque disfarçado de serviço." },
    { icon: AlertTriangle, title: "Complexidade que paralisa", desc: "Domínio, hospedagem, SSL, CMS, plugins, atualizações... você abriu um negócio, não uma startup de tecnologia. Devia ser mais simples que isso." },
    { icon: Target, title: "Site bonito que não converte", desc: "Visualmente agradável, estrategicamente vazio. Sem copywriting, sem jornada do usuário, sem CTA. Bonito pra mostrar pro amigo, inútil pra trazer cliente." },
  ];

  return (
    <section style={{ background: "#000", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3.2rem)", color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
            Você ainda está preso{" "}
            <span style={{ fontWeight: 800, background: "linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              nessa armadilha?
            </span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", maxWidth: 580, margin: "0 auto" }}>
            A maioria dos negócios perde clientes todo dia por causa de um problema que tem solução em horas.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(440px, 100%), 1fr))", gap: "1rem" }}>
          {pains.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: "1.75rem", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", transition: "border-color 0.3s, background 0.3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color="#f87171" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "white", marginBottom: "0.5rem", fontSize: "1rem" }}>{title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight box */}
        <div style={{ marginTop: "2rem", padding: "1.5rem 2rem", borderRadius: 16, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", textAlign: "center" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(165,180,252,0.9)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            <strong style={{ color: "white", fontWeight: 600 }}>Cada dia sem um site que converte é receita perdida para sempre.</strong>{" "}
            Seus concorrentes estão online, construindo autoridade e capturando os clientes que deveriam ser seus.
          </p>
        </div>
      </div>
    </section>
  );
};

// ─── How It Works ─────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { num: "01", icon: Bot, title: "Você descreve", desc: "Responde um formulário simples: quem você é, o que vende, quem é seu cliente ideal, o que te diferencia. Sem jargão técnico, sem reuniões." },
    { num: "02", icon: Sparkles, title: "A IA e eu construímos", desc: "Combino inteligência artificial com design estratégico e copywriting de conversão para montar cada seção do seu site com intenção." },
    { num: "03", icon: Rocket, title: "Você recebe pronto", desc: "Em até 48h você tem um site com narrativa, animações, SEO e domínio próprio. Pronto para publicar, pronto para converter." },
  ];

  return (
    <section style={{ background: "#050508", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>Como funciona</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", marginTop: "0.75rem", lineHeight: 1.2 }}>
            Simples como deveria ser{" "}
            <span style={{ fontWeight: 700 }}>desde o início</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {steps.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} style={{ padding: "2rem", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.03))", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: "5rem", fontWeight: 900, color: "rgba(99,102,241,0.06)", fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{num}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem" }}>
                <Icon size={22} color="#a5b4fc" />
              </div>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "white", fontSize: "1.1rem", marginBottom: "0.75rem" }}>{title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Plans Section ─────────────────────────────────────────────────────────────
const PlansSection = () => {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro ao iniciar pagamento. Tente novamente.");
    } catch {
      alert("Erro ao conectar. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Starter",
      id: "starter",
      tag: null,
      price: 497,
      desc: "Pra quem precisa de presença digital básica, sem frescura.",
      color: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.1)",
      highlight: false,
      features: [
        { ok: true, text: "1 landing page completa" },
        { ok: true, text: "Até 5 seções estratégicas" },
        { ok: true, text: "Design responsivo (mobile)" },
        { ok: true, text: "Entrega em até 72h" },
        { ok: true, text: "1 rodada de revisões" },
        { ok: false, text: "Animações premium" },
        { ok: false, text: "Integração com WhatsApp/CRM" },
        { ok: false, text: "SEO técnico avançado" },
        { ok: false, text: "Blog integrado" },
      ],
      cta: "Começar com o Starter",
      ctaBg: "rgba(255,255,255,0.1)",
      ctaColor: "white",
      ctaBorder: "1px solid rgba(255,255,255,0.2)",
    },
    {
      name: "Pro",
      id: "pro",
      tag: "⭐ Mais escolhido",
      price: 997,
      originalPrice: 2400,
      desc: "O equilíbrio perfeito entre impacto visual e resultado real.",
      color: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
      border: "rgba(99,102,241,0.5)",
      highlight: true,
      scarcity: "Apenas 3 vagas este mês",
      features: [
        { ok: true, text: "Landing page completa multi-seção" },
        { ok: true, text: "Animações premium (Framer Motion)" },
        { ok: true, text: "Copywriting estratégico incluso" },
        { ok: true, text: "SEO técnico + meta tags otimizadas" },
        { ok: true, text: "Integração WhatsApp / formulário" },
        { ok: true, text: "Design responsivo impecável" },
        { ok: true, text: "Entrega em até 48h" },
        { ok: true, text: "2 rodadas de revisões" },
        { ok: false, text: "Blog + painel admin" },
      ],
      cta: "Quero o Pro agora",
      ctaBg: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      ctaColor: "white",
      ctaBorder: "none",
    },
    {
      name: "Premium",
      id: "premium",
      tag: null,
      price: 1997,
      desc: "Site completo, com tudo que uma empresa séria precisa.",
      color: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.1)",
      highlight: false,
      features: [
        { ok: true, text: "Site completo multi-página" },
        { ok: true, text: "Blog integrado com painel admin" },
        { ok: true, text: "Animações avançadas e interativas" },
        { ok: true, text: "Copywriting completo em todas as páginas" },
        { ok: true, text: "SEO técnico avançado + sitemap" },
        { ok: true, text: "Integrações (CRM, e-mail, analytics)" },
        { ok: true, text: "Entrega em até 7 dias" },
        { ok: true, text: "3 rodadas de revisões" },
        { ok: true, text: "30 dias de suporte pós-entrega" },
      ],
      cta: "Falar sobre o Premium",
      ctaBg: "rgba(255,255,255,0.08)",
      ctaColor: "white",
      ctaBorder: "1px solid rgba(255,255,255,0.15)",
    },
  ];

  return (
    <section id="planos" style={{ background: "#000", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>Planos</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
            Escolha o seu{" "}
            <span style={{ fontWeight: 700 }}>ponto de largada</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            Você já decidiu que precisa de um site que funciona — agora é só escolher o nível de resultado.
          </p>
        </div>

        {/* Psychology: anchoring note */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", background: "rgba(99,102,241,0.1)", padding: "0.3rem 0.9rem", borderRadius: 999, border: "1px solid rgba(99,102,241,0.2)" }}>
            🔒 Pagamento único · Sem mensalidade · Você fica com tudo
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", alignItems: "start" }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              padding: plan.highlight ? "2.25rem" : "2rem",
              borderRadius: 20,
              border: `1px solid ${plan.border}`,
              background: plan.color,
              position: "relative",
              transform: plan.highlight ? "scale(1.03)" : "scale(1)",
              boxShadow: plan.highlight ? "0 0 60px rgba(99,102,241,0.2)" : "none",
              transition: "transform 0.3s",
            }}>
              {plan.tag && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", padding: "0.3rem 1rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
                  {plan.tag}
                </div>
              )}

              {plan.scarcity && (
                <div style={{ marginBottom: "1rem", padding: "0.4rem 0.9rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#fca5a5" }}>{plan.scarcity}</span>
                </div>
              )}

              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "1rem", color: plan.highlight ? "#a5b4fc" : "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>{plan.name}</p>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white" }}>R$ {plan.price.toLocaleString("pt-BR")}</span>
                {plan.originalPrice && (
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", textDecoration: "line-through", marginBottom: "0.5rem" }}>
                    R$ {plan.originalPrice.toLocaleString("pt-BR")}
                  </span>
                )}
              </div>

              {plan.originalPrice && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#86efac", background: "rgba(134,239,172,0.1)", padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                    Você economiza R$ {(plan.originalPrice - plan.price).toLocaleString("pt-BR")}
                  </span>
                </div>
              )}

              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>{plan.desc}</p>

              <div style={{ marginBottom: "1.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, opacity: f.ok ? 1 : 0.35 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.ok ? "rgba(134,239,172,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {f.ok ? <Check size={10} color="#86efac" /> : <X size={10} color="rgba(255,255,255,0.3)" />}
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.875rem", color: f.ok ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                style={{
                  width: "100%", padding: "0.9rem", borderRadius: 12,
                  background: loadingPlan === plan.id ? "rgba(99,102,241,0.4)" : plan.ctaBg,
                  color: plan.ctaColor,
                  border: plan.ctaBorder || "none", fontSize: "0.95rem",
                  fontWeight: 600, cursor: loadingPlan === plan.id ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif", transition: "opacity 0.2s, transform 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { if (loadingPlan !== plan.id) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                {loadingPlan === plan.id ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Redirecionando...
                  </>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ marginTop: "2.5rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
          {[
            { icon: Users, label: "112 sites entregues" },
            { icon: Star, label: "4.9 / 5 de avaliação" },
            { icon: Clock, label: "Entrega média em 36h" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)" }}>
              <Icon size={15} color="rgba(165,180,252,0.7)" />
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.85rem" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Alterations note */}
        <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "0.6rem 1.4rem", fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a5b4fc", flexShrink: 0 }} />
            Alterações após a entrega: <strong style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>R$ 50,00 por alteração</strong>, entregue em até 24h.
          </span>
        </div>

      </div>
    </section>
  );
};

// ─── Pricing Comparison Table ─────────────────────────────────────────────────
const PricingCompare = () => {
  const [hovered, setHovered] = useState(null);

  const categories = [
    {
      name: "Entrega",
      rows: [
        { label: "Prazo de entrega",         starter: "72 horas",    pro: "48 horas",      premium: "7 dias" },
        { label: "Rodadas de revisão",        starter: "1",           pro: "2",             premium: "3" },
        { label: "Suporte pós-entrega",       starter: "—",           pro: "7 dias",        premium: "30 dias" },
        { label: "Código-fonte incluso",      starter: true,          pro: true,            premium: true },
      ],
    },
    {
      name: "Design & Conteúdo",
      rows: [
        { label: "Páginas incluídas",         starter: "1 página",    pro: "1 página",      premium: "Até 5 páginas" },
        { label: "Design responsivo",         starter: true,          pro: true,            premium: true },
        { label: "Animações premium",         starter: false,         pro: true,            premium: true },
        { label: "Copywriting estratégico",   starter: false,         pro: true,            premium: true },
        { label: "Blog integrado",            starter: false,         pro: false,           premium: true },
        { label: "Painel de edição (CMS)",    starter: false,         pro: false,           premium: true },
      ],
    },
    {
      name: "Técnico & Marketing",
      rows: [
        { label: "SEO técnico avançado",      starter: false,         pro: true,            premium: true },
        { label: "Meta tags + Open Graph",    starter: "Básico",      pro: true,            premium: true },
        { label: "Sitemap + robots.txt",      starter: false,         pro: true,            premium: true },
        { label: "Integração WhatsApp / CRM", starter: false,         pro: true,            premium: true },
        { label: "Analytics configurado",     starter: false,         pro: true,            premium: true },
        { label: "Integrações avançadas",     starter: false,         pro: false,           premium: true },
      ],
    },
    {
      name: "Hospedagem & Domínio",
      rows: [
        { label: "Deploy na Vercel",          starter: true,          pro: true,            premium: true },
        { label: "CDN global",                starter: true,          pro: true,            premium: true },
        { label: "Configuração de domínio",   starter: "Manual",      pro: true,            premium: true },
        { label: "SSL incluso",               starter: true,          pro: true,            premium: true },
        { label: "Domínio no seu nome",       starter: true,          pro: true,            premium: true },
      ],
    },
  ];

  const plans = [
    { key: "starter", name: "Starter",  price: "R$ 497",  highlight: false },
    { key: "pro",     name: "Pro",      price: "R$ 997",  highlight: true  },
    { key: "premium", name: "Premium",  price: "R$ 1.997",highlight: false },
  ];

  const renderCell = (val, planKey, isHighlight) => {
    if (val === true)  return <span style={{ color: "#86efac", fontSize: "1rem" }}>✓</span>;
    if (val === false) return <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.85rem" }}>—</span>;
    return (
      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: isHighlight ? 500 : 300, fontSize: "0.82rem", color: isHighlight ? "#e0e7ff" : "rgba(255,255,255,0.55)" }}>
        {val}
      </span>
    );
  };

  const colBg   = (p) => p.highlight ? "rgba(99,102,241,0.10)" : "transparent";
  const colBdr  = (p) => p.highlight ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)";

  return (
    <section style={{ background: "#050508", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>
            Comparativo
          </span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "white", marginTop: "0.75rem" }}>
            O que está incluso em{" "}
            <span style={{ fontWeight: 700 }}>cada plano</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Sem letra miúda. Cada item explicado com clareza.
          </p>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>

            {/* Sticky plan header */}
            <thead>
              <tr>
                <th style={{ padding: "1rem 1.25rem", textAlign: "left", width: "35%", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#050508" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Funcionalidade</span>
                </th>
                {plans.map(p => (
                  <th key={p.key}
                    onMouseEnter={() => setHovered(p.key)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ padding: "1.25rem 1rem", textAlign: "center", width: "21.6%", background: colBg(p), borderLeft: `1px solid ${colBdr(p)}`, borderTop: `1px solid ${colBdr(p)}`, borderTopLeftRadius: 12, borderTopRightRadius: 12, transition: "background 0.2s", cursor: "default" }}>
                    {p.highlight && (
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: "0.65rem", fontWeight: 600, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
                        ⭐ Recomendado
                      </div>
                    )}
                    <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "white", fontSize: "1rem" }}>{p.name}</div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: p.highlight ? "#a5b4fc" : "rgba(255,255,255,0.7)", fontSize: "1.25rem", marginTop: "0.3rem" }}>{p.price}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((cat, ci) => (
                <>
                  {/* Category divider */}
                  <tr key={`cat-${ci}`}>
                    <td colSpan={4} style={{ padding: "1.5rem 1.25rem 0.5rem", background: "#050508" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(165,180,252,0.6)" }}>
                        {cat.name}
                      </span>
                    </td>
                  </tr>

                  {/* Feature rows */}
                  {cat.rows.map((row, ri) => {
                    const isLast = ri === cat.rows.length - 1 && ci === categories.length - 1;
                    return (
                      <tr key={`${ci}-${ri}`}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        style={{ transition: "background 0.15s" }}>
                        <td style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.875rem", color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                        </td>
                        {plans.map(p => (
                          <td key={p.key} style={{
                            padding: "0.75rem 1rem", textAlign: "center",
                            background: colBg(p),
                            borderLeft: `1px solid ${colBdr(p)}`,
                            borderBottom: isLast ? `1px solid ${colBdr(p)}` : "1px solid rgba(255,255,255,0.04)",
                            borderBottomLeftRadius:  isLast && p.key === "starter" ? 0 : 0,
                            borderBottomRightRadius: isLast && p.key === "premium" ? 0 : 0,
                            transition: "background 0.2s",
                          }}>
                            {renderCell(row[p.key], p.key, p.highlight)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </>
              ))}

              {/* CTA row */}
              <tr>
                <td style={{ padding: "1.5rem 1.25rem" }} />
                {plans.map(p => (
                  <td key={p.key} style={{ padding: "1.5rem 1rem", textAlign: "center", background: colBg(p), borderLeft: `1px solid ${colBdr(p)}`, borderBottom: `1px solid ${colBdr(p)}`, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                    <button style={{
                      width: "100%", padding: "0.7rem 0.5rem", borderRadius: 10,
                      background: p.highlight ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)",
                      color: "white", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                      fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                      fontFamily: "Inter, sans-serif", transition: "opacity 0.2s, transform 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      Escolher {p.name}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom note */}
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", marginTop: "1.5rem" }}>
          Todos os planos incluem pagamento único, sem mensalidade · Domínio registrado no seu nome · Código 100% seu
        </p>
      </div>
    </section>
  );
};

// ─── Benefits + Tech ──────────────────────────────────────────────────────────
const BenefitsTech = () => {
  const benefits = [
    { icon: Zap, title: "Velocidade real", desc: "De zero a online em até 48h. Não é promessa — �) processo." },
    { icon: TrendingUp, title: "Feito pra converter", desc: "Cada palavra, botão e seção têm uma função estratégica. Não é decoração." },
    { icon: Shield, title: "Você fica com tudo", desc: "O código é seu. O domínio é seu. Sem dependência de agência." },
    { icon: Globe, title: "Performance global", desc: "Hospedagem edge com Vercel — carrega rápido em qualquer lugar do mundo." },
    { icon: Layers, title: "Design que impressiona", desc: "Animações, tipografia e hierarquia visual que posicionam sua marca como premium." },
    { icon: Lock, title: "Sem contrato, sem surpresas", desc: "Pagamento único. Sem taxa de manutenção obrigatória. Transparência total." },
  ];

  const techs = [
    { name: "Next.js 14", desc: "Framework React para produção" },
    { name: "React + TypeScript", desc: "Código robusto e escalável" },
    { name: "Tailwind CSS", desc: "Design system utilitário" },
    { name: "Framer Motion", desc: "Animações fluidas e naturais" },
    { name: "shadcn/ui", desc: "Componentes de alta qualidade" },
    { name: "Vercel", desc: "Deploy e CDN global instantâneos" },
    { name: "Claude AI", desc: "Narrativa e copywriting com IA" },
    { name: "Stripe", desc: "Pagamentos seguros e automáticos" },
  ];

  return (
    <section style={{ background: "#050508", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Benefits */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>Por que o Prompt Site</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", marginTop: "0.75rem" }}>
            O que você{" "}
            <span style={{ fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>realmente recebe</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "5rem" }}>
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: "1.5rem", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", transition: "border-color 0.3s, background 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Icon size={19} color="#a5b4fc" />
              </div>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "white", fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>Tecnologias</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "white", marginTop: "0.75rem" }}>
            As mesmas ferramentas da{" "}
            <span style={{ fontWeight: 700 }}>Netflix, Airbnb e Vercel</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", marginTop: "0.75rem" }}>
            Inclusive as mesmas usadas para construir este site que você está vendo agora.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {techs.map(({ name, desc }) => (
            <div key={name} style={{ padding: "1rem 1.25rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "white", fontSize: "0.9rem" }}>{name}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Final CTA ─────────────────────────────────────────────────────────────────
const FinalCTA = () => (
  <section style={{ background: "#000", padding: "6rem 1.5rem", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 65%)" }} />
    <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.15, marginBottom: "1.5rem" }}>
        Você está a{" "}
        <span style={{ fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          48 horas
        </span>{" "}
        de ter um site que converte.
      </h2>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.55)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "2.5rem" }}>
        Enquanto você lê isso, seus concorrentes estão online. Não adie mais o que pode transformar seu negócio ainda esta semana.
      </p>
      <button style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 999, padding: "1.1rem 2.5rem", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "Inter, sans-serif", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(99,102,241,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
        Quero meu site agora <ArrowRight size={20} />
      </button>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", marginTop: "1.25rem" }}>
        Pagamento seguro via Stripe · Garantia de satisfação · Suporte via WhatsApp
      </p>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1.5rem" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={14} color="white" />
        </div>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Prompt Site</span>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>
        © 2026 Prompt Site · Feito com React, Next.js e Claude AI
      </p>
    </div>
  </footer>
);

// ─── Portfolio Section ────────────────────────────────────────────────────────
// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FAQSection = () => {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "Em quanto tempo o site fica pronto?",
      a: "O prazo varia por plano: Starter em até 72h, Pro em até 48h, Premium em até 7 dias. O cronômetro começa assim que você preenche o briefing — que leva menos de 10 minutos.",
    },
    {
      q: "O site vai realmente ser meu? Sem mensalidade?",
      a: "Sim, 100%. Você recebe o código-fonte completo, o domínio fica no seu nome e a hospedagem pode ficar em sua conta gratuita na Vercel. Sem contrato de manutenção obrigatória, sem aluguel disfarçado.",
    },
    {
      q: "Posso pedir alterações depois da entrega?",
      a: "Cada plano inclui rodadas de revisão (1 no Starter, 2 no Pro, 3 no Premium). Após isso, qualquer alteração pontual — texto, cor, seção, imagem — custa R$ 50,00 por alteração, com entrega em até 24h.",
    },
    {
      q: "Preciso entender de código ou tecnologia?",
      a: "Nenhuma. Você só precisa descrever o seu negócio com clareza — o restante é comigo. Após a entrega, o painel de edição é simples o suficiente para qualquer pessoa atualizar textos e imagens.",
    },
    {
      q: "Como funciona o domínio (.com.br, .com)?",
      a: "Você registra o domínio no seu nome (Registro.br para .com.br, ou Namecheap para .com — custo de R$ 40 a R$ 80/ano), eu faço toda a configuração DNS e conectamos ao Vercel. O domínio é 100% seu.",
    },
    {
      q: "Vocês fazem sites para qualquer nicho?",
      a: "Sim. Já entregamos para consultoras, clínicas, prestadores de serviço, lojas, infoprodutos, coaches e muito mais. O que importa é que você saiba explicar o que faz — a partir daí, eu construo a narrativa certa.",
    },
    {
      q: "O site vai aparecer no Google?",
      a: "Os planos Pro e Premium incluem SEO técnico completo: meta tags, Open Graph, sitemap, robots.txt e estrutura semântica. Para resultados orgânicos expressivos, o SEO é um trabalho contínuo — mas você já sai bem à frente da maioria.",
    },
  ];

  return (
    <section style={{ background: "#050508", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>FAQ</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", marginTop: "0.75rem" }}>
            Dúvidas{" "}
            <span style={{ fontWeight: 700 }}>frequentes</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((item, i) => (
            <div key={i} style={{ borderRadius: 14, border: `1px solid ${open === i ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)"}`, background: open === i ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)", transition: "all 0.25s", overflow: "hidden" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", gap: "1rem", textAlign: "left" }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: "white", fontSize: "0.95rem", lineHeight: 1.5 }}>{item.q}</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: open === i ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.25s" }}>
                  <span style={{ color: open === i ? "#a5b4fc" : "rgba(255,255,255,0.4)", fontSize: "1.1rem", lineHeight: 1, fontWeight: 300 }}>{open === i ? "−" : "+"}</span>
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem" }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.8 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginTop: "2rem" }}>
          Ainda tem dúvida?{" "}
          <a href="#contato" style={{ color: "#a5b4fc", textDecoration: "none" }}
            onMouseEnter={e => e.target.style.textDecoration = "underline"}
            onMouseLeave={e => e.target.style.textDecoration = "none"}>
            Me chama no formulário abaixo →
          </a>
        </p>
      </div>
    </section>
  );
};

// ─── Contact / Briefing Form ──────────────────────────────────────────────────
const ContactForm = () => {
  const [form, setForm] = useState({ name: "", business: "", audience: "", differentiator: "", contact: "", plan: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.business || !form.contact) return;
    setLoading(true);
    const lines = [
      `Olá! Vim pelo site e quero começar meu projeto 🚀`,
      ``,
      `*Nome:* ${form.name}`,
      `*Negócio:* ${form.business}`,
      form.audience ? `*Público-alvo:* ${form.audience}` : null,
      form.differentiator ? `*Diferencial:* ${form.differentiator}` : null,
      `*Contato:* ${form.contact}`,
      form.plan ? `*Plano de interesse:* ${form.plan}` : null,
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/5514981294576?text=${encodeURIComponent(lines)}`;
    setSent(true);
    setLoading(false);
    window.open(url, "_blank");
  };

  const inputStyle = (key) => ({
    width: "100%", padding: "0.85rem 1rem", borderRadius: 12, background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === key ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
    color: "white", fontSize: "0.9rem", fontFamily: "Inter, sans-serif", fontWeight: 300,
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  });

  const labelStyle = {
    fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "0.8rem",
    color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", display: "block", letterSpacing: "0.03em",
  };

  const fieldWrap = { display: "flex", flexDirection: "column" };

  if (sent) {
    return (
      <section id="contato" style={{ background: "#000", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(134,239,172,0.15)", border: "1px solid rgba(134,239,172,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Check size={28} color="#86efac" />
          </div>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.8rem", color: "white", marginBottom: "0.75rem" }}>Recebido! 🚀</h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "1rem", lineHeight: 1.75 }}>
            Já estou analisando o seu briefing. Em breve você recebe um retorno com os próximos passos. Prepare-se — seu site está a caminho.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" style={{ background: "#000", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a5b4fc" }}>Começar agora</span>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "white", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
            Me conta sobre o{" "}
            <span style={{ fontWeight: 700 }}>seu negócio</span>
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>
            Quanto mais honesto você for, melhor o site. Leva menos de 5 minutos.
          </p>
        </div>

        <div style={{ padding: "2.5rem", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "1.25rem" }}>

            <div style={{ ...fieldWrap }}>
              <label style={labelStyle}>Seu nome</label>
              <input style={inputStyle("name")} placeholder="Ex: Ana Lima" value={form.name}
                onChange={e => handle("name", e.target.value)}
                onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...fieldWrap }}>
              <label style={labelStyle}>Contato (WhatsApp ou e-mail)</label>
              <input style={inputStyle("contact")} placeholder="(11) 99999-9999" value={form.contact}
                onChange={e => handle("contact", e.target.value)}
                onFocus={() => setFocused("contact")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...fieldWrap, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>O que é o seu negócio? <span style={{ color: "#a5b4fc" }}>*</span></label>
              <textarea style={{ ...inputStyle("business"), minHeight: 90, resize: "vertical" }} placeholder="Ex: Sou personal trainer especializado em emagrecimento feminino após os 35 anos. Atendo online e presencialmente em São Paulo."
                value={form.business} onChange={e => handle("business", e.target.value)}
                onFocus={() => setFocused("business")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...fieldWrap, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Quem é o seu cliente ideal?</label>
              <input style={inputStyle("audience")} placeholder="Ex: Mulheres entre 35-55 anos que querem emagrecer sem academia nem dieta radical"
                value={form.audience} onChange={e => handle("audience", e.target.value)}
                onFocus={() => setFocused("audience")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...fieldWrap, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>O que te faz diferente da concorrência?</label>
              <input style={inputStyle("differentiator")} placeholder="Ex: Método próprio de 12 semanas com acompanhamento diário via app"
                value={form.differentiator} onChange={e => handle("differentiator", e.target.value)}
                onFocus={() => setFocused("differentiator")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...fieldWrap, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Qual plano te interessa?</label>
              <select style={{ ...inputStyle("plan"), cursor: "pointer" }} value={form.plan}
                onChange={e => handle("plan", e.target.value)}
                onFocus={() => setFocused("plan")} onBlur={() => setFocused(null)}>
                <option value="" style={{ background: "#111" }}>Selecione um plano...</option>
                <option value="starter" style={{ background: "#111" }}>Starter — R$ 497</option>
                <option value="pro" style={{ background: "#111" }}>Pro — R$ 997 ⭐ Mais escolhido</option>
                <option value="premium" style={{ background: "#111" }}>Premium — R$ 1.997</option>
                <option value="duvida" style={{ background: "#111" }}>Ainda tenho dúvidas</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.business || !form.contact}
            style={{ marginTop: "1.75rem", width: "100%", padding: "1rem", borderRadius: 12, background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s, transform 0.2s", opacity: (!form.name || !form.business || !form.contact) ? 0.45 : 1 }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.opacity = (!form.name || !form.business || !form.contact) ? "0.45" : "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Enviando briefing...
              </>
            ) : (
              <>Quero meu site — enviar briefing <ArrowRight size={18} /></>
            )}
          </button>

          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", marginTop: "1rem" }}>
            🔒 Suas informações são confidenciais. Sem spam, sem compartilhamento.
          </p>
        </div>
      </div>
    </section>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PromptSiteLanding() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#000", minHeight: "100vh", color: "white" }}>
      <FontLoader />
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>
      <Nav />
      <Hero />
      <PainSection />
      <HowItWorks />
      <PlansSection />
      <PricingCompare />
      <BenefitsTech />
      <FAQSection />
      <ContactForm />
      <FinalCTA />
      <Footer />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/5514981294576"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "1.75rem", right: "1.75rem", zIndex: 999,
          width: 56, height: 56, borderRadius: "50%",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,211,102,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)"; }}
        aria-label="Fale pelo WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
