import { useState, useEffect, useRef, useCallback } from "react";

// ─── ANIMATION UTILITIES ────────────────────────────────
function smoothScrollTo(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const navH = 52;
  const y = el.getBoundingClientRect().top + window.scrollY - navH;
  const start = window.scrollY;
  const dist = y - start;
  const dur = Math.min(1200, Math.max(600, Math.abs(dist) * 0.5));
  let startTime = null;
  function ease(t) { return 1 - Math.pow(1 - t, 4); }
  function step(ts) {
    if (!startTime) startTime = ts;
    const p = Math.min((ts - startTime) / dur, 1);
    window.scrollTo(0, start + dist * ease(p));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(40px)",
    transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
  };
  return { ref, style, visible };
}

function useStagger(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const staggerItem = (visible, i, translateY = 40) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : `translateY(${translateY}px)`,
  transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
});

/* ═══════════════════════════════════════════════════════════
   COMODO BUILDER — Visual Site Configurator
   ═══════════════════════════════════════════════════════════
   Left panel: Edit sections, content, colors, images
   Right panel: Live preview of the client site
   Bottom bar: Export config / Switch between clients
   ═══════════════════════════════════════════════════════════ */

// ─── PRESET CLIENT CONFIGS ──────────────────────────────
const PRESETS = {
  fleuriste: {
    client: { name: "Atelier Flora", slug: "atelier-flora" },
    theme: {
      colors: {
        primary: "#3E0207", primaryDark: "#27020A", secondary: "#F7E0E0",
        accent: "#C8956C", background: "#F7E0E0", surface: "#FFFFFF",
        textPrimary: "#3E0207", textSecondary: "#6B3A3A", textOnPrimary: "#F7E0E0",
        border: "#D4B5B5", overlay: "rgba(62,2,7,0.85)",
      },
      fonts: { display: "Playfair Display", body: "DM Sans" },
    },
    sections: {
      nav:         { enabled: true, variant: "A" },
      heroBanner:  { enabled: true, variant: "A" },
      banner:      { enabled: true, variant: "A", imagePosition: "right" },
      service:     { enabled: true, variant: "A", columns: 3 },
      quote:       { enabled: true, variant: "A" },
      edito:       { enabled: true, variant: "A", imagePosition: "left" },
      galerie:     { enabled: true, variant: "A", itemsPerRow: 4 },
      testimonial: { enabled: true, variant: "A" },
      mapContact:  { enabled: true, variant: "A", showForm: true },
      booking:     { enabled: false, variant: "A" },
      footer:      { enabled: true, variant: "A", showSocials: true },
    },
    content: {
      nav: { logoText: "Atelier Flora", links: ["Accueil", "Services", "Galerie", "Contact"], ctaLabel: "Commander", ctaHref: "#contact" },
      heroBanner: { tag: "Bienvenue", title: "L'art floral au service de vos émotions", subtitle: "Compositions sur mesure, livraison et événements", ctaLabel: "Découvrir", ctaSecLabel: "Commander", heroImage: null },
      banner: { tag: "Notre savoir-faire", title: "Des créations uniques pour chaque occasion", description: "Nous façonnons des arrangements floraux qui racontent votre histoire.", ctaLabel: "En savoir plus", bannerImage: null },
      quote: { text: "Les fleurs sont les plus belles paroles que la terre adresse au ciel.", author: "Marie Dupont", role: "Fondatrice" },
      service: { title: "Nos Services", subtitle: "Un accompagnement floral complet", items: [
        { title: "Livraison locale", description: "Bouquets sur mesure livrés dans la journée.", ctaLabel: "Commander" },
        { title: "Événements", description: "Décoration florale pour mariages et corporate.", ctaLabel: "Devis" },
        { title: "Ateliers", description: "Apprenez l'art floral avec nos artisans.", ctaLabel: "S'inscrire" },
      ]},
      edito: { tag: "Notre histoire", title: "Passionnés depuis trois générations", description: "Depuis 1987, notre famille cultive l'amour des fleurs.", ctaLabel: "Notre histoire", editoImage: null },
      galerie: { title: "Notre galerie", items: [
        { caption: "Collection Printemps", image: null },{ caption: "Décoration mariage", image: null },
        { caption: "Atelier du samedi", image: null },{ caption: "Notre vitrine", image: null },
      ]},
      testimonial: { title: "Ce que disent nos clients", items: [
        { text: "Un service exceptionnel et des compositions magnifiques.", author: "Sophie M.", role: "Cliente fidèle" },
        { text: "La décoration de notre mariage était à couper le souffle.", author: "Pierre & Marie", role: "Mariage 2025" },
        { text: "Des ateliers passionnants, on apprend tellement.", author: "Claire B.", role: "Atelier" },
      ]},
      mapContact: { title: "Une demande florale ?", description: "Contactez-nous pour une composition sur mesure.", address: "12 Rue des Fleurs, 1003 Lausanne", phone: "+41 21 123 45 67", email: "hello@atelier-flora.ch" },
      footer: { columns: [
        { title: "Adresse", lines: "12 Rue des Fleurs\n1003 Lausanne\nSuisse" },
        { title: "Horaires", lines: "Lun-Ven: 8h-19h\nSam: 9h-17h\nDim: Fermé" },
        { title: "Contact", lines: "+41 21 123 45 67\nhello@atelier-flora.ch" },
      ], copyright: "© 2026 Atelier Flora. Tous droits réservés." },
    },
    images: {},
  },
  restaurant: {
    client: { name: "Trattoria Bella Vista", slug: "trattoria-bella-vista" },
    theme: {
      colors: {
        primary: "#1B3322", primaryDark: "#0F1F15", secondary: "#F5F0E4",
        accent: "#C8956C", background: "#F5F0E4", surface: "#FFFFFF",
        textPrimary: "#1B3322", textSecondary: "#5A6B5E", textOnPrimary: "#F5F0E4",
        border: "#D4CDBC", overlay: "rgba(27,51,34,0.85)",
      },
      fonts: { display: "Instrument Serif", body: "DM Sans" },
    },
    sections: {
      nav:         { enabled: true, variant: "A" },
      heroBanner:  { enabled: true, variant: "A" },
      banner:      { enabled: true, variant: "A", imagePosition: "left" },
      service:     { enabled: true, variant: "A", columns: 3 },
      quote:       { enabled: true, variant: "A" },
      edito:       { enabled: false, variant: "A", imagePosition: "left" },
      galerie:     { enabled: true, variant: "A", itemsPerRow: 3 },
      testimonial: { enabled: true, variant: "A" },
      mapContact:  { enabled: true, variant: "A", showForm: true },
      booking:     { enabled: true, variant: "A" },
      footer:      { enabled: true, variant: "A", showSocials: true },
    },
    content: {
      nav: { logoText: "Bella Vista", links: ["Accueil", "Carte", "Galerie", "Réserver"], ctaLabel: "Réserver", ctaHref: "#booking" },
      heroBanner: { tag: "Benvenuti", title: "Cuisine italienne d'exception au cœur de Genève", subtitle: "Des saveurs authentiques, un cadre raffiné", ctaLabel: "Notre carte", ctaSecLabel: "Réserver", heroImage: null },
      banner: { tag: "Notre philosophie", title: "Des produits frais importés d'Italie chaque semaine", description: "Notre chef sélectionne les meilleurs ingrédients directement auprès de producteurs italiens.", ctaLabel: "Découvrir", bannerImage: null },
      quote: { text: "La cuisine, c'est l'art de transformer instantanément en joie des produits chargés d'histoire.", author: "Marco Bellini", role: "Chef exécutif" },
      service: { title: "Notre Carte", subtitle: "Une sélection raffinée", items: [
        { title: "Antipasti", description: "Burrata, carpaccio, vitello tonnato et autres classiques.", ctaLabel: "Voir" },
        { title: "Pasta & Risotti", description: "Pâtes fraîches maison, risotto aux cèpes, truffe saisonnière.", ctaLabel: "Voir" },
        { title: "Dolci", description: "Tiramisu, panna cotta, et nos créations du moment.", ctaLabel: "Voir" },
      ]},
      edito: { tag: "", title: "", description: "", ctaLabel: "", editoImage: null },
      galerie: { title: "L'ambiance Bella Vista", items: [
        { caption: "Notre terrasse", image: null },{ caption: "En cuisine", image: null },{ caption: "Nos plats", image: null },
      ]},
      testimonial: { title: "Ils en parlent", items: [
        { text: "La meilleure table italienne de Genève, sans hésitation.", author: "GaultMillau", role: "Guide 2026" },
        { text: "Un tiramisu qui vaut le détour à lui seul.", author: "Jean-Marc P.", role: "Client régulier" },
        { text: "Cadre magnifique, service impeccable, cuisine divine.", author: "Laura & Thomas", role: "Anniversaire" },
      ]},
      mapContact: { title: "Nous trouver", description: "Réservation recommandée pour le dîner.", address: "8 Rue du Rhône, 1204 Genève", phone: "+41 22 987 65 43", email: "info@bellavista-ge.ch" },
      booking: { title: "Réserver une table", subtitle: "Sélectionnez votre créneau", fields: ["Nom", "Nombre de convives", "Date", "Créneau"] },
      footer: { columns: [
        { title: "Adresse", lines: "8 Rue du Rhône\n1204 Genève\nSuisse" },
        { title: "Horaires", lines: "Mar-Sam: 12h-14h / 19h-22h30\nDim-Lun: Fermé" },
        { title: "Contact", lines: "+41 22 987 65 43\ninfo@bellavista-ge.ch" },
      ], copyright: "© 2026 Trattoria Bella Vista. Tous droits réservés." },
    },
    images: {},
  },
};

// ─── GOOGLE FONTS URL BUILDER ───────────────────────────
function fontsUrl(display, body) {
  const d = display.replace(/ /g, "+");
  const b = body.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${d}:wght@400;600;700&family=${b}:wght@400;500;600;700&display=swap`;
}

// ─── AVAILABLE FONT OPTIONS ─────────────────────────────
const DISPLAY_FONTS = ["Playfair Display","Instrument Serif","Bricolage Grotesque","Syne","Clash Display","Fraunces","Cormorant Garamond"];
const BODY_FONTS = ["DM Sans","Outfit","Manrope","Plus Jakarta Sans","Nunito Sans","Source Sans 3"];

// ─── IMAGE UPLOAD HELPER ────────────────────────────────
function ImageUpload({ value, onChange, label, aspect = "16/9" }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>{label}</div>}
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          aspectRatio: aspect, borderRadius: 6, overflow: "hidden", cursor: "pointer",
          background: value ? `url(${value}) center/cover` : "#2a2a2a",
          border: "2px dashed #444", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#888", fontSize: 12, transition: "border-color 0.2s",
          minHeight: 60,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#888"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#444"}
      >
        {!value && "📷 Cliquer pour uploader"}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {value && <button onClick={() => onChange(null)} style={{ marginTop: 4, background: "none", border: "none", color: "#f66", fontSize: 11, cursor: "pointer" }}>✕ Supprimer</button>}
    </div>
  );
}

// ─── TEXT INPUT ──────────────────────────────────────────
function TInput({ label, value, onChange, multiline, placeholder }) {
  const s = { width: "100%", padding: "8px 10px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 4, color: "#eee", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", resize: "vertical" };
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 3 }}>{label}</div>}
      {multiline
        ? <textarea value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...s, minHeight: 60 }} placeholder={placeholder} />
        : <input value={value || ""} onChange={e => onChange(e.target.value)} style={s} placeholder={placeholder} />
      }
    </div>
  );
}

// ─── COLOR INPUT ────────────────────────────────────────
function CInput({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 24, height: 24, border: "none", borderRadius: 3, cursor: "pointer", padding: 0 }} />
      <span style={{ flex: 1, fontSize: 12 }}>{label}</span>
      <span style={{ fontFamily: "monospace", fontSize: 10, opacity: 0.5 }}>{value}</span>
    </div>
  );
}

// ─── SECTION TOGGLE ─────────────────────────────────────
function SectionToggle({ label, enabled, onToggle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #2a2a2a", paddingBottom: 8, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={enabled} onChange={onToggle} style={{ accentColor: "#C8956C" }} />
        </label>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, opacity: 0.4, transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
      </div>
      {open && enabled && <div style={{ paddingLeft: 4, paddingTop: 6 }}>{children}</div>}
    </div>
  );
}

// ─── SELECT ─────────────────────────────────────────────
function SSelect({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 3 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: 4, color: "#eee", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// LEFT PANEL — EDITOR
// ═════════════════════════════════════════════════════════
function EditorPanel({ config, setConfig }) {
  const c = config.theme.colors;
  const f = config.theme.fonts;

  const updateColor = (key, val) => setConfig(p => ({ ...p, theme: { ...p.theme, colors: { ...p.theme.colors, [key]: val } } }));
  const updateFont = (key, val) => setConfig(p => ({ ...p, theme: { ...p.theme, fonts: { ...p.theme.fonts, [key]: val } } }));
  const toggleSection = (key) => setConfig(p => ({ ...p, sections: { ...p.sections, [key]: { ...p.sections[key], enabled: !p.sections[key].enabled } } }));
  const updateSectionProp = (sec, prop, val) => setConfig(p => ({ ...p, sections: { ...p.sections, [sec]: { ...p.sections[sec], [prop]: val } } }));
  const updateContent = (sec, key, val) => setConfig(p => ({ ...p, content: { ...p.content, [sec]: { ...p.content[sec], [key]: val } } }));
  const updateContentItem = (sec, idx, key, val) => {
    setConfig(p => {
      const items = [...p.content[sec].items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...p, content: { ...p.content, [sec]: { ...p.content[sec], items } } };
    });
  };

  const [tab, setTab] = useState("sections");

  return (
    <div style={{ width: "100%", background: "#141414", color: "#ddd", fontFamily: "'DM Sans',sans-serif", fontSize: 13, display: "flex", flexDirection: "column" }}>
      {/* Client name */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #2a2a2a" }}>
        <TInput label="Nom du client" value={config.client.name} onChange={v => setConfig(p => ({ ...p, client: { ...p.client, name: v, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } }))} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a" }}>
        {["sections", "design", "images"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", background: tab === t ? "#1e1e1e" : "transparent",
            border: "none", borderBottom: tab === t ? "2px solid #C8956C" : "2px solid transparent",
            color: tab === t ? "#eee" : "#888", fontSize: 12, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {/* ── SECTIONS TAB ─────────────── */}
        {tab === "sections" && <>
          <SectionToggle label="Navigation" enabled={config.sections.nav.enabled} onToggle={() => toggleSection("nav")} defaultOpen>
            <TInput label="Logo / Nom" value={config.content.nav.logoText} onChange={v => updateContent("nav","logoText",v)} />
            <TInput label="Liens (séparés par virgule)" value={config.content.nav.links?.join(", ")} onChange={v => updateContent("nav","links",v.split(",").map(s=>s.trim()))} />
            <TInput label="Bouton CTA — texte" value={config.content.nav.ctaLabel} onChange={v => updateContent("nav","ctaLabel",v)} />
            <TInput label="Bouton CTA — lien (#section)" value={config.content.nav.ctaHref} onChange={v => updateContent("nav","ctaHref",v)} />
          </SectionToggle>

          <SectionToggle label="Hero Banner" enabled={config.sections.heroBanner.enabled} onToggle={() => toggleSection("heroBanner")}>
            <TInput label="Surtitre" value={config.content.heroBanner.tag} onChange={v => updateContent("heroBanner","tag",v)} />
            <TInput label="Titre principal" value={config.content.heroBanner.title} onChange={v => updateContent("heroBanner","title",v)} />
            <TInput label="Sous-titre" value={config.content.heroBanner.subtitle} onChange={v => updateContent("heroBanner","subtitle",v)} multiline />
            <TInput label="Bouton 1" value={config.content.heroBanner.ctaLabel} onChange={v => updateContent("heroBanner","ctaLabel",v)} />
            <TInput label="Bouton 2" value={config.content.heroBanner.ctaSecLabel} onChange={v => updateContent("heroBanner","ctaSecLabel",v)} />
          </SectionToggle>

          <SectionToggle label="Bannière" enabled={config.sections.banner.enabled} onToggle={() => toggleSection("banner")}>
            <TInput label="Surtitre" value={config.content.banner.tag} onChange={v => updateContent("banner","tag",v)} />
            <TInput label="Titre" value={config.content.banner.title} onChange={v => updateContent("banner","title",v)} />
            <TInput label="Description" value={config.content.banner.description} onChange={v => updateContent("banner","description",v)} multiline />
            <TInput label="Bouton" value={config.content.banner.ctaLabel} onChange={v => updateContent("banner","ctaLabel",v)} />
            <SSelect label="Image position" value={config.sections.banner.imagePosition} options={["left","right"]} onChange={v => updateSectionProp("banner","imagePosition",v)} />
          </SectionToggle>

          <SectionToggle label="Services / Carte" enabled={config.sections.service.enabled} onToggle={() => toggleSection("service")}>
            <TInput label="Titre" value={config.content.service.title} onChange={v => updateContent("service","title",v)} />
            <TInput label="Sous-titre" value={config.content.service.subtitle} onChange={v => updateContent("service","subtitle",v)} />
            <SSelect label="Colonnes" value={String(config.sections.service.columns)} options={["2","3","4"]} onChange={v => updateSectionProp("service","columns",parseInt(v))} />
            {config.content.service.items?.map((item, i) => (
              <div key={i} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #2a2a2a" : "none" }}>
                <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 4 }}>Service {i+1}</div>
                <TInput label="Titre" value={item.title} onChange={v => updateContentItem("service",i,"title",v)} />
                <TInput label="Description" value={item.description} onChange={v => updateContentItem("service",i,"description",v)} multiline />
                <TInput label="Bouton" value={item.ctaLabel} onChange={v => updateContentItem("service",i,"ctaLabel",v)} />
              </div>
            ))}
          </SectionToggle>

          <SectionToggle label="Citation" enabled={config.sections.quote.enabled} onToggle={() => toggleSection("quote")}>
            <TInput label="Citation" value={config.content.quote.text} onChange={v => updateContent("quote","text",v)} multiline />
            <TInput label="Auteur" value={config.content.quote.author} onChange={v => updateContent("quote","author",v)} />
            <TInput label="Rôle" value={config.content.quote.role} onChange={v => updateContent("quote","role",v)} />
          </SectionToggle>

          <SectionToggle label="Éditorial" enabled={config.sections.edito.enabled} onToggle={() => toggleSection("edito")}>
            <TInput label="Surtitre" value={config.content.edito.tag} onChange={v => updateContent("edito","tag",v)} />
            <TInput label="Titre" value={config.content.edito.title} onChange={v => updateContent("edito","title",v)} />
            <TInput label="Description" value={config.content.edito.description} onChange={v => updateContent("edito","description",v)} multiline />
            <TInput label="Bouton" value={config.content.edito.ctaLabel} onChange={v => updateContent("edito","ctaLabel",v)} />
          </SectionToggle>

          <SectionToggle label="Galerie" enabled={config.sections.galerie.enabled} onToggle={() => toggleSection("galerie")}>
            <TInput label="Titre" value={config.content.galerie.title} onChange={v => updateContent("galerie","title",v)} />
            <SSelect label="Images par ligne" value={String(config.sections.galerie.itemsPerRow)} options={["2","3","4"]} onChange={v => updateSectionProp("galerie","itemsPerRow",parseInt(v))} />
            {config.content.galerie.items?.map((item, i) => (
              <TInput key={i} label={`Légende ${i+1}`} value={item.caption} onChange={v => updateContentItem("galerie",i,"caption",v)} />
            ))}
          </SectionToggle>

          <SectionToggle label="Témoignages" enabled={config.sections.testimonial.enabled} onToggle={() => toggleSection("testimonial")}>
            <TInput label="Titre" value={config.content.testimonial.title} onChange={v => updateContent("testimonial","title",v)} />
            {config.content.testimonial.items?.map((item, i) => (
              <div key={i} style={{ padding: "8px 0", borderTop: i > 0 ? "1px solid #2a2a2a" : "none" }}>
                <TInput label="Citation" value={item.text} onChange={v => updateContentItem("testimonial",i,"text",v)} multiline />
                <TInput label="Auteur" value={item.author} onChange={v => updateContentItem("testimonial",i,"author",v)} />
                <TInput label="Rôle" value={item.role} onChange={v => updateContentItem("testimonial",i,"role",v)} />
              </div>
            ))}
          </SectionToggle>

          <SectionToggle label="Contact" enabled={config.sections.mapContact.enabled} onToggle={() => toggleSection("mapContact")}>
            <TInput label="Titre" value={config.content.mapContact.title} onChange={v => updateContent("mapContact","title",v)} />
            <TInput label="Description" value={config.content.mapContact.description} onChange={v => updateContent("mapContact","description",v)} />
            <TInput label="Adresse" value={config.content.mapContact.address} onChange={v => updateContent("mapContact","address",v)} />
            <TInput label="Téléphone" value={config.content.mapContact.phone} onChange={v => updateContent("mapContact","phone",v)} />
            <TInput label="Email" value={config.content.mapContact.email} onChange={v => updateContent("mapContact","email",v)} />
          </SectionToggle>

          <SectionToggle label="Réservation" enabled={config.sections.booking.enabled} onToggle={() => toggleSection("booking")}>
            <TInput label="Titre" value={config.content.booking?.title || ""} onChange={v => updateContent("booking","title",v)} />
            <TInput label="Sous-titre" value={config.content.booking?.subtitle || ""} onChange={v => updateContent("booking","subtitle",v)} />
          </SectionToggle>

          <SectionToggle label="Footer" enabled={config.sections.footer.enabled} onToggle={() => toggleSection("footer")}>
            <TInput label="Copyright" value={config.content.footer.copyright} onChange={v => updateContent("footer","copyright",v)} />
            {config.content.footer.columns?.map((col, i) => (
              <div key={i} style={{ padding: "6px 0" }}>
                <TInput label={`Colonne ${i+1} — titre`} value={col.title} onChange={v => {
                  const cols = [...config.content.footer.columns]; cols[i] = { ...cols[i], title: v };
                  updateContent("footer","columns",cols);
                }} />
                <TInput label="Contenu (1 ligne par retour)" value={col.lines} onChange={v => {
                  const cols = [...config.content.footer.columns]; cols[i] = { ...cols[i], lines: v };
                  updateContent("footer","columns",cols);
                }} multiline />
              </div>
            ))}
          </SectionToggle>
        </>}

        {/* ── DESIGN TAB ───────────────── */}
        {tab === "design" && <>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Couleurs</div>
          <CInput label="Primaire" value={c.primary} onChange={v => updateColor("primary",v)} />
          <CInput label="Primaire foncé" value={c.primaryDark} onChange={v => updateColor("primaryDark",v)} />
          <CInput label="Secondaire (fond)" value={c.secondary} onChange={v => { updateColor("secondary",v); updateColor("background",v); }} />
          <CInput label="Accent" value={c.accent} onChange={v => updateColor("accent",v)} />
          <CInput label="Surface" value={c.surface} onChange={v => updateColor("surface",v)} />
          <CInput label="Texte principal" value={c.textPrimary} onChange={v => updateColor("textPrimary",v)} />
          <CInput label="Texte secondaire" value={c.textSecondary} onChange={v => updateColor("textSecondary",v)} />
          <CInput label="Texte sur primaire" value={c.textOnPrimary} onChange={v => updateColor("textOnPrimary",v)} />
          <CInput label="Bordures" value={c.border} onChange={v => updateColor("border",v)} />

          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, margin: "20px 0 10px" }}>Typographie</div>
          <SSelect label="Font titres" value={f.display} options={DISPLAY_FONTS} onChange={v => updateFont("display",v)} />
          <SSelect label="Font corps" value={f.body} options={BODY_FONTS} onChange={v => updateFont("body",v)} />

          <div style={{ marginTop: 20, padding: 12, background: "#1e1e1e", borderRadius: 6 }}>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>Aperçu typo</div>
            <div style={{ fontFamily: `'${f.display}',serif`, fontSize: 24, fontWeight: 700, color: c.primary, marginBottom: 4 }}>Titre Display</div>
            <div style={{ fontFamily: `'${f.body}',sans-serif`, fontSize: 14, color: c.textSecondary }}>Corps de texte en {f.body}</div>
          </div>
        </>}

        {/* ── IMAGES TAB ───────────────── */}
        {tab === "images" && <>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: 10 }}>Images par section</div>

          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 8 }}>Hero</div>
          <ImageUpload label="Image de fond hero" value={config.content.heroBanner.heroImage} onChange={v => updateContent("heroBanner","heroImage",v)} aspect="16/7" />

          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 16 }}>Bannière</div>
          <ImageUpload label="Image bannière" value={config.content.banner.bannerImage} onChange={v => updateContent("banner","bannerImage",v)} aspect="4/3" />

          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 16 }}>Éditorial</div>
          <ImageUpload label="Image édito" value={config.content.edito.editoImage} onChange={v => updateContent("edito","editoImage",v)} aspect="3/4" />

          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 16 }}>Galerie</div>
          {config.content.galerie.items?.map((item, i) => (
            <ImageUpload key={i} label={item.caption || `Image ${i+1}`} value={item.image} onChange={v => updateContentItem("galerie",i,"image",v)} aspect="1/1" />
          ))}
        </>}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// LIVE PREVIEW — RIGHT PANEL
// ═════════════════════════════════════════════════════════
// ── Animated sub-sections for LivePreview ────────────────
function PrevNav({ ct, c, df, bf }) {
  const [hov, setHov] = useState(null);
  const handleClick = (e, anchor) => { e.preventDefault(); smoothScrollTo(anchor); };
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: `${c.surface}F0`, borderBottom: `1px solid ${c.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <a href="#" onClick={e => handleClick(e, "pv-accueil")} style={{ fontFamily: df, fontSize: 17, fontWeight: 700, color: c.primary, textDecoration: "none" }}>{ct.nav.logoText}</a>
        <div style={{ display: "flex", gap: 24 }}>
          {ct.nav.links?.map((l, i) => {
            const anchor = "pv-" + l.toLowerCase().replace(/\s+/g, "");
            return <a key={i} href={`#${anchor}`} onClick={e => handleClick(e, anchor)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ fontSize: 11, fontWeight: 500, color: hov === i ? c.accent : c.textPrimary, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em", transition: "color 0.2s" }}>{l}</a>;
          })}
        </div>
        {ct.nav.ctaLabel && <a href={`#${(ct.nav.ctaHref || "#").replace("#","pv-")}`} onClick={e => handleClick(e, (ct.nav.ctaHref || "").replace("#","pv-"))} style={{ background: c.primary, color: c.textOnPrimary, padding: "7px 18px", borderRadius: 3, fontSize: 11, fontWeight: 600, textDecoration: "none", transition: "transform 0.2s" }}>{ct.nav.ctaLabel}</a>}
      </div>
    </nav>
  );
}

function PrevHero({ ct, c, df }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 150); return () => clearTimeout(t); }, []);
  const sg = (d) => ({ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${d}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${d}s` });
  return (
    <section id="pv-accueil" style={{ minHeight: 420, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "80px 24px 60px", background: ct.heroBanner.heroImage ? `linear-gradient(${c.overlay},${c.overlay}),url(${ct.heroBanner.heroImage}) center/cover` : c.primary, color: c.textOnPrimary }}>
      {ct.heroBanner.tag && <span style={{ ...sg(0.1), fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{ct.heroBanner.tag}</span>}
      <h1 style={{ ...sg(0.25), fontFamily: df, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.12, maxWidth: 600, marginBottom: 14 }}>{ct.heroBanner.title}</h1>
      <p style={{ ...sg(0.4), fontSize: 15, maxWidth: 440, opacity: loaded ? 0.8 : 0, marginBottom: 28, lineHeight: 1.5, color: "inherit" }}>{ct.heroBanner.subtitle}</p>
      <div style={{ ...sg(0.55), display: "flex", gap: 10 }}>
        {ct.heroBanner.ctaLabel && <span style={{ background: c.textOnPrimary, color: c.primary, padding: "10px 24px", borderRadius: 3, fontWeight: 600, fontSize: 13 }}>{ct.heroBanner.ctaLabel}</span>}
        {ct.heroBanner.ctaSecLabel && <span style={{ border: `1px solid ${c.textOnPrimary}`, color: c.textOnPrimary, padding: "10px 24px", borderRadius: 3, fontWeight: 600, fontSize: 13 }}>{ct.heroBanner.ctaSecLabel}</span>}
      </div>
    </section>
  );
}

function PrevBanner({ ct, c, df, sec }) {
  const r = useReveal();
  const ImgOrPh = ({ src, style }) => src ? <div style={{ ...style, background: `url(${src}) center/cover no-repeat` }} /> : <div style={{ ...style, background: c.border, display: "flex", alignItems: "center", justifyContent: "center", color: c.textSecondary, fontSize: 13 }}>IMG</div>;
  return (
    <section style={{ padding: "64px 0" }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "center" }}>
        <div style={{ order: sec.banner.imagePosition === "left" ? 2 : 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {ct.banner.tag && <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: c.accent }}>{ct.banner.tag}</span>}
          <h2 style={{ fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: c.textPrimary, lineHeight: 1.15 }}>{ct.banner.title}</h2>
          <p style={{ fontSize: 15, color: c.textSecondary, lineHeight: 1.5 }}>{ct.banner.description}</p>
          {ct.banner.ctaLabel && <span style={{ display: "inline-block", marginTop: 6, background: c.primary, color: c.textOnPrimary, padding: "10px 24px", borderRadius: 3, fontWeight: 600, fontSize: 13, alignSelf: "flex-start" }}>{ct.banner.ctaLabel}</span>}
        </div>
        <ImgOrPh src={ct.banner.bannerImage} style={{ order: sec.banner.imagePosition === "left" ? 1 : 2, aspectRatio: "4/3", borderRadius: 6 }} />
      </div>
    </section>
  );
}

function PrevService({ ct, c, df, sec }) {
  const r = useReveal();
  const sg = useStagger(0.15);
  return (
    <section id="pv-services" style={{ padding: "64px 0" }} ref={r.ref}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ ...r.style, textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: c.textPrimary, marginBottom: 6 }}>{ct.service.title}</h2>
          <p style={{ fontSize: 15, color: c.textSecondary }}>{ct.service.subtitle}</p>
        </div>
        <div ref={sg.ref} style={{ display: "grid", gridTemplateColumns: `repeat(${sec.service.columns}, 1fr)`, gap: 18 }}>
          {ct.service.items?.map((item, i) => (
            <div key={i} style={{ ...staggerItem(sg.visible, i), background: c.surface, padding: 24, borderRadius: 6, border: `1px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 8, transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${i*0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i*0.12}s` }}>
              <div style={{ width: 36, height: 36, background: c.secondary, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: c.primary, fontSize: 16 }}>✦</div>
              <h3 style={{ fontFamily: df, fontSize: 16, color: c.textPrimary }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.5, flex: 1 }}>{item.description}</p>
              {item.ctaLabel && <span style={{ fontSize: 12, fontWeight: 600, color: c.primary }}>{item.ctaLabel} →</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrevQuote({ ct, c, df }) {
  const r = useReveal();
  return (
    <section style={{ padding: "64px 0" }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 650, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontFamily: df, fontSize: 48, lineHeight: 1, color: c.primary, marginBottom: 10 }}>&ldquo;</div>
        <blockquote style={{ fontFamily: df, fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 700, lineHeight: 1.3, color: c.textPrimary, marginBottom: 16 }}>{ct.quote.text}</blockquote>
        <p style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, opacity: 0.8 }}>{ct.quote.author} — {ct.quote.role}</p>
      </div>
    </section>
  );
}

function PrevEdito({ ct, c, df }) {
  const r = useReveal();
  const ImgOrPh = ({ src, style }) => src ? <div style={{ ...style, background: `url(${src}) center/cover no-repeat` }} /> : <div style={{ ...style, background: c.border, display: "flex", alignItems: "center", justifyContent: "center", color: c.textSecondary, fontSize: 13 }}>IMG</div>;
  return (
    <section style={{ padding: "64px 0", background: c.secondary }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "center" }}>
        <ImgOrPh src={ct.edito.editoImage} style={{ aspectRatio: "3/4", borderRadius: 6 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ct.edito.tag && <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: c.accent }}>{ct.edito.tag}</span>}
          <h2 style={{ fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: c.textPrimary, lineHeight: 1.15 }}>{ct.edito.title}</h2>
          <p style={{ fontSize: 15, color: c.textSecondary, lineHeight: 1.5 }}>{ct.edito.description}</p>
          {ct.edito.ctaLabel && <span style={{ display: "inline-block", marginTop: 6, background: c.primary, color: c.textOnPrimary, padding: "10px 24px", borderRadius: 3, fontWeight: 600, fontSize: 13, alignSelf: "flex-start" }}>{ct.edito.ctaLabel}</span>}
        </div>
      </div>
    </section>
  );
}

function PrevGalerie({ ct, c, df, sec }) {
  const r = useReveal();
  const sg = useStagger(0.1);
  const ImgOrPh = ({ src, alt, style }) => src ? <div style={{ ...style, background: `url(${src}) center/cover no-repeat` }} /> : <div style={{ ...style, background: c.border, display: "flex", alignItems: "center", justifyContent: "center", color: c.textSecondary, fontSize: 13 }}>{alt || "IMG"}</div>;
  return (
    <section id="pv-galerie" style={{ padding: "64px 0" }} ref={r.ref}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ ...r.style, fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", textAlign: "center", marginBottom: 36, color: c.textPrimary }}>{ct.galerie.title}</h2>
        <div ref={sg.ref} style={{ display: "grid", gridTemplateColumns: `repeat(${sec.galerie.itemsPerRow}, 1fr)`, gap: 10 }}>
          {ct.galerie.items?.map((item, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 6, overflow: "hidden", ...staggerItem(sg.visible, i, 30), transform: sg.visible ? "scale(1)" : "scale(0.92)" }}>
              <ImgOrPh src={item.image} alt={item.caption} style={{ position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 10px 10px", background: `linear-gradient(transparent, ${c.overlay})`, color: c.textOnPrimary, fontSize: 11, fontWeight: 500 }}>{item.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrevTestimonial({ ct, c, df }) {
  const r = useReveal();
  const sg = useStagger(0.15);
  return (
    <section style={{ padding: "64px 0" }} ref={r.ref}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ ...r.style, fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", textAlign: "center", marginBottom: 36, color: c.textPrimary }}>{ct.testimonial.title}</h2>
        <div ref={sg.ref} style={{ display: "grid", gridTemplateColumns: `repeat(${ct.testimonial.items.length}, 1fr)`, gap: 18 }}>
          {ct.testimonial.items?.map((item, i) => (
            <div key={i} style={{ ...staggerItem(sg.visible, i), background: c.surface, padding: 24, borderRadius: 6, border: `1px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: df, fontSize: 30, lineHeight: 1, color: c.primary }}>&ldquo;</div>
              <p style={{ fontFamily: df, fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: c.textPrimary, flex: 1 }}>{item.text}</p>
              <div style={{ fontSize: 11, color: c.textSecondary }}><span style={{ fontWeight: 600, color: c.textPrimary }}>{item.author}</span> — {item.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrevContact({ ct, c, df, bf, sec }) {
  const r = useReveal();
  return (
    <section id="pv-contact" style={{ padding: "64px 0", background: c.primary, color: c.textOnPrimary }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: sec.mapContact.showForm ? "1fr 1fr" : "1fr", gap: 36 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)" }}>{ct.mapContact.title}</h2>
          <p style={{ fontSize: 15, opacity: 0.85 }}>{ct.mapContact.description}</p>
          <div style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.8, marginTop: 6 }}>
            <div>{ct.mapContact.address}</div><div>{ct.mapContact.phone}</div><div>{ct.mapContact.email}</div>
          </div>
        </div>
        {sec.mapContact.showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Nom","Email","Téléphone"].map((f,i) => <input key={i} placeholder={f} style={{ padding: "10px 12px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 3, background: "rgba(255,255,255,0.08)", color: c.textOnPrimary, fontFamily: bf, fontSize: 14, outline: "none", height: 40 }} />)}
            <textarea placeholder="Message" style={{ padding: "10px 12px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 3, background: "rgba(255,255,255,0.08)", color: c.textOnPrimary, fontFamily: bf, fontSize: 14, outline: "none", minHeight: 70, resize: "vertical" }} />
            <span style={{ background: c.textOnPrimary, color: c.primary, padding: "10px 24px", borderRadius: 3, fontWeight: 600, fontSize: 13, alignSelf: "flex-start", cursor: "pointer" }}>Envoyer</span>
          </div>
        )}
      </div>
    </section>
  );
}

function PrevBooking({ ct, c, df, bf }) {
  const r = useReveal();
  return (
    <section id="pv-réserver" style={{ padding: "64px 0", background: c.secondary }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 500, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: df, fontSize: "clamp(1.5rem,3vw,2.2rem)", color: c.textPrimary, marginBottom: 4 }}>{ct.booking.title}</h2>
        <p style={{ fontSize: 14, color: c.textSecondary, marginBottom: 24 }}>{ct.booking.subtitle}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(ct.booking.fields || ["Nom","Nombre","Date","Créneau"]).map((f,i) => <input key={i} placeholder={f} style={{ padding: "10px 12px", border: `1px solid ${c.border}`, borderRadius: 3, background: c.surface, fontFamily: bf, fontSize: 14, color: c.textPrimary, outline: "none", height: 40 }} />)}
        </div>
        <span style={{ display: "inline-block", marginTop: 14, background: c.primary, color: c.textOnPrimary, padding: "10px 28px", borderRadius: 3, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Confirmer</span>
      </div>
    </section>
  );
}

function PrevFooter({ ct, c, df, clientName }) {
  const r = useReveal();
  return (
    <footer style={{ padding: "48px 0 24px", background: c.primaryDark || c.primary, color: c.textOnPrimary }} ref={r.ref}>
      <div style={{ ...r.style, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${ct.footer.columns?.length || 3}, 1fr)`, gap: 36, paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ fontFamily: df, fontSize: 16, fontWeight: 700 }}>{clientName}</span>
          {ct.footer.columns?.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, opacity: 0.5 }}>{col.title}</div>
              {(typeof col.lines === "string" ? col.lines.split("\n") : col.lines || []).map((l,j) => <div key={j} style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.75 }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 16, fontSize: 11, opacity: 0.4 }}>{ct.footer.copyright}</div>
      </div>
    </footer>
  );
}

// ── Main LivePreview wrapper ─────────────────────────────
function LivePreview({ config }) {
  const c = config.theme.colors;
  const f = config.theme.fonts;
  const sec = config.sections;
  const ct = config.content;
  const df = `'${f.display}',serif`;
  const bf = `'${f.body}',sans-serif`;

  return (
    <div style={{ fontFamily: bf, fontSize: 16, color: c.textPrimary, background: c.background }}>
      {sec.nav.enabled && <PrevNav ct={ct} c={c} df={df} bf={bf} />}
      {sec.heroBanner.enabled && <PrevHero ct={ct} c={c} df={df} />}
      {sec.banner.enabled && <PrevBanner ct={ct} c={c} df={df} sec={sec} />}
      {sec.service.enabled && <PrevService ct={ct} c={c} df={df} sec={sec} />}
      {sec.quote.enabled && <PrevQuote ct={ct} c={c} df={df} />}
      {sec.edito.enabled && <PrevEdito ct={ct} c={c} df={df} />}
      {sec.galerie.enabled && <PrevGalerie ct={ct} c={c} df={df} sec={sec} />}
      {sec.testimonial.enabled && <PrevTestimonial ct={ct} c={c} df={df} />}
      {sec.mapContact.enabled && <PrevContact ct={ct} c={c} df={df} bf={bf} sec={sec} />}
      {sec.booking?.enabled && ct.booking && <PrevBooking ct={ct} c={c} df={df} bf={bf} />}
      {sec.footer.enabled && <PrevFooter ct={ct} c={c} df={df} clientName={config.client.name} />}
    </div>
  );
}

// (Export is now inlined in the main App)

// ═════════════════════════════════════════════════════════
// MAIN APP — Tab-based layout (works on iPad / published)
// ═════════════════════════════════════════════════════════
export default function App() {
  const [config, setConfig] = useState(PRESETS.fleuriste);
  const [view, setView] = useState("edit"); // "edit" | "preview" | "export"
  const [copied, setCopied] = useState(false);

  const loadPreset = (key) => {
    setConfig(JSON.parse(JSON.stringify(PRESETS[key])));
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Dynamic font loading
  useEffect(() => {
    const url = fontsUrl(config.theme.fonts.display, config.theme.fonts.body);
    const existing = document.querySelector("link[data-comodo-fonts]");
    if (existing) existing.href = url;
    else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("data-comodo-fonts", "true");
      document.head.appendChild(link);
    }
  }, [config.theme.fonts.display, config.theme.fonts.body]);

  const tabStyle = (t) => ({
    flex: 1, padding: "10px 0", background: "transparent", border: "none",
    borderBottom: view === t ? "2px solid #C8956C" : "2px solid transparent",
    color: view === t ? "#fff" : "#777", fontSize: 12, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s",
  });

  const presetBtnStyle = (key) => ({
    padding: "5px 12px", borderRadius: 3,
    border: config.client.slug === PRESETS[key].client.slug ? "1px solid #C8956C" : "1px solid #333",
    background: config.client.slug === PRESETS[key].client.slug ? "#C8956C22" : "transparent",
    color: config.client.slug === PRESETS[key].client.slug ? "#C8956C" : "#888",
    fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "'DM Sans',sans-serif", color: "#ddd" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />

      {/* ── TOP HEADER ─────────────────── */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #222", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>⚡ Comodo Builder</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#555", fontSize: 11 }}>Preset :</span>
            {Object.keys(PRESETS).map(key => (
              <button key={key} onClick={() => loadPreset(key)} style={presetBtnStyle(key)}>
                {PRESETS[key].client.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button onClick={() => setView("edit")} style={tabStyle("edit")}>✏️ Éditer</button>
          <button onClick={() => setView("preview")} style={tabStyle("preview")}>👁 Preview</button>
          <button onClick={() => setView("export")} style={tabStyle("export")}>📦 Exporter</button>
        </div>
      </div>

      {/* ── EDIT VIEW ──────────────────── */}
      {view === "edit" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <EditorPanel config={config} setConfig={setConfig} />
        </div>
      )}

      {/* ── PREVIEW VIEW ───────────────── */}
      {view === "preview" && (
        <div style={{ background: "#f0f0f0" }}>
          <LivePreview config={config} />
        </div>
      )}

      {/* ── EXPORT VIEW ────────────────── */}
      {view === "export" && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>📦 Config client : {config.client.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4, lineHeight: 1.5 }}>
                Copie ce JSON → ouvre un nouveau chat Claude → colle le PROJECT_CONTEXT.md + ce JSON → demande "Génère le projet React livrable pour ce client"
              </div>
            </div>
            <div style={{ padding: 16, maxHeight: "55vh", overflowY: "auto" }}>
              <pre style={{ background: "#111", padding: 14, borderRadius: 6, color: "#aaa", fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "'JetBrains Mono',monospace" }}>
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#666", maxWidth: 400 }}>
                💡 Les images uploadées sont en base64 dans le JSON. Pour un site de prod, elles seront extraites en fichiers séparés.
              </div>
              <button onClick={copyToClipboard} style={{
                padding: "10px 28px", borderRadius: 4, border: "none",
                background: copied ? "#2ecc71" : "#C8956C", color: "#fff",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                transition: "background 0.3s ease", whiteSpace: "nowrap",
              }}>
                {copied ? "✓ Copié !" : "Copier le JSON"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
