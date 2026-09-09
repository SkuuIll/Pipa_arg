"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  COMMANDS_DATA,
  CommandItem,
  CommandCategory,
  DIXPER_CRATES,
  WEEZYX_PACKS,
  TWITCH_CHANNEL_REWARDS,
  TwitchChannelReward,
} from "./commandsData";
import {
  ShoppingCart,
  MessageSquare,
  Gamepad2,
  Volume2,
  Coins,
  Package,
  Sparkles,
  Flame,
  Target,
  Zap,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Crown,
  Shield,
  Clock,
  Music,
  Smile,
  Droplets,
  Lock,
  Crosshair,
  Skull,
  Bomb,
  Repeat,
  EyeOff,
  MicOff,
  Users,
  Search,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Tag,
} from "lucide-react";
import "./comandos.css";

interface ChatMessage {
  id: string;
  user: string;
  badge?: "broadcaster" | "mod" | "vip" | "sub" | "bot";
  text: string;
  isBot?: boolean;
  isTroll?: boolean;
  time: string;
}

const RANDOM_CHATTERS = [
  "Sapo_Arg",
  "CristianLa12",
  "MauriCabj",
  "Alanitox",
  "Pame_Ok",
  "BdMi_Fan",
  "Eleiaa_Pubg",
  "Chino_Sniper",
  "Wep30",
  "PanzaSoldier",
];

// Generador de efectos de audio retro con Web Audio API
function playSoundEffect(type: "buzz" | "pew" | "troll" | "alert" | "coin" | "horn") {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "coin") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "buzz" || type === "troll") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "pew") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "horn") {
      osc.type = "square";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Si el navegador bloquea audio antes de interacción de usuario, ignorar silenciosamente
  }
}

function renderTwitchRewardIcon(iconName: string) {
  switch (iconName) {
    case "Droplets":
      return <Droplets className="tw-card-icon" />;
    case "Users":
      return <Users className="tw-card-icon" />;
    case "Lock":
      return <Lock className="tw-card-icon" />;
    case "Sparkles":
      return <Sparkles className="tw-card-icon" />;
    case "Target":
      return <Target className="tw-card-icon" />;
    case "Smile":
      return <Smile className="tw-card-icon" />;
    case "Music":
      return <Music className="tw-card-icon" />;
    case "Clock":
      return <Clock className="tw-card-icon" />;
    case "Crosshair":
      return <Crosshair className="tw-card-icon" />;
    case "Skull":
      return <Skull className="tw-card-icon" />;
    case "Bomb":
      return <Bomb className="tw-card-icon" />;
    case "Repeat":
      return <Repeat className="tw-card-icon" />;
    case "EyeOff":
      return <EyeOff className="tw-card-icon" />;
    case "MicOff":
      return <MicOff className="tw-card-icon" />;
    case "Crown":
      return <Crown className="tw-card-icon" />;
    case "Shield":
      return <Shield className="tw-card-icon" />;
    default:
      return <Coins className="tw-card-icon" />;
  }
}

export default function ComandosPage() {
  const [activeTab, setActiveTab] = useState<"tienda" | "chat">("tienda");
  const [storeFilter, setStoreFilter] = useState<"todos" | "dixper" | "weezyx" | "twitch" | "bajo" | "medio" | "alto">("todos");
  const [twitchFilter, setTwitchFilter] = useState<"todos" | "troll_ingame" | "stream" | "chat" | "status">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory>("todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simInput, setSimInput] = useState("");
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      user: "Sapo_Arg",
      badge: "sub",
      text: "dale pipaa arrancá la ranked que nos campean",
      time: "16:42",
    },
    {
      id: "m-2",
      user: "CristianLa12",
      badge: "vip",
      text: "alguien vio balas de 7.62?? no tengo loot",
      time: "16:42",
    },
    {
      id: "m-3",
      user: "PIPAA",
      badge: "broadcaster",
      text: "Cuidado que estoy muteado en discord armando el mate",
      time: "16:43",
    },
    {
      id: "m-4",
      user: "PanzaBot",
      badge: "bot",
      isBot: true,
      text: "Bienvenidos a la Central de Comandos de PIPAA. Escribí un comando o explorá la Tienda de Troleo.",
      time: "16:43",
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Ejecución interactiva del simulador de chat
  const runCommand = (cmdText: string) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Búsqueda del comando
    const found = COMMANDS_DATA.find((c) => c.name.toLowerCase() === cleanCmd);

    // Mensaje del usuario
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      user: "Visitante",
      badge: "sub",
      text: cleanCmd,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setSimInput("");

    // Sonido al enviar
    playSoundEffect("pew");

    // Respuesta del bot con delay
    setTimeout(() => {
      let reply = "";
      let isTroll = false;

      if (found) {
        reply = found.botResponse;
        isTroll = !!found.isBait;

        // Reemplazo dinámico de variables simulando StreamElements / Nightbot
        const random1 = RANDOM_CHATTERS[Math.floor(Math.random() * RANDOM_CHATTERS.length)];
        const random2 = RANDOM_CHATTERS[Math.floor(Math.random() * RANDOM_CHATTERS.length)];
        const random3 = RANDOM_CHATTERS[Math.floor(Math.random() * RANDOM_CHATTERS.length)];
        const randCm = (Math.random() * 35 + 5).toFixed(1);

        reply = reply
          .replaceAll("$(user)", "@Visitante")
          .replaceAll("[usuario]", "@Visitante")
          .replaceAll("[user]", "@Visitante")
          .replaceAll("${random.chatter}", `@${random1}`)
          .replaceAll("@Chino_PUBG", `@${random1}`)
          .replaceAll("@MauriCabj", `@${random2}`)
          .replaceAll("@Sapo_Arg", `@${random3}`)
          .replaceAll("$(customapi)", randCm)
          .replaceAll("[eval]", String(Math.floor(Math.random() * 100)));

        if (found.category === "baits") {
          playSoundEffect("buzz");
        } else if (found.category === "sonidos") {
          playSoundEffect("horn");
        } else {
          playSoundEffect("coin");
        }
      } else {
        reply = `Comando ${cleanCmd} no encontrado en el canal. Probá con !dinero, !ban, !ccm, !teoria o !sonidos.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        user: found ? (found.botType.includes("StreamElements") ? "StreamElements" : "Nightbot") : "PanzaBot",
        badge: "bot",
        isBot: true,
        isTroll,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 380);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        user: "PanzaBot",
        badge: "bot",
        isBot: true,
        text: "Chat reiniciado. Escribí un comando o hacé click en las tarjetas de abajo para probarlos.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Filtrado de comandos para la vista Chat
  const filteredCommands = useMemo(() => {
    return COMMANDS_DATA.filter((cmd) => {
      const matchesCategory = selectedCategory === "todos" || cmd.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cmd.name.toLowerCase().includes(query) ||
        cmd.shortDesc.toLowerCase().includes(query) ||
        cmd.whatItDoes.toLowerCase().includes(query) ||
        cmd.tag.toLowerCase().includes(query) ||
        cmd.botResponse.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const soundCommands = useMemo(() => {
    return COMMANDS_DATA.filter((c) => c.category === "sonidos");
  }, []);

  // Comandos comprables para la Tienda
  const purchasableCommands = useMemo(() => {
    return COMMANDS_DATA.filter((cmd) => {
      if (!cmd.isPurchasable) return false;
      if (storeFilter === "todos") return true;
      if (storeFilter === "dixper") return cmd.purchasePlatform?.toLowerCase().includes("dixper");
      if (storeFilter === "weezyx") return cmd.purchasePlatform?.toLowerCase().includes("weezyx");
      if (storeFilter === "twitch") return cmd.purchasePlatform?.toLowerCase().includes("twitch") || cmd.purchasePlatform?.toLowerCase().includes("canal");
      if (storeFilter === "bajo") return cmd.priceArs?.includes("Gratis") || cmd.priceArs?.includes("150");
      if (storeFilter === "medio") return cmd.priceArs?.includes("1.700") || cmd.priceArs?.includes("2.400");
      if (storeFilter === "alto") return cmd.priceArs?.includes("6.000") || cmd.priceArs?.includes("10.800");
      return true;
    });
  }, [storeFilter]);

  // Filtrado de Recompensas de Twitch
  const filteredTwitchRewards = useMemo(() => {
    if (twitchFilter === "todos") return TWITCH_CHANNEL_REWARDS;
    return TWITCH_CHANNEL_REWARDS.filter((r) => r.category === twitchFilter);
  }, [twitchFilter]);

  return (
    <div className="cmd-shell">
      {/* ── Topbar ── */}
      <header className="cmd-topbar">
        <div className="cmd-brand-group">
          <a href="../" className="cmd-back-link">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Landing</span>
          </a>
          <a href="../#inicio">
            <img src="../pipaa-logo.svg" alt="PIPAA" width="100" height="40" />
          </a>
        </div>
        <div className="cmd-live-badge">
          <span className="dot" />
          <span>PANZABOT & TIENDA ONLINE</span>
        </div>
      </header>

      {/* ── Selector de Modo Principal: TIENDA vs CHAT ── */}
      <nav className="cmd-mode-tabs" aria-label="Navegación de Comandos">
        <button
          type="button"
          className={`cmd-mode-tab-btn ${activeTab === "tienda" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tienda")}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>TIENDA DE COMANDOS TROLL</span>
          <span className="tab-badge">SABOTAJE EN VIVO & PRECIOS</span>
        </button>
        <button
          type="button"
          className={`cmd-mode-tab-btn ${activeTab === "chat" ? "is-active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="w-4 h-4" />
          <span>COMANDOS DE CHAT & SIMULADOR</span>
          <span className="tab-badge">GRATIS / NIGHTBOT</span>
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          VISTA 1: TIENDA DE COMANDOS TROLL (DE PAGO)
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "tienda" && (
        <div className="cmd-store-view">
          {/* Hero Tienda */}
          <section className="cmd-hero" style={{ paddingBottom: "20px" }}>
            <div className="cmd-hero-badge">
              <span>CATÁLOGO COMERCIAL DE TROLEO EN VIVO · DIXPER & WEEZYX</span>
            </div>
            <h1>
              TIENDA DE <span className="acid">COMANDOS TROLL</span>
            </h1>
            <p className="subtitle">
              PIPAA vende comandos interactivos para que los espectadores saboteen físicamente su PC en plena partida de PUBG.
              Acá tenés toda la información de los comandos, <strong>precios transparentes en Pesos Argentinos (ARS) y Dólares (USD)</strong> y el paso a paso exacto para comprarlos con <strong>Mercado Pago, tarjetas locales o PayPal</strong>.
            </p>

            <div className="cmd-stats-row">
              <div className="cmd-stat-box">
                <strong>Desde $150 ARS</strong>
                <small>Audios en Vivo</small>
              </div>
              <div className="cmd-stat-box">
                <strong>100% Físico</strong>
                <small>Teclado, Mouse & Pantalla</small>
              </div>
              <div className="cmd-stat-box">
                <strong>Mercado Pago</strong>
                <small>Pagas en Moneda Local</small>
              </div>
              <div className="cmd-stat-box">
                <strong>Instantáneo</strong>
                <small>Reacción en el Directo</small>
              </div>
            </div>
          </section>

          {/* Hub de Acceso Rápido a Pasarelas */}
          <section className="cmd-buy-hub" style={{ margin: "0 auto 10px" }}>
            <div className="cmd-buy-hub-grid">
              <div className="cmd-hub-card card-dixper">
                <span className="cmd-hub-badge badge-dixper">
                  <Gamepad2 className="w-3.5 h-3.5 inline-block" /> DIXPER OFICIAL
                </span>
                <h3>Habilidades de Hardware en PUBG</h3>
                <p>
                  Comprá cajas de habilidades que invierten teclas WASD, vacían cargadores o lanzan screamers a sus auriculares Shure SE215.
                </p>
                <a
                  href="https://dixper.gg/pipa_arg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-hub-action-btn btn-dixper"
                >
                  <span>Abrir Tienda Dixper.gg</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="cmd-hub-card card-weezyx">
                <span className="cmd-hub-badge badge-weezyx">
                  <Volume2 className="w-3.5 h-3.5 inline-block" /> WEEZYX OFICIAL
                </span>
                <h3>Audios y TTS Sin Censura</h3>
                <p>
                  Enviá mensajes de voz grabados con tu micrófono o textos leídos con voz robótica que suenan de inmediato en vivo por los parlantes.
                </p>
                <a
                  href="https://weezyx.com/t/pipa_arg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-hub-action-btn btn-weezyx"
                >
                  <span>Abrir Tienda Weezyx</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="cmd-hub-card">
                <span className="cmd-hub-badge badge-twitch">
                  <Coins className="w-3.5 h-3.5 inline-block" /> TWITCH PUNTOS DEL CANAL
                </span>
                <h3>Canjes Oficiales de la Panza Army</h3>
                <p>
                  Acumulá puntos viendo los directos y canjeá troleos in-game como soltar armas, fuego amigo en squad o apagar la pantalla con CTRL+U.
                </p>
                <a
                  href="https://www.twitch.tv/pipa_arg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-hub-action-btn"
                >
                  <span>Canjear en Twitch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="cmd-hub-card">
                <span className="cmd-hub-badge badge-partner">
                  <Tag className="w-3.5 h-3.5 inline-block" /> CÓDIGO CREADOR
                </span>
                <h3>Código PUBG Partner: PIPAA</h3>
                <p>
                  Apoyá a PIPAA usando su código de creador en la tienda del juego. Cada compra de G-Coin y pases le otorga comisión directa.
                </p>
                <button
                  type="button"
                  className="cmd-hub-action-btn"
                  onClick={() => handleCopy("pubg-code", "PIPAA")}
                >
                  {copiedId === "pubg-code" ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado: PIPAA
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Código: PIPAA
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ── 1. Cajas de Habilidades Dixper ── */}
          <section className="cmd-crates-section">
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>PAQUETES DE SABOTAJE FÍSICO</p>
              <h2>
                <Package className="w-6 h-6 inline-block text-acid" /> CAJAS DE HABILIDADES DIXPER
              </h2>
              <p>
                Las cajas contienen habilidades aleatorias que se guardan en tu inventario de Dixper y podés detonar en cualquier momento de la transmisión en vivo.
              </p>
            </div>

            <div className="cmd-crates-grid">
              {DIXPER_CRATES.map((crate) => (
                <div key={crate.id} className={`cmd-crate-card tier-${crate.tier}`}>
                  <span className="cmd-crate-badge">{crate.badge}</span>
                  <h3>{crate.name}</h3>
                  <div className="cmd-crate-price-row">
                    <span className="cmd-price-main">{crate.priceArs}</span>
                    <span className="cmd-price-sub">({crate.priceUsd} / {crate.coins})</span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: "1.5", margin: "0 0 16px" }}>
                    {crate.description}
                  </p>
                  <strong style={{ fontSize: "0.82rem", color: "var(--white)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    {crate.skillsCount} Incluidas:
                  </strong>
                  <ul className="cmd-crate-skills-list">
                    {crate.includedSkills.map((sk, idx) => (
                      <li key={idx}>{sk}</li>
                    ))}
                  </ul>
                  <a
                    href={crate.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cmd-hub-action-btn ${crate.tier === "oro" ? "btn-weezyx" : "btn-dixper"}`}
                    style={{ marginTop: "auto", textAlign: "center" }}
                  >
                    <span>Comprar en Dixper.gg</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. Packs de Audios Weezyx ── */}
          <section className="cmd-crates-section">
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>SONIDOS Y TEXTO A VOZ</p>
              <h2>
                <Volume2 className="w-6 h-6 inline-block text-acid" /> PACKS DE AUDIOS WEEZYX
              </h2>
              <p>
                Mandale audios directos por los parlantes del directo o escribí mensajes que serán leídos por un sintetizador de voz sin censura.
              </p>
            </div>

            <div className="cmd-crates-grid">
              {WEEZYX_PACKS.map((pack) => (
                <div key={pack.id} className="cmd-crate-card">
                  {pack.badge && <span className="cmd-crate-badge">{pack.badge}</span>}
                  <h3>{pack.name}</h3>
                  <div className="cmd-crate-price-row">
                    <span className="cmd-price-main">{pack.priceArs}</span>
                    <span className="cmd-price-sub">({pack.priceUsd})</span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: "1.5", margin: "0 0 16px" }}>
                    {pack.description}
                  </p>
                  {pack.characterLimit && (
                    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: "6px", fontSize: "0.78rem", color: "var(--sky)", marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Límite: {pack.characterLimit}</span>
                    </div>
                  )}
                  <a
                    href={pack.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cmd-hub-action-btn btn-weezyx"
                    style={{ marginTop: "auto", textAlign: "center" }}
                  >
                    <span>Enviar por Weezyx</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── 3. Puntos de Canal Panza Army & Recompensas Oficiales de Twitch ── */}
          <section className="tw-rewards-section">
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>CANAL OFICIAL TWITCH · PUNTOS DEL CANAL</p>
              <h2>
                <Coins className="w-6 h-6 inline-block text-acid" /> PUNTOS PANZA ARMY & RECOMPENSAS TWITCH
              </h2>
              <p>
                Los 16 canjes oficiales configurados en el canal de Twitch de PIPAA. Ganás puntos mirando los directos o apoyando como suscriptor y detonás troleos in-game en PUBG, fuego amigo en squad o muteos en Discord.
              </p>
            </div>

            {/* Barra de Estado de Puntos del Canal */}
            <div className="tw-balance-bar">
              <div className="tw-balance-left">
                <span className="tw-points-coin" title="Puntos de Canal Twitch">
                  <Coins className="w-4 h-4" />
                </span>
                <span className="tw-points-amount">Panza Points</span>
                <span className="tw-multiplier-pill">Multiplicador Sub 1.2x</span>
              </div>
              <div className="tw-balance-right">
                <TrendingUp className="w-4 h-4 text-acid" />
                <span>Ganalos automáticamente mirando en twitch.tv/pipa_arg</span>
              </div>
            </div>

            {/* Filtro de Categorías de Twitch */}
            <div className="cmd-filter-pills" style={{ justifyContent: "center", marginBottom: "26px" }}>
              <button
                type="button"
                className={`cmd-pill ${twitchFilter === "todos" ? "is-active" : ""}`}
                onClick={() => setTwitchFilter("todos")}
              >
                Todos ({TWITCH_CHANNEL_REWARDS.length})
              </button>
              <button
                type="button"
                className={`cmd-pill ${twitchFilter === "troll_ingame" ? "is-active" : ""}`}
                onClick={() => setTwitchFilter("troll_ingame")}
              >
                <Crosshair className="w-3.5 h-3.5 inline-block" /> Troles In-Game (PUBG)
              </button>
              <button
                type="button"
                className={`cmd-pill ${twitchFilter === "stream" ? "is-active" : ""}`}
                onClick={() => setTwitchFilter("stream")}
              >
                <Volume2 className="w-3.5 h-3.5 inline-block" /> Stream & Discord
              </button>
              <button
                type="button"
                className={`cmd-pill ${twitchFilter === "chat" ? "is-active" : ""}`}
                onClick={() => setTwitchFilter("chat")}
              >
                <MessageSquare className="w-3.5 h-3.5 inline-block" /> Chat & Emotes
              </button>
              <button
                type="button"
                className={`cmd-pill ${twitchFilter === "status" ? "is-active" : ""}`}
                onClick={() => setTwitchFilter("status")}
              >
                <Crown className="w-3.5 h-3.5 inline-block" /> Rangos VIP & MOD
              </button>
            </div>

            {/* Grid de Recompensas Twitch Estilo Canal */}
            <div className="tw-rewards-grid">
              {filteredTwitchRewards.map((reward) => (
                <article
                  key={reward.id}
                  className="tw-reward-card"
                  style={{ backgroundColor: reward.color }}
                >
                  <div className="tw-card-top">
                    <span className="tw-category-badge">{reward.categoryLabel}</span>
                  </div>

                  <div className="tw-card-icon-wrapper">
                    <div className="tw-card-icon-bubble">
                      {renderTwitchRewardIcon(reward.iconName)}
                    </div>
                  </div>

                  <div className="tw-cost-pill">
                    <Coins className="w-3.5 h-3.5 text-gold" />
                    <span>{reward.costFormatted}</span>
                  </div>

                  <h3 className="tw-card-title">{reward.title}</h3>

                  <p className="tw-card-desc">{reward.description}</p>

                  {reward.pubgImpact && (
                    <div className="tw-card-impact">
                      <strong>Efecto PUBG:</strong> {reward.pubgImpact}
                    </div>
                  )}

                  <a
                    href={reward.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tw-redeem-btn"
                  >
                    <span>Canjear en Twitch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* ── 4. Catálogo de Comandos Individuales con Filtros ── */}
          <section className="cmd-crates-section">
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>FICHA TÉCNICA Y PRECIOS</p>
              <h2>
                <Sparkles className="w-6 h-6 inline-block text-acid" /> CATÁLOGO DE COMANDOS TROLL COMPRABLES
              </h2>
              <p>
                Revisá qué hace cada habilidad, qué parte de su PC afecta, cuánto cuesta y cuál es el momento perfecto para activársela.
              </p>
            </div>

            {/* Filtros de la Tienda */}
            <div className="cmd-filter-pills" style={{ justifyContent: "center", marginBottom: "30px" }}>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "todos" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("todos")}
              >
                Todos ({COMMANDS_DATA.filter((c) => c.isPurchasable).length})
              </button>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "dixper" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("dixper")}
              >
                <Gamepad2 className="w-3.5 h-3.5 inline-block" /> Dixper (Teclado & Mouse)
              </button>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "weezyx" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("weezyx")}
              >
                <Volume2 className="w-3.5 h-3.5 inline-block" /> Weezyx (Audios)
              </button>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "twitch" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("twitch")}
              >
                <Coins className="w-3.5 h-3.5 inline-block" /> Puntos del Canal
              </button>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "bajo" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("bajo")}
              >
                <Coins className="w-3.5 h-3.5 inline-block" /> Menos de $1.000 ARS
              </button>
              <button
                type="button"
                className={`cmd-pill ${storeFilter === "alto" ? "is-active" : ""}`}
                onClick={() => setStoreFilter("alto")}
              >
                <Zap className="w-3.5 h-3.5 inline-block" /> Daño Máximo (&gt; $3.000 ARS)
              </button>
            </div>

            {/* Grid de Productos */}
            <div className="cmd-grid" style={{ padding: 0 }}>
              {purchasableCommands.map((cmd) => (
                <article key={cmd.id} className="cmd-store-product-card">
                  <div className="cmd-prod-header">
                    <div>
                      <span className={`cmd-tag tag-${cmd.category}`} style={{ marginBottom: "6px" }}>
                        {cmd.purchasePlatform || cmd.tag}
                      </span>
                      <h3 style={{ margin: 0, fontSize: "1.3rem", color: "var(--white)", fontFamily: "monospace" }}>
                        {cmd.name}
                      </h3>
                    </div>
                    <div className="cmd-prod-pricing">
                      <span className="cmd-prod-ars">{cmd.priceArs || cmd.priceLabel}</span>
                      {cmd.priceUsd && <span className="cmd-prod-usd">{cmd.priceUsd}</span>}
                    </div>
                  </div>

                  {/* Nivel de Troleo (Flames) */}
                  {cmd.trollLevel && (
                    <div className="cmd-troll-flames" title={`Nivel de troleo: ${cmd.trollLevel} de 5`}>
                      <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 700 }}>Nivel de Troleo:</span>
                      <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Flame
                            key={i}
                            className={`cmd-flame-icon ${i < (cmd.trollLevel || 0) ? "is-active" : ""}`}
                          />
                        ))}
                      </div>
                      <span style={{ color: "var(--gold)", fontSize: "0.75rem", fontWeight: 700 }}>
                        ({cmd.trollLevel}/5)
                      </span>
                    </div>
                  )}

                  {/* Hardware Target */}
                  {cmd.hardwareTarget && (
                    <div className="cmd-hardware-badge">
                      <Target className="w-3.5 h-3.5 text-sky" />
                      <span>Afecta:</span>
                      <strong>{cmd.hardwareTarget}</strong>
                    </div>
                  )}

                  {/* Qué le hace a PIPAA */}
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: "1.5", margin: "0 0 14px" }}>
                    {cmd.whatItDoes}
                  </p>

                  {/* Tactical Tip */}
                  {cmd.triggerGuide && (
                    <div className="cmd-tactical-tip">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <Zap className="w-3.5 h-3.5 text-sky" />
                        <strong>Cuándo detonarlo para máximo impacto:</strong>
                      </div>
                      {cmd.triggerGuide}
                    </div>
                  )}

                  {/* Medios de Pago Aceptados */}
                  {cmd.paymentMethods && (
                    <div className="cmd-payment-methods-row">
                      {cmd.paymentMethods.map((pm, idx) => (
                        <span key={idx} className="cmd-pay-pill">
                          <CheckCircle2 className="w-3 h-3 text-acid inline-block" /> {pm}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botones de Compra y Prueba */}
                  <div className="cmd-card-footer" style={{ marginTop: "auto" }}>
                    <div className="cmd-card-footer-buttons" style={{ width: "100%", justifyContent: "space-between" }}>
                      {cmd.purchaseUrl && (
                        <a
                          href={cmd.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cmd-hub-action-btn btn-dixper"
                          style={{ flex: 1, textAlign: "center", padding: "8px 14px" }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Comprar en {cmd.purchasePlatform?.split("/")[0] || "Tienda"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        className="cmd-trigger-btn"
                        onClick={() => {
                          setActiveTab("chat");
                          runCommand(cmd.name);
                        }}
                        title="Simular en el chat"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Probar</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── 5. Guía de Compra en 4 Pasos ── */}
          <section className="cmd-buyer-guide-section">
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>TUTORIAL PASO A PASO</p>
              <h2>¿CÓMO COMPRAR Y DETONAR EN 4 PASOS?</h2>
              <p>
                Si es tu primera vez comprando comandos troll para el stream de PIPAA, seguí esta guía rápida para no perderte.
              </p>
            </div>

            <div className="cmd-steps-grid">
              <div className="cmd-step-box">
                <span className="step-number">01</span>
                <h4>Elegí tu Sabotaje</h4>
                <p>
                  Definí si querés alterar sus controles en PUBG (Dixper), mandarle un audio sin baneo (Weezyx) o pedir fuego amigo al squad con puntos de Twitch.
                </p>
              </div>

              <div className="cmd-step-box">
                <span className="step-number">02</span>
                <h4>Pagá en Moneda Local</h4>
                <p>
                  Las plataformas oficiales aceptan <strong>Mercado Pago</strong>, tarjetas de débito/crédito argentinas (Ualá, Lemon, etc.) o PayPal sin conversiones raras.
                </p>
              </div>

              <div className="cmd-step-box">
                <span className="step-number">03</span>
                <h4>Guardá en tu Inventario</h4>
                <p>
                  Las habilidades de Dixper no vencen. Podés comprar tu caja con anticipación y guardarte las cartas para cuando empiece la ranked definitiva.
                </p>
              </div>

              <div className="cmd-step-box">
                <span className="step-number">04</span>
                <h4>Detoná en el Momento Clave</h4>
                <p>
                  Abrí la ventana de Dixper mientras mirás la transmisión. Cuando PIPAA esté en un 1v1 o cruzando en auto, hacé clic en "Lanzar" y mirá su reacción física en cámara.
                </p>
              </div>
            </div>
          </section>

          {/* ── 6. Preguntas Frecuentes de la Tienda ── */}
          <section className="cmd-faq-section" style={{ marginTop: "40px" }}>
            <div className="cmd-section-title-group">
              <p className="cmd-hero-badge" style={{ marginBottom: "8px" }}>DUDAS COMUNES</p>
              <h2>PREGUNTAS FRECUENTES DE LA TIENDA</h2>
            </div>

            <div className="cmd-faq-grid">
              <div className="cmd-faq-item">
                <h4>¿Qué pasa si compro un comando mientras PIPAA no está en partida?</h4>
                <p>
                  Las cartas de Dixper quedan guardadas en tu inventario hasta que vos decidas apretar el botón de detonar. No se consumen solas ni se pierden si el stream se corta.
                </p>
              </div>

              <div className="cmd-faq-item">
                <h4>¿Los comandos funcionan durante torneos oficiales de PUBG?</h4>
                <p>
                  No. Durante torneos oficiales y scrims competitivas de PUBG Esports, PIPAA desactiva Dixper por reglamento de juego limpio. Activá tus comandos en sus streams habituales de rankeds y partidas con subs.
                </p>
              </div>

              <div className="cmd-faq-item">
                <h4>¿Los suscriptores de Twitch tienen cajas gratis?</h4>
                <p>
                  Sí. Al vincular tu cuenta de Twitch con Dixper, cada mes de suscripción activa en el canal te otorga una caja de habilidades gratuita para detonar en directo.
                </p>
              </div>

              <div className="cmd-faq-item">
                <h4>¿Es seguro pagar con Mercado Pago en Weezyx y Dixper?</h4>
                <p>
                  Absolutamente. Tanto Dixper como Weezyx son plataformas internacionales oficiales con pasarelas encriptadas y procesadores directos de cobro en Argentina.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VISTA 2: CHAT INTERACTIVO, SOUNDBOARD & LORE (GRATIS)
      ════════════════════════════════════════════════════════════ */}
      {activeTab === "chat" && (
        <div className="cmd-chat-view">
          {/* Hero Chat */}
          <section className="cmd-hero">
            <div className="cmd-hero-badge">
              <span>MANUAL DE COMANDOS DEL CHAT & SOUNDBOARD</span>
            </div>
            <h1>
              SIMULADOR DE <span className="acid">CHAT & LORE</span>
            </h1>
            <p className="subtitle">
              Los comandos gratuitos de Nightbot y StreamElements que rigen la cultura del canal: bromas del chat, contador de eructos, descansos al squad y soundboard retro.
            </p>
          </section>

          {/* Simulador Interactivo */}
          <section className="cmd-sim-section">
            <div className="cmd-sim-header">
              <div className="cmd-sim-title-group">
                <span className="live-dot" />
                <span>Simulador de Chat · Canal #pipa_arg</span>
              </div>
              <button type="button" className="cmd-clear-btn" onClick={clearChat} title="Reiniciar chat">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar Chat</span>
              </button>
            </div>

            <div className="cmd-sim-feed">
              {messages.map((m) => (
                <div key={m.id} className={`cmd-chat-line ${m.isBot ? "is-bot-line" : ""} ${m.isTroll ? "is-troll-line" : ""}`}>
                  <span className="cmd-time">{m.time}</span>
                  {m.badge && <span className={`cmd-badge badge-${m.badge}`}>{m.badge.toUpperCase()}</span>}
                  <strong className="cmd-user">{m.user}:</strong>
                  <span className="cmd-text">{m.text}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form
              className="cmd-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                if (!simInput.trim()) return;
                runCommand(simInput);
              }}
            >
              <input
                type="text"
                className="cmd-input-field"
                placeholder="Escribí un comando (ej: !dinero, !balas, !sapo, !ban, !teoria, !ccm)..."
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
              />
              <button type="submit" className="cmd-send-btn">
                Enviar al Chat
              </button>
            </form>

            <div className="cmd-quick-bar">
              <span className="quick-label">Troleos rápidos:</span>
              <button type="button" className="cmd-chip chip-bait" onClick={() => runCommand("!dinero")}>
                !dinero
              </button>
              <button type="button" className="cmd-chip chip-bait" onClick={() => runCommand("!ban")}>
                !ban
              </button>
              <button type="button" className="cmd-chip chip-lore" onClick={() => runCommand("!sapo")}>
                !sapo
              </button>
              <button type="button" className="cmd-chip chip-lore" onClick={() => runCommand("!balas")}>
                !balas
              </button>
              <button type="button" className="cmd-chip chip-ruleta" onClick={() => runCommand("!ccm")}>
                !ccm
              </button>
              <button type="button" className="cmd-chip chip-lore" onClick={() => runCommand("!vivido")}>
                !vivido
              </button>
            </div>
          </section>

          {/* Soundboard Virtual */}
          <section className="cmd-soundboard-section">
            <div className="cmd-soundboard-heading">
              <div>
                <p className="cmd-hero-badge" style={{ marginBottom: "6px" }}>ALERTAS AUDITIVAS</p>
                <h2>SOUNDBOARD DE LA PANZA ARMY</h2>
              </div>
              <p>Hacé clic en cualquier botón para detonar el audio en el chat del simulador con su frecuencia retro.</p>
            </div>

            <div className="cmd-soundboard-grid">
              {soundCommands.map((snd) => (
                <button
                  key={snd.id}
                  type="button"
                  className={`cmd-sound-button ${activeSound === snd.id ? "is-playing" : ""}`}
                  onClick={() => {
                    setActiveSound(snd.id);
                    runCommand(snd.name);
                    setTimeout(() => setActiveSound(null), 1200);
                  }}
                >
                  <Volume2 className="w-4 h-4 text-acid" />
                  <span className="cmd-sound-name">{snd.soundName || snd.name.replace("!", "")}</span>
                  <span className="cmd-sound-cmd">{snd.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Controles de Filtros y Búsqueda */}
          <section className="cmd-controls-bar">
            <div className="cmd-search-wrapper">
              <Search className="cmd-search-icon w-4 h-4" />
              <input
                type="text"
                className="cmd-search-input"
                placeholder="Buscar por comando, nombre o efecto (ej: dinero, sapo, baneo, ccm, headshot)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="cmd-filter-pills">
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "todos" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("todos")}
              >
                Todos ({COMMANDS_DATA.length})
              </button>
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "baits" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("baits")}
              >
                Trolls & Baits
              </button>
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "ruleta" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("ruleta")}
              >
                Ruleta & Chat
              </button>
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "lore" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("lore")}
              >
                Lore & Squad
              </button>
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "ingame" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("ingame")}
              >
                In-Game & Dixper
              </button>
              <button
                type="button"
                className={`cmd-pill ${selectedCategory === "sonidos" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("sonidos")}
              >
                Soundboard
              </button>
            </div>

            <div className="cmd-results-counter">
              Mostrando {filteredCommands.length} {filteredCommands.length === 1 ? "comando" : "comandos"}
            </div>
          </section>

          {/* Catálogo de Comandos con Explicación Detallada */}
          <main className="cmd-grid">
            {filteredCommands.map((cmd) => (
              <article key={cmd.id} className={`cmd-card ${cmd.isBait ? "is-bait-card" : ""}`}>
                <div className="cmd-card-header">
                  <div className="cmd-name-badge">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3>{cmd.name}</h3>
                      {cmd.priceLabel && (
                        <span className="cmd-price-pill" title="Costo de activación">
                          {cmd.priceLabel}
                        </span>
                      )}
                    </div>
                    <span className={`cmd-tag tag-${cmd.category}`}>{cmd.tag}</span>
                  </div>
                  <div className="cmd-card-actions">
                    <button
                      type="button"
                      className={`cmd-action-icon-btn ${copiedId === cmd.id ? "is-copied" : ""}`}
                      title="Copiar comando"
                      onClick={() => handleCopy(cmd.id, cmd.name)}
                    >
                      {copiedId === cmd.id ? <Check className="w-3.5 h-3.5 text-acid" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="cmd-card-desc">{cmd.shortDesc}</p>

                <div className="cmd-detail-box">
                  <div className="cmd-detail-row">
                    <small>¿Qué hace este botón?</small>
                    <p>{cmd.whatItDoes}</p>
                  </div>
                  <div className="cmd-detail-row">
                    <small>Contexto / Origen Panza Army:</small>
                    <p>{cmd.whyItExists}</p>
                  </div>
                </div>

                <div className={`cmd-response-box ${cmd.isBait ? "is-bait-resp" : ""}`}>
                  <strong>Respuesta del bot:</strong>
                  <br />
                  {cmd.botResponse}
                </div>

                <div className="cmd-card-footer">
                  <span>Bot: {cmd.botType}</span>
                  <div className="cmd-card-footer-buttons">
                    {cmd.purchaseUrl && (
                      <a
                        href={cmd.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cmd-buy-btn"
                        title={`Comprar en ${cmd.purchasePlatform || "Plataforma Oficial"}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{cmd.purchasePlatform || "Comprar"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="cmd-trigger-btn"
                      onClick={() => {
                        runCommand(cmd.name);
                        window.scrollTo({ top: 500, behavior: "smooth" });
                      }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Probar en vivo</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </main>

          {/* Manual de Supervivencia */}
          <section className="cmd-guide-section">
            <h2>MANUAL DE SUPERVIVENCIA EN EL CHAT DE PIPAA</h2>
            <div className="cmd-guide-card">
              <div className="cmd-guide-rule">
                <span className="rule-badge">REGLA 01</span>
                <div>
                  <strong>No caigas en !dinero o !ban</strong>
                  <p>Si un viewer te dice que escribas estos comandos para reclamar subs o skins, te van a banear temporalmente por inocente.</p>
                </div>
              </div>

              <div className="cmd-guide-rule">
                <span className="rule-badge">REGLA 02</span>
                <div>
                  <strong>Modo Súper Viviyin</strong>
                  <p>No te enojes si PIPAA no te saluda durante las partidas clave; entra en modo ultra competitivo y apaga los monitores del chat (!vivido y !chat).</p>
                </div>
              </div>

              <div className="cmd-guide-rule">
                <span className="rule-badge">REGLA 03</span>
                <div>
                  <strong>Trolear con respeto</strong>
                  <p>Los sabotajes de Dixper y los descansos a Sapo, Cristian y Mauri son parte del show diario. Si vas a comprar comandos, hacelo para divertirte con la Panza Army.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="cmd-footer">
        <p>
          Sitio oficial de la comunidad de <strong>PIPAA</strong> · Panza Army
        </p>
        <div className="cmd-footer-links">
          <a href="../#videos">Videos de YouTube</a>
          <a href="../#trayectoria">Trayectoria</a>
          <a href="../#arsenal">Armas PUBG</a>
          <a href="../#setup">Setup</a>
          <a href="../#faq">Preguntas Frecuentes</a>
        </div>
      </footer>
    </div>
  );
}
