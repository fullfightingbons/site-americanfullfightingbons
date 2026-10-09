// ============================================================
// AFFBC Admin — Visual Builder
// Architecture inspirée de Soloist.ai :
//   • Sidebar de navigation par section
//   • Panneau principal contextuel
//   • Badge Manager avec drag & drop
//   • Live preview des modifications
// ============================================================

// ─── Constantes ─────────────────────────────────────────────

const SETTINGS_GROUPS = [
  {
    id: "identite",
    title: "Identité",
    icon: "◈",
    description: "Nom du club, marque visible et éléments permanents.",
    fields: [
      ["club_name", "Nom du club"],
      ["brand_primary", "Marque ligne 1"],
      ["brand_secondary", "Marque ligne 2"],
      ["site_logo_url", "Logo principal (URL)"],
      ["favicon_url", "Favicon (URL)"],
      ["site_public_url", "URL publique du site"],
      ["browser_title", "Titre onglet navigateur"],
      ["footer_note", "Texte footer"],
      ["footer_legal", "Mention légale footer"],
      ["footer_meta", "Texte complémentaire footer"],
      ["inpi_note", "Note INPI"],
      ["site_ambient_image", "Image d'ambiance (URL)"],
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    icon: "↗",
    description: "Libellés et liens visibles dans l'en-tête du site.",
    fields: [
      ["nav_club_label", "Menu club"],
      ["nav_club_enabled", "Afficher menu club"],
      ["nav_schedule_label", "Menu séances"],
      ["nav_schedule_enabled", "Afficher menu séances"],
      ["nav_pricing_label", "Menu tarifs"],
      ["nav_pricing_enabled", "Afficher menu tarifs"],
      ["nav_contact_label", "Menu contact"],
      ["nav_contact_enabled", "Afficher menu contact"],
      ["nav_inscription_label", "Menu inscription"],
      ["nav_inscription_href", "Lien inscription"],
      ["nav_inscription_enabled", "Afficher menu inscription"],
      ["nav_calendar_label", "Menu calendrier"],
      ["nav_calendar_href", "Lien calendrier"],
      ["nav_calendar_enabled", "Afficher menu calendrier"],
      ["nav_shop_label", "Menu boutique"],
      ["nav_shop_href", "Lien boutique"],
      ["nav_shop_enabled", "Afficher menu boutique"],
      ["nav_membre_label", "Menu espace membre"],
      ["nav_membre_href", "Lien espace membre"],
      ["nav_membre_enabled", "Afficher menu espace membre"],
      ["quick_links_cta_label", "Bouton cartes rapides"],
    ],
  },
  {
    id: "theme",
    title: "Thème",
    icon: "◐",
    description: "Couleurs, polices et rendu global du site public.",
    fields: [
      ["theme_primary_color", "Couleur principale"],
      ["theme_secondary_color", "Couleur secondaire"],
      ["theme_heading_font", "Police titres"],
      ["theme_body_font", "Police textes"],
      ["theme_nav_font", "Police navigation"],
      ["theme_button_font", "Police boutons"],
      ["theme_card_title_font", "Police titres cartes"],
      ["theme_card_body_font", "Police textes cartes"],
    ],
  },
  {
    id: "hero",
    title: "Hero",
    icon: "▲",
    description: "Première impression du site, boutons principaux.",
    fields: [
      ["hero_kicker", "Accroche"],
      ["hero_title", "Titre principal"],
      ["hero_body", "Texte intro"],
      ["hero_background_image", "Image de fond (URL)"],
      ["hero_primary_label", "Bouton principal"],
      ["hero_primary_href", "Lien bouton principal"],
      ["hero_primary_enabled", "Afficher bouton principal"],
      ["hero_secondary_label", "Bouton secondaire"],
      ["hero_secondary_href", "Lien bouton secondaire"],
      ["hero_secondary_enabled", "Afficher bouton secondaire"],
      ["hero_link_inscription_label", "Lien rapide 1"],
      ["hero_link_inscription_href", "URL lien rapide 1"],
      ["hero_link_inscription_enabled", "Afficher lien rapide 1"],
      ["hero_link_calendar_label", "Lien rapide 2"],
      ["hero_link_calendar_href", "URL lien rapide 2"],
      ["hero_link_calendar_enabled", "Afficher lien rapide 2"],
      ["hero_link_shop_label", "Lien rapide 3"],
      ["hero_link_shop_href", "URL lien rapide 3"],
      ["hero_link_shop_enabled", "Afficher lien rapide 3"],
      ["announcement_badge", "Badge annonce"],
      ["announcement_title", "Titre annonce"],
      ["announcement_body", "Texte annonce"],
    ],
  },
  {
    id: "seo-social",
    title: "SEO & Réseaux",
    icon: "∞",
    description: "Métadonnées, indexation et liens sociaux du site.",
    fields: [
      ["meta_description", "Description SEO"],
      ["meta_keywords", "Mots-clés SEO"],
      ["social_facebook_url", "Facebook"],
      ["social_instagram_url", "Instagram"],
      ["social_youtube_url", "YouTube"],
      ["social_tiktok_url", "TikTok"],
      ["social_whatsapp_url", "WhatsApp"],
    ],
  },
  {
    id: "club",
    title: "Club",
    icon: "⬡",
    description: "Texte de présentation et bloc d'accompagnement.",
    fields: [
      ["club_story", "Histoire du club"],
      ["story_intro", "Intro section club"],
      ["story_card_title", "Titre carte principale"],
      ["story_note_label", "Badge repères"],
      ["story_note_title", "Titre bloc repères"],
      ["story_note_body", "Texte bloc repères"],
    ],
  },
  {
    id: "upcoming-events",
    title: "Prochainement au club",
    icon: "📅",
    description: "Bouton d'accès au calendrier. Le titre et le sous-titre de la section se modifient dans le panneau « Sections ».",
    fields: [
      ["upcoming_events_limit", "Nombre d'évènements affichés"],
      ["upcoming_events_cta_label", "Bouton « voir tout »"],
      ["upcoming_events_cta_href", "Lien du bouton"],
    ],
  },
  {
    id: "spotlight",
    title: "À la une",
    icon: "★",
    description: "Bloc éditorial principal sous le hero.",
    fields: [
      ["spotlight_date", "Date"],
      ["spotlight_title", "Titre"],
      ["spotlight_body", "Texte"],
      ["spotlight_background_image", "Image de fond (URL)"],
      ["spotlight_cta_label", "Bouton principal"],
      ["spotlight_cta_href", "Lien bouton principal"],
      ["spotlight_cta_enabled", "Afficher bouton principal"],
      ["spotlight_secondary_label", "Bouton secondaire"],
      ["spotlight_secondary_href", "Lien bouton secondaire"],
      ["spotlight_secondary_enabled", "Afficher bouton secondaire"],
      ["spotlight_intro", "Intro section"],
    ],
  },
  {
    id: "equipe",
    title: "Équipe",
    icon: "▲",
    description: "Présentation de l'équipe : pyramide (président au sommet, bureau au milieu, assistants en bas) ou grille classique. La position de chaque membre se règle dans « Équipe » (champ « Position dans la pyramide »).",
    fields: [
      ["team_layout", "Présentation", { type: "select", options: [["pyramid", "Pyramide"], ["grid", "Grille"]] }],
    ],
  },
  {
    id: "sections-intro",
    title: "Intros sections",
    icon: "¶",
    description: "Textes d'introduction pour chaque bloc de la page.",
    fields: [
      ["schedule_intro", "Intro planning"],
      ["team_intro", "Intro équipe"],
      ["pricing_intro_synced", "Intro tarifs synchronisés"],
      ["pricing_intro_local", "Intro tarifs locaux"],
      ["highlights_intro", "Intro temps forts"],
      ["gallery_intro", "Intro galerie"],
      ["resources_intro", "Intro ressources"],
      ["equipment_intro", "Intro équipement"],
      ["sponsors_intro", "Intro sponsors"],
      ["news_intro", "Intro actualités"],
      ["faq_intro", "Intro FAQ"],
      ["testimonials_intro", "Intro avis"],
      ["google_reviews_enabled", "Utiliser les avis Google"],
      ["google_place_id", "Google Place ID"],
      ["google_place_query", "Recherche Google du club"],
      ["google_reviews_min_rating", "Note minimale avis Google"],
      ["google_reviews_cta_label", "Bouton avis Google"],
      ["google_reviews_cta_href", "Lien page Google"],
      ["sponsor_intro", "Intro mécénat"],
      ["contact_intro", "Intro contact"],
    ],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "✉",
    description: "Coordonnées et formulaire de contact.",
    fields: [
      ["contact_email", "E-mail club"],
      ["contact_phone", "Téléphone club"],
      ["contact_address", "Adresse club"],
      ["contact_map_embed_url", "URL Google Maps embed"],
      ["contact_details_title", "Titre coordonnées"],
      ["contact_email_title", "Libellé e-mail"],
      ["contact_phone_title", "Libellé téléphone"],
      ["contact_address_title", "Libellé adresse"],
      ["contact_form_title", "Titre formulaire"],
      ["contact_name_label", "Champ nom"],
      ["contact_email_label", "Champ e-mail"],
      ["contact_phone_label", "Champ téléphone"],
      ["contact_message_label", "Champ message"],
      ["contact_submit_label", "Bouton envoi"],
      ["contact_map_unavailable_label", "Texte carte indisponible"],
      ["contact_map_title", "Titre accessibilité carte"],
    ],
  },
  {
    id: "mecenat",
    title: "Mécénat",
    icon: "♦",
    description: "Appel au soutien et bouton associé.",
    fields: [
      ["sponsor_title", "Titre"],
      ["sponsor_body", "Texte"],
      ["sponsor_cta_label", "Bouton"],
      ["sponsor_cta_href", "Lien bouton"],
      ["sponsor_checkout_enabled", "Checkout HelloAsso activé"],
      ["sponsor_checkout_org_slug", "Slug organisation HelloAsso"],
      ["sponsor_checkout_item_name", "Libellé du paiement"],
      ["sponsor_checkout_min_amount_eur", "Don minimum (€)"],
      ["sponsor_checkout_suggested_amounts", "Montants suggérés (€)"],
      ["sponsor_amount_label", "Champ montant"],
      ["sponsor_first_name_label", "Champ prénom"],
      ["sponsor_last_name_label", "Champ nom"],
      ["sponsor_email_label", "Champ e-mail"],
    ],
  },
];

const FONT_OPTIONS = [
  { label: "Sora - moderne, net", value: "'Sora', sans-serif" },
  { label: "Inter - très lisible", value: "'Inter', sans-serif" },
  { label: "Manrope - doux et premium", value: "'Manrope', sans-serif" },
  { label: "Outfit - contemporain", value: "'Outfit', sans-serif" },
  { label: "Space Grotesk - sportif", value: "'Space Grotesk', sans-serif" },
  { label: "Archivo - dense et solide", value: "'Archivo', sans-serif" },
  { label: "Montserrat - classique moderne", value: "'Montserrat', sans-serif" },
  { label: "Barlow Condensed - impact titres", value: "'Barlow Condensed', sans-serif" },
];

const FONT_SETTING_KEYS = new Set([
  "theme_heading_font",
  "theme_body_font",
  "theme_nav_font",
  "theme_button_font",
  "theme_card_title_font",
  "theme_card_body_font",
]);

function renderFontSelect(key, value) {
  const hasCustomValue = value && !FONT_OPTIONS.some((option) => option.value === value);
  const options = FONT_OPTIONS
    .map((option) => `<option value="${inputValue(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
  return `
    <select id="setting-${escapeHtml(key)}" name="${escapeHtml(key)}" class="vb-field-input">
      ${hasCustomValue ? `<option value="${inputValue(value)}" selected>${escapeHtml(value)}</option>` : ""}
      ${options}
    </select>
  `;
}

// Badges disponibles sur le site avec leur contexte
const BADGE_DEFINITIONS = [
  { id: "announcement_badge", label: "Badge annonce hero", section: "hero", settingKey: true },
  { id: "story_note_label", label: "Badge repères (club)", section: "club", settingKey: true },
  { id: "highlights_badge", label: "Badges temps forts", section: "highlights", dynamic: true, kind: "highlights", field: "badge" },
  { id: "pricing_badge", label: "Badges tarifs", section: "pricing", dynamic: true, kind: "pricing", field: "badge" },
];

// Sections disponibles sur le site
const SECTION_KEYS = [
  { key: "upcoming_events", label: "Prochainement au club", icon: "📅" },
  { key: "story", label: "Le club", icon: "⬡" },
  { key: "spotlight", label: "À la une", icon: "★" },
  { key: "schedule", label: "Planning", icon: "⏱" },
  { key: "team", label: "Équipe", icon: "👥" },
  { key: "pricing", label: "Tarifs", icon: "€" },
  { key: "news", label: "Actualités", icon: "●" },
  { key: "highlights", label: "Temps forts", icon: "◈" },
  { key: "gallery", label: "Galerie", icon: "⬚" },
  { key: "resources", label: "Ressources", icon: "📂" },
  { key: "equipment", label: "Équipement", icon: "🥊" },
  { key: "sponsors", label: "Sponsors", icon: "★" },
  { key: "faq", label: "FAQ", icon: "?" },
  { key: "testimonials", label: "Avis", icon: "”" },
  { key: "sponsor", label: "Mécénat", icon: "♦" },
  { key: "custom", label: "Blocs libres", icon: "▦" },
  { key: "contact", label: "Contact", icon: "✉" },
];

// ─── État global ─────────────────────────────────────────────

let state = null;
let activePanel = "dashboard";
let pendingDelete = null;
let orderContext = null;
let unsavedSettings = {};

// ─── Utilitaires ─────────────────────────────────────────────

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Voir public/assets/site.js — même garde-fou de schéma d'URL (empêche
// javascript:/data: dans un href ou un src d'iframe admin-éditable).
function safeHref(value) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return v;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return "#";
}

function inputValue(value) {
  return escapeHtml(value);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportMessagesCSV() {
  const messages = state?.messages || [];
  if (!messages.length) {
    showStatus("Aucun message à exporter.");
    return;
  }
  const rows = [
    ["Date", "Statut", "Nom", "Email", "Téléphone", "Message"],
    ...messages.map((m) => [m.created_at, m.status, m.full_name, m.email, m.phone, m.message]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`messages-contact-${stamp}.csv`, csv, "text/csv;charset=utf-8");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Erreur");
  return payload.data;
}

function showStatus(message, isError = true) {
  const el = document.getElementById("admin-status");
  if (!el) return;
  el.textContent = message || "";
  el.className = "vb-status " + (isError ? "vb-status--error" : "vb-status--ok");
  el.hidden = false;
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => { el.hidden = true; }, 4000);
}

function showLegacyStatus(target, message, isError = true) {
  showStatus(message, isError);
}

function getSettingFieldValue(input) {
  if (!input) return "";
  if (input.type === "checkbox") return input.checked ? "1" : "0";
  return input.value;
}

function refreshSitePreview() {
  const frame = document.getElementById("site-preview-frame");
  const stamp = document.getElementById("site-preview-stamp");
  if (!frame) return;
  const url = new URL(window.location.origin);
  url.searchParams.set("preview", String(Date.now()));
  frame.src = url.toString();
  if (stamp) stamp.textContent = new Date().toLocaleTimeString("fr-FR");
}

function renderPreviewMeta() {
  const el = document.getElementById("site-preview-meta");
  if (!el || !state) return;
  const socialCount = Object.values(state.social || {}).filter(Boolean).length;
  const themeSummary = [state.design?.primaryColor, state.design?.secondaryColor].filter(Boolean).join(" · ");
  el.innerHTML = `
    <div class="vb-preview-stat">
      <span>Sections actives</span>
      <strong>${(state.sections || []).filter((item) => Number(item.enabled) === 1).length}</strong>
    </div>
    <div class="vb-preview-stat">
      <span>Visuels</span>
      <strong>${(state.gallery || []).length}</strong>
    </div>
    <div class="vb-preview-stat">
      <span>Réseaux</span>
      <strong>${socialCount}</strong>
    </div>
    <div class="vb-preview-stat vb-preview-stat--wide">
      <span>Thème</span>
      <strong>${escapeHtml(themeSummary || "Couleurs par défaut")}</strong>
    </div>
  `;
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

// ─── Navigation sidebar ───────────────────────────────────────

function setActivePanel(panelId) {
  activePanel = panelId;

  // Mise à jour sidebar
  document.querySelectorAll(".vb-nav-item").forEach((el) => {
    el.classList.toggle("vb-nav-item--active", el.dataset.panel === panelId);
  });

  // Affichage du panneau
  document.querySelectorAll(".vb-panel").forEach((el) => {
    el.hidden = el.dataset.panel !== panelId;
  });

  // Titre du header
  const titleEl = document.getElementById("vb-panel-title");
  if (titleEl) {
    const navItem = document.querySelector(`.vb-nav-item[data-panel="${panelId}"]`);
    titleEl.textContent = navItem ? navItem.querySelector(".vb-nav-label")?.textContent || "" : "";
  }
}

// ─── Rendu Dashboard ──────────────────────────────────────────

function renderDashboard() {
  const el = document.getElementById("panel-dashboard");
  if (!el || !state) return;

  const sections = state.sections || [];
  const activeSections = sections.filter((s) => Number(s.enabled) === 1);
  const newMessages = (state.messages || []).filter((m) => m.status === "new");

  el.innerHTML = `
    <div class="vb-dash-grid">
      <div class="vb-dash-stat">
        <span class="vb-dash-stat-value">${activeSections.length}</span>
        <span class="vb-dash-stat-label">Sections actives</span>
      </div>
      <div class="vb-dash-stat">
        <span class="vb-dash-stat-value">${newMessages.length}</span>
        <span class="vb-dash-stat-label">Nouveaux messages</span>
        ${newMessages.length > 0 ? `<button class="vb-dash-stat-action" data-panel-goto="messages">Voir</button>` : ""}
      </div>
      <div class="vb-dash-stat">
        <span class="vb-dash-stat-value">${(state.links || []).length}</span>
        <span class="vb-dash-stat-label">Liens rapides</span>
      </div>
      <div class="vb-dash-stat">
        <span class="vb-dash-stat-value">${(state.gallery || []).length}</span>
        <span class="vb-dash-stat-label">Visuels publiés</span>
      </div>
    </div>

    <div class="vb-dash-sections">
      <div class="vb-section-head">
        <h3 class="vb-section-title">Sections du site</h3>
        <span class="vb-section-sub">Glissez pour réordonner • cliquez pour activer/désactiver</span>
      </div>
      <div id="dash-section-list" class="vb-sections-builder">
        ${renderSectionsBuilderItems()}
      </div>
    </div>

    <div class="vb-dash-badges">
      <div class="vb-section-head">
        <h3 class="vb-section-title">Gestionnaire de badges</h3>
        <span class="vb-section-sub">Activez, désactivez et repositionnez les badges de chaque section</span>
      </div>
      ${renderBadgeManager()}
    </div>
  `;

  initSectionsDragDrop();
}

function renderSectionsBuilderItems() {
  const sections = [...(state.sections || [])].sort(
    (a, b) => Number(a.display_order) - Number(b.display_order)
  );

  return sections.map((s) => {
    const meta = SECTION_KEYS.find((k) => k.key === s.section_key) || { icon: "▪", label: s.section_key };
    const isEnabled = Number(s.enabled) === 1;
    return `
      <div class="vb-section-item ${isEnabled ? "vb-section-item--on" : "vb-section-item--off"}"
           draggable="true" data-section-id="${escapeHtml(s.id)}" data-section-key="${escapeHtml(s.section_key)}">
        <span class="vb-section-drag">⠿</span>
        <span class="vb-section-icon">${meta.icon}</span>
        <div class="vb-section-info">
          <span class="vb-section-name">${escapeHtml(s.title || meta.label)}</span>
          <span class="vb-section-key">${escapeHtml(s.section_key)}</span>
        </div>
        <label class="vb-toggle" title="${isEnabled ? "Désactiver" : "Activer"}">
          <input type="checkbox" class="vb-toggle-input" data-section-toggle="${escapeHtml(s.id)}"
            ${isEnabled ? "checked" : ""}>
          <span class="vb-toggle-track"></span>
        </label>
      </div>
    `;
  }).join("");
}

function renderBadgeManager() {
  if (!state) return "";

  const rows = [
    {
      label: "Badge annonce hero",
      key: "announcement_badge",
      value: state.siteSettings?.announcement_badge || "",
      settingKey: true,
      hint: "Apparaît dans le panneau latéral du hero.",
    },
    {
      label: "Badge repères (section club)",
      key: "story_note_label",
      value: state.siteSettings?.story_note_label || "",
      settingKey: true,
      hint: "Badge affiché sur la carte d'info du club.",
    },
  ];

  // Badges dynamiques : highlights
  const highlightBadges = (state.highlights || []).map((h) => ({
    label: `Badge — ${h.title || "Temps fort"}`,
    dynamicKind: "highlights",
    dynamicId: h.id,
    field: "badge",
    value: h.badge || "",
    hint: `Section « Temps forts » · ID ${h.id}`,
  }));

  const allRows = [...rows, ...highlightBadges];

  return `
    <div class="vb-badge-manager">
      ${allRows.map((row) => `
        <div class="vb-badge-row">
          <div class="vb-badge-info">
            <span class="vb-badge-label">${escapeHtml(row.label)}</span>
            <span class="vb-badge-hint">${escapeHtml(row.hint || "")}</span>
          </div>
          <div class="vb-badge-controls">
            <div class="vb-badge-preview ${row.value ? "" : "vb-badge-preview--empty"}">
              ${row.value ? `<span class="vb-badge-chip">${escapeHtml(row.value)}</span>` : `<span class="vb-badge-empty-label">Aucun badge</span>`}
            </div>
            <input type="text" class="vb-badge-input"
              placeholder="Texte du badge…"
              value="${inputValue(row.value)}"
              ${row.settingKey ? `data-badge-setting="${escapeHtml(row.key)}"` : ""}
              ${row.dynamicKind ? `data-badge-kind="${escapeHtml(row.dynamicKind)}" data-badge-id="${escapeHtml(row.dynamicId)}" data-badge-field="${escapeHtml(row.field)}"` : ""}
            >
            <button class="vb-badge-save btn btn-dark" type="button"
              ${row.settingKey ? `data-badge-save-setting="${escapeHtml(row.key)}"` : ""}
              ${row.dynamicKind ? `data-badge-save-dynamic="${escapeHtml(row.dynamicId)}" data-badge-save-kind="${escapeHtml(row.dynamicKind)}" data-badge-save-field="${escapeHtml(row.field)}"` : ""}
            >Sauver</button>
            ${row.value ? `<button class="vb-badge-clear btn btn-dark" type="button"
              ${row.settingKey ? `data-badge-clear-setting="${escapeHtml(row.key)}"` : ""}
              ${row.dynamicKind ? `data-badge-clear-dynamic="${escapeHtml(row.dynamicId)}" data-badge-clear-kind="${escapeHtml(row.dynamicKind)}" data-badge-clear-field="${escapeHtml(row.field)}"` : ""}
            >✕</button>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// ─── Drag & drop sections ─────────────────────────────────────

let dragSection = null;

function initSectionsDragDrop() {
  const list = document.getElementById("dash-section-list");
  if (!list) return;

  list.addEventListener("dragstart", (e) => {
    const row = e.target.closest(".vb-section-item");
    if (!row) return;
    dragSection = row;
    row.classList.add("vb-section-item--dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  list.addEventListener("dragover", (e) => {
    if (!dragSection) return;
    const row = e.target.closest(".vb-section-item");
    if (!row || row === dragSection) return;
    e.preventDefault();
    const rect = row.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    list.insertBefore(dragSection, before ? row : row.nextSibling);
  });

  list.addEventListener("dragend", async () => {
    if (dragSection) dragSection.classList.remove("vb-section-item--dragging");
    dragSection = null;
    await saveSectionsOrder();
  });
}

async function saveSectionsOrder() {
  const list = document.getElementById("dash-section-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll(".vb-section-item"));
  try {
    await Promise.all(
      items.map((el, index) =>
        api("/api/admin/content", {
          method: "POST",
          body: JSON.stringify({
            table: "landing_sections",
            action: "upsert",
            values: { id: el.dataset.sectionId, display_order: index + 1 },
          }),
        })
      )
    );
    await loadAdmin();
    showStatus("Ordre des sections mis à jour.", false);
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "Erreur");
  }
}

// ─── Rendu panneau Réglages ───────────────────────────────────

function renderSettingsPanel(groupId) {
  const group = SETTINGS_GROUPS.find((g) => g.id === groupId);
  const el = document.getElementById(`panel-settings-${groupId}`);
  if (!group || !el) return;

  const settings = state?.siteSettings || {};

  el.innerHTML = `
    <div class="vb-settings-panel">
      <div class="vb-settings-header">
        <div class="vb-settings-icon">${group.icon}</div>
        <div>
          <h2 class="vb-settings-title">${escapeHtml(group.title)}</h2>
          <p class="vb-settings-desc">${escapeHtml(group.description)}</p>
        </div>
      </div>

      ${groupId === "contact" ? `
        <div class="vb-map-preview-wrapper">
          <div class="vb-map-label">Prévisualisation carte</div>
          <iframe id="map-preview" class="map-preview" loading="lazy"
            src="${escapeHtml(safeHref(settings["contact_map_embed_url"] || ""))}"></iframe>
          <div class="vb-map-actions">
            <button class="btn btn-dark premium-btn-secondary" type="button" id="generate-map-url">
              Générer l'URL Google Maps
            </button>
          </div>
        </div>
      ` : ""}

      <div class="vb-fields-grid">
        ${group.fields.map(([key, label, spec]) => {
          const isBoolean = key.endsWith("_enabled");
          const isLong = key.includes("body") || key.includes("story") || key.includes("intro")
            || key.includes("address") || key.includes("note") || key.includes("subtitle");
          const value = settings[key] || "";
          const checked = ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
          return `
            <div class="vb-field ${isLong ? "vb-field--full" : ""}">
              <label class="vb-field-label" for="setting-${escapeHtml(key)}">${escapeHtml(label)}</label>
              ${spec?.type === "select"
                ? `<select id="setting-${escapeHtml(key)}" name="${escapeHtml(key)}" class="vb-field-input">${spec.options.map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}"${String(value || spec.options[0][0]) === optValue ? " selected" : ""}>${escapeHtml(optLabel)}</option>`).join("")}</select>`
                : isBoolean
                ? `<label class="vb-toggle-row" for="setting-${escapeHtml(key)}">
                    <span>${escapeHtml(label)}</span>
                    <input id="setting-${escapeHtml(key)}" name="${escapeHtml(key)}" class="vb-field-checkbox" type="checkbox" ${checked ? "checked" : ""}>
                  </label>`
                : FONT_SETTING_KEYS.has(key)
                ? renderFontSelect(key, value)
                : isLong
                ? `<textarea id="setting-${escapeHtml(key)}" name="${escapeHtml(key)}" class="vb-field-textarea" rows="3">${escapeHtml(value)}</textarea>`
                : `<input id="setting-${escapeHtml(key)}" name="${escapeHtml(key)}" class="vb-field-input" type="text" value="${inputValue(value)}">`
              }
            </div>
          `;
        }).join("")}
      </div>

      <div class="vb-settings-footer">
        <button class="btn btn-red premium-btn" type="button" data-save-settings-group="${escapeHtml(groupId)}">
          Enregistrer ${escapeHtml(group.title)}
        </button>
      </div>
    </div>
  `;
}

// ─── Rendu listes d'entités ───────────────────────────────────

function renderEntityPanel(panelId, kind, items, fields, addLabel) {
  const el = document.getElementById(`panel-${panelId}`);
  if (!el) return;

  el.innerHTML = `
    <div class="vb-entity-panel">
      <div class="vb-entity-header">
        <button class="btn btn-dark premium-btn-secondary vb-add-btn" type="button" data-add="${escapeHtml(kind)}">
          + ${escapeHtml(addLabel)}
        </button>
        ${items.length > 1 ? `<button class="btn btn-dark premium-btn-secondary" type="button" data-open-order="${escapeHtml(kind)}">Réordonner</button>` : ""}
      </div>
      <div class="vb-entity-list" id="entity-list-${escapeHtml(kind)}">
        ${items.length === 0 ? `<div class="vb-entity-empty">Aucun élément. Cliquez sur « ${escapeHtml(addLabel)} » pour commencer.</div>` : ""}
        ${items.map((item) => renderEntityCard(kind, item, fields)).join("")}
      </div>
    </div>
  `;
}

function renderSectionsTextPanel() {
  const el = document.getElementById("panel-sections");
  if (!el) return;
  const items = [...(state?.sections || [])].sort((a, b) => Number(a.display_order) - Number(b.display_order));
  el.innerHTML = `
    <div class="vb-entity-panel">
      <div class="vb-entity-header">
        <div class="vb-note">Modifiez ici les titres et sous-titres visibles en haut de chaque section. Les textes internes restent dans les panneaux dédiés : Club, À la une, Planning, Équipe, Tarifs, etc.</div>
        ${items.length > 1 ? `<button class="btn btn-dark premium-btn-secondary" type="button" data-open-order="sections">Réordonner</button>` : ""}
      </div>
      <div class="vb-entity-list">
        ${items.map((item) => renderSectionTextCard(item)).join("")}
      </div>
    </div>
  `;
}

function renderSectionTextCard(item) {
  const meta = SECTION_KEYS.find((k) => k.key === item.section_key) || { icon: "¶", label: item.section_key };
  const enabled = Number(item.enabled) === 1;
  return `
    <div class="vb-entity-card" data-card-kind="sections" data-card-id="${escapeHtml(item.id)}">
      <div class="vb-entity-card-head">
        <div class="vb-entity-card-title">${meta.icon} ${escapeHtml(item.title || meta.label)}</div>
        <div class="vb-entity-card-actions">
          <span class="vb-entity-chip">${enabled ? "Visible" : "Masquée"}</span>
          <button class="vb-card-btn vb-card-btn--compact" type="button"
            data-move-kind="sections" data-move-id="${escapeHtml(item.id)}" data-move-direction="-1">↑</button>
          <button class="vb-card-btn vb-card-btn--compact" type="button"
            data-move-kind="sections" data-move-id="${escapeHtml(item.id)}" data-move-direction="1">↓</button>
          <button class="vb-card-btn vb-card-btn--edit" type="button"
            data-edit-kind="sections" data-edit-id="${escapeHtml(item.id)}">✎ Modifier</button>
        </div>
      </div>
      <div class="vb-entity-card-preview">
        <span class="vb-entity-chip">${escapeHtml(item.section_key)}</span>
        ${item.subtitle ? `<span class="vb-entity-chip">${escapeHtml(String(item.subtitle).slice(0, 80))}</span>` : ""}
      </div>
    </div>
  `;
}

function renderEntityCard(kind, item, fields) {
  const titleField = item.title || item.name || item.label || item.full_name || item.day_label || "Élément";
  const imageField = fields.find((field) => field.type === "image" && item[field.key]);
  return `
    <div class="vb-entity-card" data-card-kind="${escapeHtml(kind)}" data-card-id="${escapeHtml(item.id)}">
      <div class="vb-entity-card-head">
        <div class="vb-entity-card-title">${escapeHtml(titleField)}</div>
        <div class="vb-entity-card-actions">
          ${sectionAnchorForKind(kind) ? `<button class="vb-card-btn" type="button"
            data-view-kind="${escapeHtml(kind)}">↗ Voir</button>` : ""}
          <button class="vb-card-btn vb-card-btn--compact" type="button"
            data-move-kind="${escapeHtml(kind)}" data-move-id="${escapeHtml(item.id)}" data-move-direction="-1">↑</button>
          <button class="vb-card-btn vb-card-btn--compact" type="button"
            data-move-kind="${escapeHtml(kind)}" data-move-id="${escapeHtml(item.id)}" data-move-direction="1">↓</button>
          <button class="vb-card-btn" type="button"
            data-duplicate-kind="${escapeHtml(kind)}" data-duplicate-id="${escapeHtml(item.id)}">Dupliquer</button>
          <button class="vb-card-btn vb-card-btn--edit" type="button"
            data-edit-kind="${escapeHtml(kind)}" data-edit-id="${escapeHtml(item.id)}">✎ Modifier</button>
          <button class="vb-card-btn vb-card-btn--delete" type="button"
            data-delete="${escapeHtml(kind)}" data-id="${escapeHtml(item.id)}">✕</button>
        </div>
      </div>
      <div class="vb-entity-card-preview">
        ${imageField ? `<img class="vb-entity-thumb" src="${escapeHtml(item[imageField.key])}" alt="">` : ""}
        ${fields.filter((field) => field.type !== "image").slice(0, 4).map((f) => item[f.key]
          ? `<span class="vb-entity-chip">${escapeHtml(String(item[f.key]).slice(0, 40))}</span>`
          : ""
        ).join("")}
      </div>
    </div>
  `;
}

// ─── Rendu Planning ───────────────────────────────────────────

const SCHEDULE_FIELDS = [
  { key: "day_label", label: "Jour" },
  { key: "time_label", label: "Horaire" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "note", label: "Note", type: "textarea" },
];

const TEAM_FIELDS = [
  { key: "full_name", label: "Nom" },
  { key: "role_label", label: "Rôle" },
  { key: "belt_label", label: "Ceinture" },
  { key: "image_url", label: "Photo", type: "image" },
  { key: "pyramid_level", label: "Position dans la pyramide", type: "select", options: ["auto", "sommet", "milieu", "base"] },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "bio", label: "Bio", type: "textarea" },
];

const HIGHLIGHTS_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "badge", label: "Badge" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "cta_href", label: "Lien bouton" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "body", label: "Texte", type: "textarea" },
];

const GALLERY_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "alt_text", label: "Texte alternatif", type: "textarea" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "display_order", label: "Ordre", type: "number" },
];

const LINKS_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "href", label: "Lien" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
];

const BUTTON_FIELDS = [
  { key: "label", label: "Texte du bouton" },
  { key: "href", label: "Lien" },
  { key: "placement", label: "Emplacement", type: "select", options: ["nav", "hero", "quick"] },
  { key: "style", label: "Style", type: "select", options: ["red", "dark", "link"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
];

const BLOCK_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "image_url", label: "Illustration", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["cover", "contain"] },
  { key: "cta_label", label: "Texte bouton" },
  { key: "cta_href", label: "Lien bouton" },
  { key: "width_percent", label: "Largeur (%)", type: "number" },
  { key: "height_px", label: "Hauteur image (px)", type: "number" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "body", label: "Texte", type: "textarea" },
];

const RESOURCES_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "cta_href", label: "Lien bouton" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["contain", "cover"] },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
];

const EQUIPMENT_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "cta_href", label: "Lien bouton" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "image_url", label: "Photo", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["cover", "contain"] },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
];

const SPONSOR_PARTNER_FIELDS = [
  { key: "name", label: "Nom du sponsor" },
  { key: "website_url", label: "Lien site web" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "logo_url", label: "Logo ou photo", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["contain", "cover"] },
  { key: "featured", label: "Sponsor principal", type: "checkbox" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "description", label: "Texte associé", type: "textarea" },
];

const NEWS_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "date_label", label: "Date" },
  { key: "badge", label: "Badge" },
  { key: "cta_label", label: "Texte bouton" },
  { key: "cta_href", label: "Lien bouton" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["cover", "contain"] },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "body", label: "Texte", type: "textarea" },
];

const FAQ_FIELDS = [
  { key: "question", label: "Question" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "answer", label: "Réponse", type: "textarea" },
];

const TESTIMONIAL_FIELDS = [
  { key: "author_name", label: "Nom" },
  { key: "role_label", label: "Rôle ou lien avec le club" },
  { key: "image_url", label: "Photo", type: "image" },
  { key: "image_fit", label: "Comportement image", type: "select", options: ["cover", "contain"] },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Publié", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "quote", label: "Avis", type: "textarea" },
];

const MEDIA_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "alt_text", label: "Texte alternatif", type: "textarea" },
  { key: "display_order", label: "Ordre", type: "number" },
];

const SECTION_TEXT_FIELDS = [
  { key: "title", label: "Titre affiché" },
  { key: "subtitle", label: "Sous-titre affiché", type: "textarea" },
  { key: "enabled", label: "Section visible", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
];

// ─── Messages ─────────────────────────────────────────────────

function renderMessagesPanel() {
  const el = document.getElementById("panel-messages");
  if (!el) return;

  const messages = state?.messages || [];
  const byStatus = { new: [], read: [], done: [] };
  messages.forEach((m) => { (byStatus[m.status] || byStatus.new).push(m); });

  el.innerHTML = `
    <div class="vb-entity-panel">
      ${messages.length > 0 ? `
        <div class="vb-entity-actions" style="justify-content:flex-end;margin-bottom:1rem">
          <button class="btn btn-dark" type="button" data-export-messages>Exporter CSV</button>
        </div>
      ` : ""}
      ${messages.length === 0 ? `<div class="vb-entity-empty">Aucun message reçu.</div>` : ""}
      ${["new", "read", "done"].map((status) => {
        if (byStatus[status].length === 0) return "";
        const labels = { new: "Nouveaux", read: "Lus", done: "Traités" };
        return `
          <div class="vb-msg-group">
            <div class="vb-msg-group-label">${labels[status]} (${byStatus[status].length})</div>
            ${byStatus[status].map((msg) => `
              <div class="vb-msg-card vb-msg-card--${escapeHtml(status)}">
                <div class="vb-msg-head">
                  <strong>${escapeHtml(msg.full_name)}</strong>
                  <span class="vb-msg-meta">${escapeHtml(msg.email)}${msg.phone ? ` · ${escapeHtml(msg.phone)}` : ""}</span>
                  <span class="vb-msg-date">${escapeHtml(msg.created_at)}</span>
                </div>
                <p class="vb-msg-body">${escapeHtml(msg.message)}</p>
                <div class="vb-msg-actions">
                  ${status !== "new" ? `<button class="btn btn-dark" type="button" data-message-status="${escapeHtml(msg.id)}" data-status="new">Nouveau</button>` : ""}
                  ${status !== "read" ? `<button class="btn btn-dark" type="button" data-message-status="${escapeHtml(msg.id)}" data-status="read">Lu</button>` : ""}
                  ${status !== "done" ? `<button class="btn btn-dark" type="button" data-message-status="${escapeHtml(msg.id)}" data-status="done">Traité</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

const PRICING_FIELDS = [
  { key: "title", label: "Titre" },
  { key: "price_label", label: "Prix affiché" },
  { key: "badge", label: "Badge" },
  { key: "text_align", label: "Alignement texte", type: "select", options: ["left", "center", "right"] },
  { key: "enabled", label: "Visible sur le site", type: "checkbox" },
  { key: "display_order", label: "Ordre", type: "number" },
  { key: "description", label: "Texte associé", type: "textarea" },
];

// ─── Tarifs ───────────────────────────────────────────────────

function renderPricingPanel() {
  const el = document.getElementById("panel-pricing");
  if (!el) return;

  const pricing = state?.pricing || [];
  el.innerHTML = `
    <div class="vb-entity-panel">
      <div class="vb-note">
        ${state?.pricingSource === "gestion"
          ? "Les montants viennent du parcours d'inscription externe. Vous pouvez masquer un tarif et adapter son titre, son badge ou son texte ici."
          : "Modifiez ici les tarifs affichés sur le site."}
      </div>
      ${pricing.map((p) => `
        <div class="vb-entity-card" data-card-kind="pricing" data-card-id="${escapeHtml(p.id)}">
          <div class="vb-entity-card-head">
            <div class="vb-entity-card-title">${escapeHtml(p.title)}</div>
            <div class="vb-entity-card-actions">
              <span class="vb-entity-chip">${Number(p.enabled ?? 1) === 1 ? "Visible" : "Masqué"}</span>
              ${p.badge ? `<span class="vb-badge-chip">${escapeHtml(p.badge || "")}</span>` : ""}
              <button class="vb-card-btn vb-card-btn--edit" type="button"
                data-edit-kind="pricing" data-edit-id="${escapeHtml(p.id)}">✎ Modifier</button>
            </div>
          </div>
          <div class="vb-entity-card-preview">
            <strong class="vb-price-label">${escapeHtml(p.price_label)}</strong>
            <span class="vb-entity-chip">${escapeHtml(p.description)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// ─── Mot de passe ─────────────────────────────────────────────

function renderPasswordPanel() {
  const el = document.getElementById("panel-password");
  if (!el) return;

  el.innerHTML = `
    <div class="vb-settings-panel">
      <div class="vb-settings-header">
        <div class="vb-settings-icon">🔒</div>
        <div>
          <h2 class="vb-settings-title">Mot de passe administrateur</h2>
          <p class="vb-settings-desc">Mettez à jour vos identifiants de connexion.</p>
        </div>
      </div>
      <div class="vb-fields-grid">
        <div class="vb-field">
          <label class="vb-field-label" for="pwd-current">Mot de passe actuel</label>
          <input id="pwd-current" name="currentPassword" class="vb-field-input" type="password" autocomplete="current-password">
        </div>
        <div class="vb-field">
          <label class="vb-field-label" for="pwd-next">Nouveau mot de passe</label>
          <input id="pwd-next" name="nextPassword" class="vb-field-input" type="password" autocomplete="new-password">
        </div>
      </div>
      <div class="vb-settings-footer">
        <button class="btn btn-red premium-btn" type="button" data-change-password>Mettre à jour</button>
      </div>
    </div>
  `;
}

// ─── Rendu global ─────────────────────────────────────────────

function renderAll() {
  if (!state) return;

  // Nom utilisateur
  const userEl = document.getElementById("admin-user");
  if (userEl) userEl.textContent = `${state.user?.display_name} · ${state.user?.email}`;

  // Dashboard
  renderDashboard();

  // Réglages
  SETTINGS_GROUPS.forEach((g) => renderSettingsPanel(g.id));

  // Entités
  renderSectionsTextPanel();
  renderEntityPanel("schedule", "schedule", state.schedule || [], SCHEDULE_FIELDS, "Ajouter un créneau");
  renderEntityPanel("team", "team", state.team || [], TEAM_FIELDS, "Ajouter un membre");
  renderEntityPanel("news", "news", state.news || [], NEWS_FIELDS, "Ajouter une actualité");
  renderEntityPanel("highlights", "highlights", state.highlights || [], HIGHLIGHTS_FIELDS, "Ajouter un temps fort");
  renderEntityPanel("gallery", "gallery", state.gallery || [], GALLERY_FIELDS, "Ajouter une image");
  renderEntityPanel("media", "media", state.media || [], MEDIA_FIELDS, "Ajouter un média");
  renderEntityPanel("links", "links", state.links || [], LINKS_FIELDS, "Ajouter un lien");
  renderEntityPanel("buttons", "buttons", state.customButtons || [], BUTTON_FIELDS, "Ajouter un bouton");
  renderEntityPanel("blocks", "blocks", state.customBlocks || [], BLOCK_FIELDS, "Ajouter un bloc");
  renderEntityPanel("resources", "resources", state.resources || [], RESOURCES_FIELDS, "Ajouter une ressource");
  renderEntityPanel("equipment", "equipment", state.equipment || [], EQUIPMENT_FIELDS, "Ajouter un équipement");
  renderEntityPanel("sponsors", "sponsors", state.sponsors || [], SPONSOR_PARTNER_FIELDS, "Ajouter un sponsor");
  renderEntityPanel("faq", "faq", state.faq || [], FAQ_FIELDS, "Ajouter une question");
  renderEntityPanel("testimonials", "testimonials", state.testimonials || [], TESTIMONIAL_FIELDS, "Ajouter un avis");

  renderMessagesPanel();
  renderPricingPanel();
  renderPasswordPanel();
  renderPreviewMeta();

  // Garder le panel actif
  setActivePanel(activePanel);
}

// ─── Chargement des données ───────────────────────────────────

async function loadAdmin() {
  state = await api("/api/admin/bootstrap", { method: "GET" });

  // Mapper la réponse API → siteSettings flat
  state.siteSettings = {
    club_name: state.site?.name,
    brand_primary: state.site?.brandPrimary,
    brand_secondary: state.site?.brandSecondary,
    site_logo_url: state.design?.logoUrl,
    favicon_url: state.design?.faviconUrl,
    site_public_url: state.sitePublicUrl,
    browser_title: state.site?.browserTitle,
    meta_description: state.meta?.description,
    meta_keywords: state.meta?.keywords,
    site_ambient_image: state.design?.siteAmbientImage,
    theme_primary_color: state.design?.primaryColor,
    theme_secondary_color: state.design?.secondaryColor,
    theme_heading_font: state.design?.headingFont,
    theme_body_font: state.design?.bodyFont,
    theme_nav_font: state.design?.navFont,
    theme_button_font: state.design?.buttonFont,
    theme_card_title_font: state.design?.cardTitleFont,
    theme_card_body_font: state.design?.cardBodyFont,
    nav_club_label: state.navigation?.clubLabel,
    nav_club_enabled: state.navigation?.clubEnabled ? "1" : "0",
    nav_schedule_label: state.navigation?.scheduleLabel,
    nav_schedule_enabled: state.navigation?.scheduleEnabled ? "1" : "0",
    nav_pricing_label: state.navigation?.pricingLabel,
    nav_pricing_enabled: state.navigation?.pricingEnabled ? "1" : "0",
    nav_contact_label: state.navigation?.contactLabel,
    nav_contact_enabled: state.navigation?.contactEnabled ? "1" : "0",
    nav_inscription_label: state.navigation?.inscriptionLabel,
    nav_inscription_href: state.navigation?.inscriptionHref,
    nav_inscription_enabled: state.navigation?.inscriptionEnabled ? "1" : "0",
    nav_calendar_label: state.navigation?.calendarLabel,
    nav_calendar_href: state.navigation?.calendarHref,
    nav_calendar_enabled: state.navigation?.calendarEnabled ? "1" : "0",
    nav_shop_label: state.navigation?.shopLabel,
    nav_shop_href: state.navigation?.shopHref,
    nav_shop_enabled: state.navigation?.shopEnabled ? "1" : "0",
    nav_membre_label: state.navigation?.membreLabel,
    nav_membre_href: state.navigation?.membreHref,
    nav_membre_enabled: state.navigation?.membreEnabled ? "1" : "0",
    quick_links_cta_label: state.labels?.quickLinkCta,
    contact_email: state.site?.email,
    contact_phone: state.site?.phone,
    contact_address: state.site?.address,
    club_story: state.story,
    story_intro: state.storyPanel?.intro,
    story_card_title: state.storyPanel?.cardTitle,
    story_note_label: state.storyPanel?.noteLabel,
    story_note_title: state.storyPanel?.noteTitle,
    story_note_body: state.storyPanel?.noteBody,
    hero_kicker: state.hero?.kicker,
    hero_title: state.hero?.title,
    hero_body: state.hero?.body,
    hero_background_image: state.design?.heroBackgroundImage,
    hero_link_inscription_label: state.hero?.utilityLinks?.[0]?.label,
    hero_link_inscription_href: state.hero?.utilityLinks?.[0]?.href,
    hero_link_inscription_enabled: state.hero?.utilityLinks?.[0]?.enabled ? "1" : "0",
    hero_link_calendar_label: state.hero?.utilityLinks?.[1]?.label,
    hero_link_calendar_href: state.hero?.utilityLinks?.[1]?.href,
    hero_link_calendar_enabled: state.hero?.utilityLinks?.[1]?.enabled ? "1" : "0",
    hero_link_shop_label: state.hero?.utilityLinks?.[2]?.label,
    hero_link_shop_href: state.hero?.utilityLinks?.[2]?.href,
    hero_link_shop_enabled: state.hero?.utilityLinks?.[2]?.enabled ? "1" : "0",
    announcement_badge: state.announcement?.badge,
    announcement_title: state.announcement?.title,
    announcement_body: state.announcement?.body,
    hero_primary_label: state.hero?.primaryLabel,
    hero_primary_href: state.hero?.primaryHref,
    hero_primary_enabled: state.hero?.primaryEnabled ? "1" : "0",
    hero_secondary_label: state.hero?.secondaryLabel,
    hero_secondary_href: state.hero?.secondaryHref,
    hero_secondary_enabled: state.hero?.secondaryEnabled ? "1" : "0",
    spotlight_intro: state.spotlight?.intro,
    spotlight_date: state.spotlight?.date,
    spotlight_title: state.spotlight?.title,
    spotlight_body: state.spotlight?.body,
    spotlight_background_image: state.design?.spotlightBackgroundImage,
    spotlight_cta_label: state.spotlight?.primaryLabel,
    spotlight_cta_href: state.spotlight?.primaryHref,
    spotlight_cta_enabled: state.spotlight?.primaryEnabled ? "1" : "0",
    spotlight_secondary_label: state.spotlight?.secondaryLabel,
    spotlight_secondary_href: state.spotlight?.secondaryHref,
    spotlight_secondary_enabled: state.spotlight?.secondaryEnabled ? "1" : "0",
    schedule_intro: state.scheduleIntro,
    team_intro: state.teamIntro,
    team_layout: state.teamLayout,
    pricing_intro_synced: state.pricingIntroSynced,
    pricing_intro_local: state.pricingIntroLocal,
    highlights_intro: state.highlightsIntro,
    gallery_intro: state.galleryIntro,
    resources_intro: state.resourcesIntro,
    equipment_intro: state.equipmentIntro,
    sponsors_intro: state.sponsorsIntro,
    news_intro: state.newsIntro,
    faq_intro: state.faqIntro,
    testimonials_intro: state.testimonialsIntro,
    google_reviews_enabled: state.googleReviews?.enabled ? "1" : "0",
    google_place_id: state.googleReviews?.placeId,
    google_place_query: state.googleReviews?.query,
    google_reviews_min_rating: state.googleReviews?.minRating,
    google_reviews_cta_label: state.googleReviews?.ctaLabel,
    google_reviews_cta_href: state.googleReviews?.ctaHref,
    sponsor_intro: state.sponsor?.intro,
    sponsor_title: state.sponsor?.title,
    sponsor_body: state.sponsor?.body,
    sponsor_cta_label: state.sponsor?.ctaLabel,
    sponsor_cta_href: state.sponsor?.ctaHref,
    sponsor_checkout_enabled: state.sponsor?.checkoutEnabled ? "1" : "0",
    sponsor_checkout_org_slug: state.sponsor?.checkoutOrganizationSlug,
    sponsor_checkout_item_name: state.sponsor?.checkoutItemName,
    sponsor_checkout_min_amount_eur: state.sponsor?.checkoutMinAmountEur,
    sponsor_checkout_suggested_amounts: (state.sponsor?.checkoutSuggestedAmounts || []).join(","),
    sponsor_amount_label: state.labels?.sponsorAmount,
    sponsor_first_name_label: state.labels?.sponsorFirstName,
    sponsor_last_name_label: state.labels?.sponsorLastName,
    sponsor_email_label: state.labels?.sponsorEmail,
    contact_intro: state.contactIntro,
    contact_map_embed_url: state.contactForm?.mapEmbedUrl,
    contact_details_title: state.contactForm?.detailsTitle,
    contact_email_title: state.labels?.contactEmailTitle,
    contact_phone_title: state.labels?.contactPhoneTitle,
    contact_address_title: state.labels?.contactAddressTitle,
    contact_form_title: state.contactForm?.formTitle,
    contact_name_label: state.contactForm?.nameLabel,
    contact_email_label: state.contactForm?.emailLabel,
    contact_phone_label: state.contactForm?.phoneLabel,
    contact_message_label: state.contactForm?.messageLabel,
    contact_submit_label: state.contactForm?.submitLabel,
    contact_map_unavailable_label: state.labels?.mapUnavailable,
    contact_map_title: state.labels?.contactMapTitle,
    inpi_note: state.inpiNote,
    footer_note: state.site?.footerNote,
    footer_legal: state.footer?.legal,
    footer_meta: state.footer?.meta,
    social_facebook_url: state.social?.facebookUrl,
    social_instagram_url: state.social?.instagramUrl,
    social_youtube_url: state.social?.youtubeUrl,
    social_tiktok_url: state.social?.tiktokUrl,
    social_whatsapp_url: state.social?.whatsappUrl,
  };

  renderAll();
  refreshSitePreview();
}

// ─── kindConfig ───────────────────────────────────────────────

function kindConfig(kind) {
  const map = {
    sections: { table: "landing_sections", items: state?.sections },
    schedule: { table: "schedule_slots", items: state?.schedule },
    team: { table: "team_members", items: state?.team },
    highlights: { table: "highlights", items: state?.highlights },
    gallery: { table: "gallery_items", items: state?.gallery },
    media: { table: "media_assets", items: state?.media },
    links: { table: "partner_links", items: state?.links },
    buttons: { table: "custom_buttons", items: state?.customButtons },
    blocks: { table: "custom_blocks", items: state?.customBlocks },
    resources: { table: "resource_cards", items: state?.resources },
    equipment: { table: "equipment_items", items: state?.equipment },
    sponsors: { table: "sponsor_partners", items: state?.sponsors },
    news: { table: "news_items", items: state?.news },
    faq: { table: "faq_items", items: state?.faq },
    testimonials: { table: "testimonials", items: state?.testimonials },
    pricing: { table: "pricing_plans", items: state?.pricing },
  };
  return map[kind];
}

// ─── Constructeur d'item vide ─────────────────────────────────

function buildNewItem(kind) {
  const id = crypto.randomUUID();
  const counts = {
    sections: (state?.sections || []).length,
    schedule: (state?.schedule || []).length,
    team: (state?.team || []).length,
    news: (state?.news || []).length,
    highlights: (state?.highlights || []).length,
    gallery: (state?.gallery || []).length,
    media: (state?.media || []).length,
    links: (state?.links || []).length,
    buttons: (state?.customButtons || []).length,
    blocks: (state?.customBlocks || []).length,
    resources: (state?.resources || []).length,
    equipment: (state?.equipment || []).length,
    sponsors: (state?.sponsors || []).length,
    faq: (state?.faq || []).length,
    testimonials: (state?.testimonials || []).length,
    pricing: (state?.pricing || []).length,
  };
  const order = (counts[kind] || 0) + 1;

  const defaults = {
    sections: { id, section_key: "new_section", title: "Nouvelle section", subtitle: "", enabled: 0, display_order: order },
    schedule: { id, day_label: "Jour", time_label: "Horaire", note: "", text_align: "left", display_order: order },
    team: { id, full_name: "Nouveau membre", role_label: "Rôle", belt_label: "", bio: "", image_url: "", text_align: "left", pyramid_level: "auto", display_order: order },
    news: { id, title: "Nouvelle actualité", body: "", date_label: "", badge: "", cta_label: "", cta_href: "", image_url: "", image_fit: "cover", text_align: "left", enabled: 1, display_order: order },
    highlights: { id, title: "Nouvel encart", body: "", badge: "", cta_label: "", cta_href: "", text_align: "left", display_order: order },
    gallery: { id, title: "Nouvelle image", image_url: "", alt_text: "", text_align: "left", display_order: order },
    media: { id, title: "Nouveau média", image_url: "", alt_text: "", display_order: order },
    links: { id, title: "Nouveau lien", href: "https://", cta_label: "Accéder", description: "", display_order: order },
    buttons: { id, label: "Nouveau bouton", href: "https://", placement: "hero", style: "red", enabled: 1, display_order: order },
    blocks: { id, title: "Nouveau bloc", body: "", image_url: "", image_fit: "cover", cta_label: "Ouvrir", cta_href: "", width_percent: 100, height_px: 360, text_align: "left", enabled: 1, display_order: order },
    resources: { id, title: "Nouvelle ressource", cta_label: "Ouvrir", cta_href: "https://", description: "", image_url: "", image_fit: "contain", text_align: "left", enabled: 1, display_order: order },
    equipment: { id, title: "Nouvel équipement", cta_label: "Voir", cta_href: "https://", description: "", image_url: "", image_fit: "cover", text_align: "left", enabled: 1, display_order: order },
    sponsors: { id, name: "Nouveau sponsor", description: "", website_url: "https://", cta_label: "Voir le site", logo_url: "", image_fit: "contain", featured: 0, text_align: "left", enabled: 1, display_order: order },
    faq: { id, question: "Nouvelle question", answer: "", text_align: "left", enabled: 1, display_order: order },
    testimonials: { id, author_name: "Nouvel avis", role_label: "", quote: "", image_url: "", image_fit: "cover", text_align: "left", enabled: 1, display_order: order },
    pricing: { id, title: "Nouveau tarif", price_label: "", description: "", badge: "", text_align: "left", enabled: 1, display_order: order },
  };
  return defaults[kind] || null;
}

function sectionAnchorForKind(kind) {
  const map = {
    schedule: "planning",
    team: "equipe",
    pricing: "tarifs",
    news: "actualites",
    highlights: "temps-forts",
    gallery: "galerie",
    media: "medias",
    links: "liens",
    buttons: "",
    blocks: "blocs",
    resources: "ressources",
    equipment: "equipement",
    sponsors: "sponsors",
    faq: "faq",
    testimonials: "avis",
    contact: "contact",
  };
  return map[kind] || "";
}

function openPublicSection(kind) {
  const anchor = sectionAnchorForKind(kind);
  const url = new URL(window.location.origin);
  if (anchor) url.hash = anchor;
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

async function duplicateItem(kind, id) {
  const config = kindConfig(kind);
  const source = (config?.items || []).find((item) => String(item.id) === String(id));
  if (!source) return;
  const copy = { ...source, id: crypto.randomUUID(), display_order: (config.items || []).length + 1 };
  if (copy.title) copy.title = `${copy.title} (copie)`;
  if (copy.name) copy.name = `${copy.name} (copie)`;
  if (copy.question) copy.question = `${copy.question} (copie)`;
  if (copy.author_name) copy.author_name = `${copy.author_name} (copie)`;
  await api("/api/admin/content", {
    method: "POST",
    body: JSON.stringify({ table: config.table, action: "upsert", values: copy }),
  });
}

// ─── Swap order ───────────────────────────────────────────────

async function swapOrder(kind, id, direction) {
  const config = kindConfig(kind);
  const items = [...(config.items || [])].sort((a, b) => Number(a.display_order) - Number(b.display_order));
  const index = items.findIndex((item) => String(item.id) === String(id));
  const otherIndex = index + Number(direction);
  if (index < 0 || otherIndex < 0 || otherIndex >= items.length) return;
  const current = items[index];
  const other = items[otherIndex];
  await api("/api/admin/content", {
    method: "POST",
    body: JSON.stringify({ table: config.table, action: "upsert", values: { id: current.id, display_order: other.display_order } }),
  });
  await api("/api/admin/content", {
    method: "POST",
    body: JSON.stringify({ table: config.table, action: "upsert", values: { id: other.id, display_order: current.display_order } }),
  });
  await loadAdmin();
}

// ─── Validation Google Maps ───────────────────────────────────

function validateGoogleMapsUrl(url) {
  if (!url) return true;
  if (url.startsWith("https://www.google.com/maps/embed")) return true;
  if (url.includes("google.com/maps") && !url.includes("/embed")) return false;
  return true;
}

// ─── Gestionnaire d'événements global ────────────────────────

document.addEventListener("click", async (event) => {
  const target = event.target;
  const button = target.closest("button, [data-panel-goto]");

  // ── Navigation sidebar
  if (target.closest(".vb-nav-item")) {
    const item = target.closest(".vb-nav-item");
    if (item.dataset.panel) setActivePanel(item.dataset.panel);
    return;
  }

  // ── Dashboard: goto panel
  if (button?.dataset.panelGoto) {
    setActivePanel(button.dataset.panelGoto);
    return;
  }

  if (!button) return;

  if (button.dataset.viewKind) {
    openPublicSection(button.dataset.viewKind);
    return;
  }

  if (button.dataset.moveKind && button.dataset.moveId && button.dataset.moveDirection) {
    try {
      await swapOrder(button.dataset.moveKind, button.dataset.moveId, button.dataset.moveDirection);
      showStatus("Ordre mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  if (button.dataset.duplicateKind && button.dataset.duplicateId) {
    try {
      await duplicateItem(button.dataset.duplicateKind, button.dataset.duplicateId);
      await loadAdmin();
      showStatus("Élément dupliqué.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Section toggle (checkbox)
  const toggle = target.closest("[data-section-toggle]");
  if (toggle && target.type === "checkbox") {
    const id = toggle.dataset.sectionToggle;
    const enabled = target.checked ? 1 : 0;
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: "landing_sections", action: "upsert", values: { id, enabled } }),
      });
      await loadAdmin();
      showStatus("Section mise à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Fermeture modales
  if (button.matches("[data-close-modal]")) {
    closeAllModals();
    return;
  }

  // ── Enregistrer un groupe de réglages
  if (button.dataset.saveSettingsGroup) {
    const groupId = button.dataset.saveSettingsGroup;
    const group = SETTINGS_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const panel = document.getElementById(`panel-settings-${groupId}`);
    if (!panel) return;

    // Validation Maps
    if (groupId === "contact") {
      const mapInput = panel.querySelector('[name="contact_map_embed_url"]');
      const mapUrl = (mapInput?.value || "").trim();
      if (mapUrl && !validateGoogleMapsUrl(mapUrl)) {
        showStatus("URL Google Maps invalide. Elle doit commencer par https://www.google.com/maps/embed");
        return;
      }
    }

    button.disabled = true;
    showStatus("Enregistrement…", false);
    try {
      for (const [key] of group.fields) {
        const input = panel.querySelector(`[name="${key}"]`);
        if (input) {
          await api("/api/admin/content", {
            method: "POST",
            body: JSON.stringify({ table: "site_settings", action: "upsert", values: { key, value: getSettingFieldValue(input) } }),
          });
        }
      }
      showStatus(`${group.title} enregistré.`, false);
      await loadAdmin();
    } catch (err) {
      showStatus(err.message || "Erreur");
    } finally {
      button.disabled = false;
    }
    return;
  }

  // ── Enregistrer anciens réglages globaux (compat admin-ui.js)
  if (button.matches("[data-save-settings]")) {
    return; // géré par admin-ui.js
  }

  // ── Badges : sauvegarder setting
  if (button.dataset.badgeSaveSetting) {
    const key = button.dataset.badgeSaveSetting;
    const input = document.querySelector(`[data-badge-setting="${key}"]`);
    if (!input) return;
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: "site_settings", action: "upsert", values: { key, value: input.value } }),
      });
      await loadAdmin();
      showStatus("Badge mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Badges : effacer setting
  if (button.dataset.badgeClearSetting) {
    const key = button.dataset.badgeClearSetting;
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: "site_settings", action: "upsert", values: { key, value: "" } }),
      });
      await loadAdmin();
      showStatus("Badge supprimé.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Badges : sauvegarder dynamique
  if (button.dataset.badgeSaveDynamic) {
    const id = button.dataset.badgeSaveDynamic;
    const kind = button.dataset.badgeSaveKind;
    const field = button.dataset.badgeSaveField;
    const input = document.querySelector(`[data-badge-id="${id}"][data-badge-field="${field}"]`);
    if (!input) return;
    const config = kindConfig(kind);
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: config.table, action: "upsert", values: { id, [field]: input.value } }),
      });
      await loadAdmin();
      showStatus("Badge mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Badges : effacer dynamique
  if (button.dataset.badgeClearDynamic) {
    const id = button.dataset.badgeClearDynamic;
    const kind = button.dataset.badgeClearKind;
    const field = button.dataset.badgeClearField;
    const config = kindConfig(kind);
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: config.table, action: "upsert", values: { id, [field]: "" } }),
      });
      await loadAdmin();
      showStatus("Badge supprimé.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Édition inline (bouton Modifier)
  if (button.dataset.editKind && button.dataset.editId) {
    const kind = button.dataset.editKind;
    const id = button.dataset.editId;
    const config = kindConfig(kind);
    const item = (config?.items || []).find((i) => String(i.id) === String(id));
    if (!item) return;

    const fieldMap = {
      schedule: SCHEDULE_FIELDS,
      sections: SECTION_TEXT_FIELDS,
      team: TEAM_FIELDS,
      news: NEWS_FIELDS,
      highlights: HIGHLIGHTS_FIELDS,
      gallery: GALLERY_FIELDS,
      media: MEDIA_FIELDS,
      links: LINKS_FIELDS,
      resources: RESOURCES_FIELDS,
      equipment: EQUIPMENT_FIELDS,
      sponsors: SPONSOR_PARTNER_FIELDS,
      faq: FAQ_FIELDS,
      testimonials: TESTIMONIAL_FIELDS,
      buttons: BUTTON_FIELDS,
      blocks: BLOCK_FIELDS,
      pricing: PRICING_FIELDS,
    };
    const fields = fieldMap[kind] || [];
    openEditModal({ kind, id, fields, values: item });
    return;
  }

  // ── Suppression
  if (button.matches("[data-delete]") && !button.matches("[data-save-settings]")) {
    const kind = button.dataset.delete;
    const id = button.dataset.id;
    if (kind && id) {
      pendingDelete = { kind, id };
      openModal("modal-delete");
    }
    return;
  }

  // ── Confirmer suppression
  if (button.matches("[data-confirm-delete]")) {
    if (!pendingDelete) return;
    try {
      const config = kindConfig(pendingDelete.kind);
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: config.table, action: "delete", id: pendingDelete.id }),
      });
      await loadAdmin();
      showStatus("Élément supprimé.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    } finally {
      pendingDelete = null;
      closeModal("modal-delete");
    }
    return;
  }

  // ── Ajouter élément
  if (button.dataset.add) {
    const kind = button.dataset.add;
    const config = kindConfig(kind);
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: config.table, action: "upsert", values: buildNewItem(kind) }),
      });
      await loadAdmin();
      showStatus("Élément ajouté.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Réordonner (modale)
  if (button.dataset.openOrder) {
    openOrderModal(button.dataset.openOrder);
    return;
  }

  // ── Sauvegarder ordre (modale)
  if (button.matches("[data-save-order]")) {
    if (!orderContext) return;
    const list = document.getElementById("order-list");
    const ids = Array.from(list.querySelectorAll(".premium-order-list-item")).map((el) => el.dataset.id);
    try {
      const config = kindConfig(orderContext.kind);
      await Promise.all(
        ids.map((id, index) =>
          api("/api/admin/content", {
            method: "POST",
            body: JSON.stringify({ table: config.table, action: "upsert", values: { id, display_order: index + 1 } }),
          })
        )
      );
      await loadAdmin();
      showStatus("Ordre mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    } finally {
      orderContext = null;
      closeModal("modal-order");
    }
    return;
  }

  // ── Sauvegarder modale d'édition
  if (button.matches("[data-save-modal]")) {
    const form = document.getElementById("modal-editor-form");
    if (!form) return;
    const kind = form.dataset.kind;
    const id = form.dataset.id;
    if (!kind || !id) return;
    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      data[input.name] = input.checked ? "1" : "0";
    });
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ table: kindConfig(kind).table, action: "upsert", values: { id, ...data } }),
      });
      await loadAdmin();
      closeModal("modal-editor");
      showStatus("Élément mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Export messages
  if (button.dataset.exportMessages !== undefined) {
    exportMessagesCSV();
    return;
  }

  // ── Statut message
  if (button.dataset.messageStatus) {
    try {
      await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ action: "mark-message", id: button.dataset.messageStatus, status: button.dataset.status }),
      });
      await loadAdmin();
      showStatus("Message mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Rafraîchir
  if (button.id === "refresh-button") {
    await loadAdmin();
    showStatus("Données rechargées.", false);
    return;
  }

  if (button.id === "preview-refresh-button") {
    refreshSitePreview();
    showStatus("Prévisualisation rechargée.", false);
    return;
  }

  // ── Déconnexion
  if (button.id === "logout-button") {
    try {
      await api("/api/auth/logout", { method: "POST", body: "{}" });
      window.location.reload();
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Changer mot de passe
  if (button.dataset.changePassword !== undefined) {
    const current = document.getElementById("pwd-current")?.value;
    const next = document.getElementById("pwd-next")?.value;
    try {
      await api("/api/auth/password", { method: "POST", body: JSON.stringify({ currentPassword: current, nextPassword: next }) });
      document.getElementById("pwd-current").value = "";
      document.getElementById("pwd-next").value = "";
      showStatus("Mot de passe mis à jour.", false);
    } catch (err) {
      showStatus(err.message || "Erreur");
    }
    return;
  }

  // ── Générer URL Maps
  if (button.id === "generate-map-url") {
    const address = prompt("Entrez l'adresse du club :");
    if (!address) return;
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
    showStatus("Google Maps ouvert. Cliquez « Partager » → « Intégrer une carte » → copiez l'URL src.", false);
    return;
  }
});

// ─── Modales ──────────────────────────────────────────────────

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function closeAllModals() {
  ["modal-editor", "modal-delete", "modal-upload", "modal-order"].forEach(closeModal);
}

function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image illisible."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file, maxSize = 1200, quality = 0.82) {
  if (!file.type.startsWith("image/")) throw new Error("Le fichier choisi n'est pas une image.");
  const image = await readFileAsImage(file);
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  // toBlob (octets réels) plutôt que toDataURL (chaîne base64) : l'image est
  // ensuite envoyée telle quelle à /api/admin/upload, pas gonflée de ~33%
  // par un encodage base64 inutile à ce stade.
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression de l'image impossible."))),
      "image/jpeg",
      quality,
    );
  });
}

// Envoie le Blob compressé à /api/admin/upload (R2, cf. src/index.ts) et
// renvoie l'URL courte à stocker dans le champ (ex: /api/images/uploads/...).
// Remplace l'ancien comportement qui stockait le data: URI base64 directement
// en base — cf. le commentaire au-dessus de handleAdminUpload côté worker.
async function uploadImageFile(blob) {
  return api("/api/admin/upload", {
    method: "POST",
    headers: {}, // pas de JSON ici : laisse le navigateur poser Content-Type depuis le Blob
    body: blob,
  });
}

function openEditModal(config) {
  const form = document.getElementById("modal-editor-form");
  if (!form) return;
  form.innerHTML = "";

  config.fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.className = "premium-field";
    const span = document.createElement("span");
    span.textContent = field.label;
    wrapper.appendChild(span);

    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else if (field.type === "select") {
      input = document.createElement("select");
      (field.options || []).forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.value = "1";
      input.checked = isTruthy(config.values[field.key]);
    } else if (field.type === "image") {
      wrapper.classList.add("premium-field--image");
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = "URL de l'image ou fichier ci-dessous";
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
    }
    input.name = field.key;
    if (field.type !== "checkbox") input.value = config.values[field.key] ?? "";
    wrapper.appendChild(input);

    if (field.type === "image") {
      const tools = document.createElement("div");
      tools.className = "premium-image-tools";

      const preview = document.createElement("img");
      preview.className = "premium-image-preview";
      preview.alt = "";
      preview.hidden = !input.value;
      if (input.value) preview.src = input.value;

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "premium-image-file";
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        fileInput.disabled = true;
        try {
          showStatus("Compression puis envoi de l'image…", false);
          const blob = await compressImageFile(file);
          const { url } = await uploadImageFile(blob);
          input.value = url;
          preview.src = url;
          preview.hidden = false;
          showStatus("Image envoyée et prête à enregistrer.", false);
        } catch (error) {
          showStatus(error instanceof Error ? error.message : "Image impossible à envoyer.");
        } finally {
          fileInput.disabled = false;
          fileInput.value = "";
        }
      });

      input.addEventListener("input", () => {
        preview.hidden = !input.value;
        if (input.value) preview.src = input.value;
      });

      tools.appendChild(preview);
      tools.appendChild(fileInput);
      wrapper.appendChild(tools);
    }

    form.appendChild(wrapper);
  });

  form.dataset.kind = config.kind;
  form.dataset.id = config.id;
  openModal("modal-editor");
}

function openOrderModal(kind) {
  const config = kindConfig(kind);
  if (!config) return;
  orderContext = { kind };

  const list = document.getElementById("order-list");
  list.innerHTML = "";

  const items = [...(config.items || [])].sort(
    (a, b) => Number(a.display_order) - Number(b.display_order)
  );

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "premium-order-list-item";
    row.draggable = true;
    row.dataset.id = item.id;

    const handle = document.createElement("span");
    handle.className = "handle";
    handle.textContent = "⋮⋮";

    const label = document.createElement("span");
    label.textContent = item.title || item.full_name || item.day_label || "Élément";

    row.appendChild(handle);
    row.appendChild(label);
    list.appendChild(row);
  });

  openModal("modal-order");
}

// Drag & drop modale d'ordre
let dragItem = null;

document.addEventListener("dragstart", (event) => {
  const row = event.target.closest(".premium-order-list-item");
  if (!row) return;
  dragItem = row;
  event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragover", (event) => {
  if (!dragItem) return;
  const row = event.target.closest(".premium-order-list-item");
  if (!row || row === dragItem) return;
  event.preventDefault();
  const list = row.parentElement;
  const rect = row.getBoundingClientRect();
  const before = event.clientY < rect.top + rect.height / 2;
  list.insertBefore(dragItem, before ? row : row.nextSibling);
});

document.addEventListener("dragend", () => { dragItem = null; });

// Preview Maps en temps réel
document.addEventListener("input", (event) => {
  if (event.target.name === "contact_map_embed_url") {
    const iframe = document.getElementById("map-preview");
    if (iframe) iframe.src = safeHref(event.target.value);
  }
});

// ─── Login ────────────────────────────────────────────────────

document.getElementById("login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("login-status");
  if (status) status.textContent = "Connexion…";
  try {
    const formData = new FormData(event.currentTarget);
    await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(formData.entries())) });
    document.getElementById("login-screen").hidden = true;
    document.getElementById("admin-app").hidden = false;
    await loadAdmin();
    if (status) status.textContent = "";
  } catch (err) {
    if (status) status.textContent = err.message || "Identifiants incorrects";
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await api("/api/auth/session", { method: "GET" });
    document.getElementById("login-screen").hidden = true;
    document.getElementById("admin-app").hidden = false;
    await loadAdmin();
  } catch {
    document.getElementById("login-screen").hidden = false;
  }
});
