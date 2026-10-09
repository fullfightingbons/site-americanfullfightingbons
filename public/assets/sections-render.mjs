/**
 * Fonctions de rendu HTML "pures" : elles prennent des données en entrée et
 * retournent des chaînes HTML, sans jamais toucher au DOM (pas de
 * `document`, pas de `window`). Ça permet de les exécuter aussi bien dans le
 * navigateur (site.js) que côté serveur, dans le Worker (src/index.ts), pour
 * générer le HTML de la page d'accueil directement dans la réponse (SSR) —
 * important pour que les moteurs de recherche et les crawlers de revue
 * (Google AdSense, etc.) voient le contenu réel sans avoir à exécuter de JS.
 *
 * Toute modification du rendu d'une section doit se faire ici, pas dans une
 * copie dans site.js ou dans index.ts.
 */

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Cloudflare Image Transformations ──────────────────────────
// Contrairement à boutique/calendrier/gestion, les image_url de ce site
// peuvent être n'importe quelle URL collée par un·e admin (pas forcément
// hébergée par le club). On ne transforme donc QUE les chemins same-zone
// ou les sous-domaines *.americanfullfightingbons.fr (zone Cloudflare
// commune) ; toute autre origine (Unsplash, etc.) reste inchangée pour ne
// jamais casser une image existante. Fonction pure (pas de window/document)
// car ce module tourne aussi côté Worker en SSR.
function isOwnZoneImage(url) {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
    return host === "americanfullfightingbons.fr" || host.endsWith(".americanfullfightingbons.fr");
  } catch {
    return false;
  }
}
export function cfImageSrcset(url, widths) {
  if (!isOwnZoneImage(url)) return null;
  const u = new URL(url, "https://americanfullfightingbons.fr");
  const prefix = url.startsWith("/") ? "" : u.origin;
  return widths
    .map((w) => `${prefix}/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,width=${w}${u.pathname}${u.search} ${w}w`)
    .join(", ");
}

/**
 * Neutralise les schémas d'URL dangereux (javascript:, data:, vbscript:...)
 * dans les liens éditables via le Visual Builder admin. escapeHtml() protège
 * contre l'injection de balises/attributs, mais pas contre un schéma
 * d'URI malveillant glissé dans un href par ailleurs syntaxiquement valide
 * (ex: href="javascript:fetch(...)"). On n'autorise que http(s), mailto,
 * tel, ou les chemins relatifs/ancres sans schéma explicite.
 */
export function safeHref(value) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return v;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return v; // pas de schéma → relatif, OK
  return "#"; // schéma non reconnu (javascript:, data:, vbscript:, etc.)
}

export function imageFitClass(value, fallback = "cover") {
  return String(value || fallback) === "contain" ? "is-contain" : "is-cover";
}

export function textAlignClass(value) {
  const align = String(value || "").toLowerCase();
  if (align === "center") return " text-center";
  if (align === "right") return " text-right";
  return "";
}

export function visibleButtons(data, placement) {
  return (data.customButtons || [])
    .filter((item) => Number(item.enabled) === 1 && item.placement === placement && item.label && item.href)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
}

export function renderCustomButton(item, fallbackClass = "btn btn-dark") {
  const className = item.style === "red" ? "btn btn-red" : item.style === "link" ? "utility-link" : fallbackClass;
  return `<a class="${escapeHtml(className)}" href="${escapeHtml(safeHref(item.href))}">${escapeHtml(item.label)}</a>`;
}

export function renderTopLinksHtml(data) {
  const links = data.links || [];
  const visibleLinks = links.filter((item) => !/gestion|admin/i.test(String(item.title || ""))).slice(0, 3);
  return visibleLinks
    .map(
      (item) => `
      <article class="quick-link-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description)}</p>
        <a href="${escapeHtml(safeHref(item.href))}">${escapeHtml(item.cta_label || data.labels?.quickLinkCta || "Accéder")}</a>
      </article>
    `
    )
    .concat(
      visibleButtons(data, "quick").map(
        (item) => `
      <article class="quick-link-card">
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.href)}</p>
        <a href="${escapeHtml(safeHref(item.href))}">${escapeHtml(item.label)}</a>
      </article>
    `
      )
    )
    .join("");
}

export function renderSocialLinksHtml(data) {
  const items = [
    { label: "Facebook", href: data.social?.facebookUrl },
    { label: "Instagram", href: data.social?.instagramUrl },
    { label: "YouTube", href: data.social?.youtubeUrl },
    { label: "TikTok", href: data.social?.tiktokUrl },
    { label: "WhatsApp", href: data.social?.whatsappUrl },
  ].filter((item) => item.href);
  return items
    .map((item) => `<a class="footer-social-link" href="${escapeHtml(safeHref(item.href))}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`)
    .join("");
}

export function renderHeroStatsHtml(data) {
  const scheduleCount = (data.schedule || []).length;
  const teamCount = (data.team || []).length;
  const sponsorCount = (data.sponsors || []).filter((item) => Number(item.enabled ?? 1) === 1).length;
  const items = [
    scheduleCount ? { value: scheduleCount, label: scheduleCount > 1 ? "créneaux semaine" : "créneau semaine" } : null,
    teamCount ? { value: teamCount, label: teamCount > 1 ? "encadrants" : "encadrant" } : null,
    { value: "13+", label: "ans et adultes" },
    sponsorCount ? { value: sponsorCount, label: sponsorCount > 1 ? "partenaires" : "partenaire" } : null,
  ].filter(Boolean).slice(0, 4);
  return items.map((item) => `<div class="hero-stat"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join("");
}

export function buildJsonLd(data, publicUrl) {
  const sameAs = [
    data.social?.facebookUrl,
    data.social?.instagramUrl,
    data.social?.youtubeUrl,
    data.social?.tiktokUrl,
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: data.site?.name || "American Full Fighting Bons en Chablais",
    alternateName: data.site?.brandPrimary || "American Full Fighting",
    url: publicUrl,
    logo: data.design?.logoUrl || `${publicUrl}/assets/logo-affbc.png`,
    image: data.design?.heroBackgroundImage || data.design?.logoUrl || `${publicUrl}/assets/logo-affbc.png`,
    description: data.meta?.description || "",
    email: data.site?.email || undefined,
    telephone: data.site?.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.site?.address || "15 place Henri Boucher, 74890 Bons-en-Chablais",
      addressLocality: "Bons-en-Chablais",
      postalCode: "74890",
      addressCountry: "FR",
    },
    sport: ["Full contact", "Boxe américaine", "Kick boxing"],
    sameAs,
  };
}

function renderStorySection(data, section) {
  return `
    <section id="club" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Le club")}</div>
          <h2>${escapeHtml(section.subtitle || "Un cadre sérieux, un esprit collectif, une pratique accessible.")}</h2>
        </div>
        <p>${escapeHtml(data.storyPanel?.intro || "American Full Fighting Bons en Chablais réunit apprentissage technique, intensité progressive et esprit de groupe dans une ambiance encadrée.")}</p>
      </div>
      <div class="story-grid">
        <article class="story-card">
          <h3>${escapeHtml(data.storyPanel?.cardTitle || "Le club")}</h3>
          <p>${escapeHtml(data.story)}</p>
        </article>
        <article class="story-card is-accent">
          <div class="story-note">${escapeHtml(data.storyPanel?.noteLabel || "Repères")}</div>
          <h3>${escapeHtml(data.storyPanel?.noteTitle || "Pour qui ?")}</h3>
          <p>${escapeHtml(data.storyPanel?.noteBody || "Cours mixtes, progression suivie, objectifs clairs et séances pensées pour développer technique, condition physique et confiance.")}</p>
        </article>
      </div>
    </section>
  `;
}

/**
 * Formate une date d'évènement calendrier ("2026-10-07" + "19:00") en texte
 * court lisible ("mer. 7 oct. · 19:00"). Fonction pure (pas de fetch, pas de
 * DOM) : appelée aussi bien côté Worker (SSR) que côté navigateur.
 */
function formatEventDateFr(dateStart, timeStart) {
  try {
    const d = new Date(dateStart + (timeStart ? `T${timeStart}` : "T00:00:00"));
    const formatted = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    return timeStart ? `${formatted} · ${timeStart}` : formatted;
  } catch {
    return dateStart;
  }
}

function renderUpcomingEventsSection(data, section, opts = {}) {
  const events = data.upcomingEvents || [];
  const cta = data.upcomingEventsCta || {};
  // Les cartes individuelles pointent toujours vers le calendrier (source
  // des évènements), même si le lien du bouton "voir tout" est personnalisé
  // dans l'admin vers une autre page.
  const calendarHref = "https://calendrier.americanfullfightingbons.fr/";
  const listHtml = events.length === 0
    ? `<p class="upcoming-events-empty">Le calendrier se remplit au fil de la saison — <a href="${escapeHtml(calendarHref)}">consultez-le directement</a> pour ne rien manquer.</p>`
    : events
        .map((ev) => {
          const srcset = ev.poster_url ? cfImageSrcset(ev.poster_url, [300, 600]) : null;
          // Si aucune affiche n'est renseignée dans le calendrier, on affiche
          // le médaillon de repli (gant). Si une affiche EST renseignée mais
          // que le fichier ne charge pas (supprimé, lien cassé...), onerror
          // bascule sur le même médaillon plutôt que de laisser un cadre vide.
          const posterHtml = ev.poster_url
            ? `<img class="upcoming-event-poster" src="${escapeHtml(ev.poster_url)}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="300px"` : ""} alt="" loading="lazy" decoding="async" onerror="this.outerHTML='&lt;div class=&quot;upcoming-event-poster upcoming-event-poster-fallback&quot; aria-hidden=&quot;true&quot;&gt;🥊&lt;/div&gt;'">`
            : `<div class="upcoming-event-poster upcoming-event-poster-fallback" aria-hidden="true">🥊</div>`;
          const priceTxt = ev.price && Number(ev.price) > 0 ? `${Number(ev.price).toFixed(0)} €` : "Gratuit";
          const complet = ev.status === "complet";
          return `<a class="upcoming-event-card" href="${escapeHtml(calendarHref)}">
            ${posterHtml}
            <div class="upcoming-event-body">
              <div class="upcoming-event-date">${escapeHtml(formatEventDateFr(ev.date_start, ev.time_start))}</div>
              <h3 class="upcoming-event-title">${escapeHtml(ev.title)}</h3>
              ${ev.sub ? `<p class="upcoming-event-sub">${escapeHtml(ev.sub)}</p>` : ""}
              <div class="upcoming-event-meta">
                ${ev.lieu ? `<span>${escapeHtml(ev.lieu)}</span>` : ""}
                <span class="upcoming-event-price ${complet ? "upcoming-event-complet" : ""}">${complet ? "Complet" : priceTxt}</span>
              </div>
            </div>
          </a>`;
        })
        .join("\n");

  // En mode "compact" (accolé à "À la une"), la section n'a plus sa propre
  // largeur max / son propre espacement de page : ceux-ci sont portés par
  // le conteneur .section-duo qui l'englobe. Voir renderDuoSection.
  return `
    <section id="upcoming-events" class="${opts.compact ? "upcoming-events" : "section-shell upcoming-events"}">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Agenda du club")}</div>
          <h2>${escapeHtml(section.subtitle || "Prochainement au club")}</h2>
        </div>
        <a href="${escapeHtml(safeHref(cta.href || "https://calendrier.americanfullfightingbons.fr/"))}" class="upcoming-events-all">${escapeHtml(cta.label || "Voir tout le calendrier →")}</a>
      </div>
      <div class="upcoming-events-grid">${listHtml}</div>
    </section>
  `;
}

function renderSpotlightSection(data, section, opts = {}) {
  return `
    <section id="a-la-une" class="${opts.compact ? "" : "section-shell"}">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "À la une")}</div>
          <h2>${escapeHtml(section.subtitle || "Stage, actualité ou message fort du club.")}</h2>
        </div>
        <p>${escapeHtml(data.spotlight?.intro || "Les rendez-vous importants de la saison sont mis en avant ici pour rester visibles au premier coup d'oeil.")}</p>
      </div>
      <article class="spotlight-card">
        <div class="spotlight-content">
          <div class="spotlight-date">${escapeHtml(data.spotlight?.date)}</div>
          <h3>${escapeHtml(data.spotlight?.title)}</h3>
          <p>${escapeHtml(data.spotlight?.body)}</p>
          <div class="spotlight-actions">
            ${data.spotlight?.primaryEnabled !== false && data.spotlight?.primaryHref ? `<a class="btn btn-red" href="${escapeHtml(safeHref(data.spotlight.primaryHref))}">${escapeHtml(data.spotlight.primaryLabel || "Ouvrir")}</a>` : ""}
            ${data.spotlight?.secondaryEnabled !== false && data.spotlight?.secondaryHref ? `<a class="btn btn-dark" href="${escapeHtml(safeHref(data.spotlight.secondaryHref))}">${escapeHtml(data.spotlight.secondaryLabel || "Ouvrir")}</a>` : ""}
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderScheduleSection(data, section) {
  return `
    <section id="planning" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Planning")}</div>
          <h2>${escapeHtml(section.subtitle || "Les séances de la semaine")}</h2>
        </div>
        <p>${escapeHtml(data.scheduleIntro || "Des créneaux réguliers pour installer de bons repères techniques et physiques tout au long de la semaine.")}</p>
      </div>
      <div class="schedule-grid">
        ${(data.schedule || [])
          .map(
            (item) => `
          <article class="schedule-card${textAlignClass(item.text_align)}">
            <div class="meta">${escapeHtml(item.day_label)}</div>
            <h3>${escapeHtml(item.time_label)}</h3>
            <p>${escapeHtml(item.note)}</p>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

// ── Équipe : présentation pyramidale ───────────────────────────────────
// Niveau 1 (sommet) : président(e). Niveau 2 (milieu) : vice-présidents,
// secrétaires, trésoriers, suppléants. Niveau 3 (base) : tous les autres
// (assistants, coachs…). Le niveau se déduit du rôle, sauf si l'admin l'a
// forcé via `pyramid_level` ('sommet' | 'milieu' | 'base').
const TEAM_TIER_LABELS = { 1: "Présidence", 2: "Bureau", 3: "Encadrement" };

function normalizeRole(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function teamTier(item) {
  const forced = { sommet: 1, milieu: 2, base: 3 }[normalizeRole(item.pyramid_level).trim()];
  if (forced) return forced;
  const role = normalizeRole(item.role_label);
  if (/\bvice\b/.test(role)) return 2;
  if (/\bpresident/.test(role)) return 1;
  if (/secretaire|tresorier|suppleant/.test(role)) return 2;
  return 3;
}

function renderTeamCard(item, tier) {
  return `
          <article class="team-card team-card--tier${tier}${textAlignClass(item.text_align)}">
            ${item.image_url ? `<img class="team-photo" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [200,400]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [200,400]))}" sizes="200px"` : ""} alt="${escapeHtml(item.full_name)}" loading="lazy" decoding="async">` : ""}
            <div class="meta">${escapeHtml(item.role_label)}</div>
            <h3>${escapeHtml(item.full_name)}</h3>
            <div class="belt">${escapeHtml(item.belt_label)}</div>
            <p>${escapeHtml(item.bio)}</p>
          </article>
        `;
}

function renderTeamGrid(members) {
  return `
      <div class="team-grid">
        ${members.map((item) => renderTeamCard(item, teamTier(item))).join("")}
      </div>`;
}

function renderTeamPyramid(tiers) {
  return `
      <div class="team-pyramid" role="group" aria-label="Organisation de l'équipe">
        ${[1, 2, 3]
          .filter((tier) => tiers[tier].length)
          .map(
            (tier) => `
        <div class="team-pyramid-tier team-pyramid-tier--${tier}" data-tier="${tier}" aria-label="${escapeHtml(TEAM_TIER_LABELS[tier])}">
          ${tiers[tier].map((item) => renderTeamCard(item, tier)).join("")}
        </div>`
          )
          .join("")}
      </div>`;
}

function renderTeamSection(data, section) {
  const members = data.team || [];
  const tiers = { 1: [], 2: [], 3: [] };
  members.forEach((item) => tiers[teamTier(item)].push(item));
  // Pyramide seulement si elle a au moins deux étages ; sinon la grille d'origine.
  const filledTiers = [1, 2, 3].filter((tier) => tiers[tier].length).length;
  const usePyramid = data.teamLayout !== "grid" && filledTiers >= 2;
  return `
    <section id="equipe" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Équipe")}</div>
          <h2>${escapeHtml(section.subtitle || "Encadrement et progression")}</h2>
        </div>
        <p>${escapeHtml(data.teamIntro || "Un encadrement identifié, présent sur les séances et engagé dans la progression de chaque pratiquant.")}</p>
      </div>
      ${usePyramid ? renderTeamPyramid(tiers) : renderTeamGrid(members)}
    </section>
  `;
}

function renderPricingSection(data, section) {
  const syncLabel = data.pricingSource === "gestion"
    ? (data.pricingIntroSynced || "Tarifs alignés avec l'inscription en ligne.")
    : (data.pricingIntroLocal || "Tarifs actuellement affichés par le club.");
  return `
    <section id="tarifs" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Tarifs")}</div>
          <h2>${escapeHtml(section.subtitle || "Tarifs et informations utiles")}</h2>
        </div>
        <p>${escapeHtml(syncLabel)}.</p>
      </div>
      <div class="pricing-grid">
        ${(data.pricing || [])
          .filter((item) => Number(item.enabled ?? 1) === 1)
          .map(
            (item) => `
          <article class="pricing-card${textAlignClass(item.text_align)}">
            <div class="meta">${escapeHtml(item.badge || "")}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="price">${escapeHtml(item.price_label)}</div>
            <p>${escapeHtml(item.description)}</p>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderHighlightsSection(data, section) {
  return `
    <section id="temps-forts" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Temps forts")}</div>
          <h2>${escapeHtml(section.subtitle || "Stages, équipement, progression")}</h2>
        </div>
        <p>${escapeHtml(data.highlightsIntro || "Stages, matériel, progression et moments clés de la saison restent accessibles sans alourdir la navigation.")}</p>
      </div>
      <div class="highlights-grid">
        ${(data.highlights || [])
          .map(
            (item) => `
          <article class="highlight-card${textAlignClass(item.text_align)}">
            <div class="meta">${escapeHtml(item.badge || "")}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.body)}</p>
            ${item.cta_href ? `<a class="btn btn-dark" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : ""}
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderGallerySection(data, section) {
  const items = data.gallery || [];
  return `
    <section id="galerie" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Galerie")}</div>
          <h2>${escapeHtml(section.subtitle || "Visuels et ambiance du club")}</h2>
        </div>
        <p>${escapeHtml(data.galleryIntro || "Quelques images pour restituer l'ambiance des entraînements, des stages et de la vie du club.")}</p>
      </div>
      <div class="gallery-carousel" data-carousel="gallery">
        <div class="gallery-carousel-viewport">
          <div class="gallery-carousel-track">
        ${items
          .map(
            (item, index) => `
          <article class="gallery-slide" data-slide-index="${index}">
            <div class="gallery-card${textAlignClass(item.text_align)}">
              <img src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [800,1200,1600]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [800,1200,1600]))}" sizes="100vw"` : ""} alt="${escapeHtml(item.alt_text || item.title)}" loading="lazy" decoding="async">
              <div class="gallery-card-copy">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.alt_text || "")}</p>
              </div>
            </div>
          </article>
        `
          )
          .join("")}
          </div>
        </div>
        ${items.length > 1 ? `
        <div class="gallery-carousel-controls">
          <button class="gallery-nav" type="button" data-gallery-prev aria-label="Image précédente">←</button>
          <div class="gallery-dots">
            ${items.map((_, index) => `<button class="gallery-dot${index === 0 ? " is-active" : ""}" type="button" data-gallery-dot="${index}" aria-label="Aller à l'image ${index + 1}"></button>`).join("")}
          </div>
          <button class="gallery-nav" type="button" data-gallery-next aria-label="Image suivante">→</button>
        </div>` : ""}
      </div>
    </section>
  `;
}

function renderNewsSection(data, section) {
  const news = (data.news || [])
    .filter((item) => Number(item.enabled ?? 1) === 1)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  return `
    <section id="actualites" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Actualités")}</div>
          <h2>${escapeHtml(section.subtitle || "Les nouvelles du club")}</h2>
        </div>
        <p>${escapeHtml(data.newsIntro || "Les informations récentes du club restent visibles ici.")}</p>
      </div>
      <div class="news-grid">
        ${news.map((item) => `
          <article class="news-card${textAlignClass(item.text_align)}">
            ${item.image_url ? `<img class="card-media ${imageFitClass(item.image_fit)}" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [400,800]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [400,800]))}" sizes="(max-width: 640px) 100vw, 400px"` : ""} alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ""}
            <div class="meta">${escapeHtml(item.badge || item.date_label || "")}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.body || "")}</p>
            ${item.cta_href ? `<a class="cta" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFaqSection(data, section) {
  const items = (data.faq || [])
    .filter((item) => Number(item.enabled ?? 1) === 1)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  return `
    <section id="faq" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "FAQ")}</div>
          <h2>${escapeHtml(section.subtitle || "Questions fréquentes")}</h2>
        </div>
        <p>${escapeHtml(data.faqIntro || "Les réponses aux questions les plus courantes avant de venir au club.")}</p>
      </div>
      <div class="faq-grid">
        ${items.map((item, index) => `
          <details class="faq-card${textAlignClass(item.text_align)}"${index === 0 ? " open" : ""}>
            <summary>${escapeHtml(item.question)}</summary>
            <p>${escapeHtml(item.answer || "")}</p>
          </details>
        `).join("")}
      </div>
    </section>
  `;
}

// ── Avis : mur en colonnes (masonry) ───────────────────────────────────
// Cartes légères et de hauteur libre, réparties en colonnes équilibrées : le
// rythme s'adapte à la longueur de chaque avis au lieu d'une grille uniforme
// de gros blocs. 1 avis → 1 colonne centrée ; 2 ou 4 → 2 colonnes ; sinon 3.
// La répartition est calculée ici (SSR) : chaque avis rejoint la colonne la
// moins haute selon une estimation de sa hauteur (longueur du texte), ce qui
// garantit des colonnes équilibrées sans dépendre du moteur de colonnes CSS.
// Sur tablette/mobile les colonnes disparaissent (display:contents) et l'ordre
// d'origine est rétabli via la variable --i.
function testimonialColumns(count) {
  if (count <= 1) return 1;
  if (count === 2 || count === 4) return 2;
  return 3;
}

function renderTestimonialCard(item, index) {
  const name = String(item.author_name || "");
  const isGoogle = item.source === "google";
  const rating = Math.max(0, Math.min(5, Math.round(Number(item.rating) || 0)));
  const avatar = item.image_url
    ? `<img class="testimonial-photo ${imageFitClass(item.image_fit)}" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [100,200]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [100,200]))}" sizes="48px"` : ""} alt="${escapeHtml(name)}" width="48" height="48" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : `<span class="testimonial-photo testimonial-photo--empty" aria-hidden="true">${escapeHtml(name.trim().charAt(0).toUpperCase() || "★")}</span>`;
  const stars = isGoogle && rating
    ? `<span class="testimonial-stars" role="img" aria-label="Note : ${rating} sur 5">${"★".repeat(rating)}</span>`
    : "";
  const subline = isGoogle
    ? [stars, "Google", item.relative_time ? escapeHtml(item.relative_time) : ""].filter(Boolean)
    : [item.role_label ? escapeHtml(item.role_label) : ""].filter(Boolean);
  return `
          <article class="testimonial-card${textAlignClass(item.text_align)}" style="--i:${index}">
            <div class="testimonial-head">
              ${avatar}
              <div class="testimonial-id">
                <h3>${escapeHtml(name)}</h3>
                ${subline.length ? `<div class="testimonial-meta">${subline.join('<span class="testimonial-dot" aria-hidden="true"> · </span>')}</div>` : ""}
              </div>
            </div>
            <blockquote class="quote">${escapeHtml(item.quote || "")}</blockquote>
          </article>
        `;
}

function renderTestimonialColumns(items) {
  const count = testimonialColumns(items.length);
  const charsPerLine = count >= 3 ? 36 : 52;
  const columns = Array.from({ length: count }, () => ({ height: 0, html: [] }));
  items.forEach((item, index) => {
    const lines = Math.max(1, Math.ceil(String(item.quote || "").length / charsPerLine));
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best), columns[0]);
    shortest.height += 150 + lines * 26;
    shortest.html.push(renderTestimonialCard(item, index));
  });
  return `<div class="testimonials-grid testimonials-grid--${count}">${columns
    .map((column) => `<div class="testimonials-col">${column.html.join("")}</div>`)
    .join("")}</div>`;
}

function renderTestimonialsSection(data, section) {
  const items = (data.testimonials || [])
    .filter((item) => Number(item.enabled ?? 1) === 1)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  return `
    <section id="avis" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Avis")}</div>
          <h2>${escapeHtml(section.subtitle || "Ils parlent du club")}</h2>
        </div>
        <p>${escapeHtml(data.testimonialsIntro || "Quelques retours de pratiquants et proches du club.")}</p>
      </div>
      ${renderTestimonialColumns(items)}
      ${data.googleReviews?.source === "google" && data.googleReviews?.ctaHref ? `
        <div class="section-actions">
          <a class="btn btn-dark" href="${escapeHtml(safeHref(data.googleReviews.ctaHref))}" target="_blank" rel="noreferrer">${escapeHtml(data.googleReviews.ctaLabel || "Voir les avis Google")}</a>
        </div>
      ` : ""}
    </section>
  `;
}

function renderResourcesSection(data, section) {
  return `
    <section id="ressources" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Membre actif")}</div>
          <h2>${escapeHtml(section.subtitle || "Accès utiles pour la saison")}</h2>
        </div>
        <p>${escapeHtml(data.resourcesIntro || "")}</p>
      </div>
      <div class="resource-grid">
        ${(data.resources || [])
          .filter((item) => Number(item.enabled ?? 1) === 1)
          .map(
            (item) => `
          <article class="resource-card${textAlignClass(item.text_align)}">
            ${item.image_url ? `<img class="card-media ${imageFitClass(item.image_fit, "contain")}" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [400,800]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [400,800]))}" sizes="(max-width: 640px) 100vw, 400px"` : ""} alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ""}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            ${item.cta_href ? `<a class="cta" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : ""}
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

// ── Disposition « étoile » partagée (sponsors, équipement) ────────────────────
// Un élément central (logo du club, sac de sport…) et des satellites reliés par
// un rayon. Au-delà de STAR_MAX satellites, les suivants sont listés sous
// l'étoile pour que l'orbite reste lisible.
const STAR_MAX = 10;
const STAR_DENSE_FROM = 9;

function starAngles(count) {
  if (count === 1) return [90];
  if (count === 2) return [270, 90];
  return Array.from({ length: count }, (_, index) => (360 / count) * index);
}

function starGeometry(count, { tall = false, height: customHeight = 0 } = {}) {
  const dense = count >= STAR_DENSE_FROM;
  const compact = count <= 2;

  // Repère commun au SVG (rayons) et aux nœuds HTML (positions en %).
  // `tall` : étoile plus haute pour des cartes plus longues (équipement).
  const width = 1000;
  const height = compact ? 520 : customHeight || (tall ? 1000 : 900);
  const cx = width / 2;
  const cy = height / 2;
  const rx = dense ? 388 : 372;
  // Hauteur personnalisée : l'orbite garde la marge nécessaire pour la demi-hauteur d'une carte.
  const ry = compact ? 0 : customHeight ? customHeight / 2 - 165 : tall || dense ? 345 : 335;

  const points = starAngles(count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    const x = cx + rx * Math.sin(rad);
    const y = cy - ry * Math.cos(rad);
    return { x: ((x / width) * 100).toFixed(2), y: ((y / height) * 100).toFixed(2), px: x.toFixed(1), py: y.toFixed(1) };
  });

  return { dense, compact, width, height, cx, cy, rx, ry, points };
}

function renderStarLinks(geo, featuredFlags = []) {
  const spokes = geo.points
    .map(
      (point, index) =>
        `<line class="sponsor-spoke${featuredFlags[index] ? " is-featured" : ""}" x1="${geo.cx}" y1="${geo.cy}" x2="${point.px}" y2="${point.py}"></line>`
    )
    .join("");
  const orbit = geo.compact ? "" : `<ellipse class="sponsor-orbit" cx="${geo.cx}" cy="${geo.cy}" rx="${geo.rx}" ry="${geo.ry}"></ellipse>`;
  return `<svg class="sponsor-star-links" viewBox="0 0 ${geo.width} ${geo.height}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          ${orbit}${spokes}
        </svg>`;
}

function renderStarSatellites(items, label, newTab) {
  if (!items.length) return "";
  const target = newTab ? ` target="_blank" rel="noreferrer"` : "";
  return `
      <ul class="sponsor-satellites" aria-label="${escapeHtml(label)}">
        ${items
          .map((item) => {
            const inner = `${item.image ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">` : ""}<span>${escapeHtml(item.label)}</span>`;
            return item.href
              ? `<li><a class="sponsor-chip" href="${escapeHtml(safeHref(item.href))}"${target}>${inner}</a></li>`
              : `<li><span class="sponsor-chip">${inner}</span></li>`;
          })
          .join("")}
      </ul>`;
}

// ── Équipement : sac de sport au centre de l'étoile ────────────────────────────
// Le sac est repéré par son titre (« Sac de sport », « Sac »…) ou l'id d'origine
// `equip-sac`. Sans sac publié, ou sans autre équipement, on garde la grille d'origine.
const EQUIPMENT_BAG_ICON = `<svg class="equip-hub-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M22 27v-5a10 10 0 0 1 20 0v5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="6" y="27" width="52" height="26" rx="13" fill="none" stroke="currentColor" stroke-width="3"/><path d="M6 39h52" fill="none" stroke="currentColor" stroke-width="3"/><rect x="27" y="35" width="10" height="8" rx="2" fill="currentColor"/></svg>`;

function isEquipmentBag(item) {
  if (item.id === "equip-sac") return true;
  const title = String(item.title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /\bsac\b/.test(title);
}

function renderEquipmentLink(item) {
  return item.cta_href ? `<a class="cta" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : "";
}

// Photo d'équipement : par défaut (réglage « cover » de l'admin) l'image remplit
// tout le cadre ; avec « contain » elle reste entière, marges comprises, et le
// fond blanc des photos produit est fondu dans le cadre (mix-blend-mode côté CSS).
function renderEquipmentPhoto(item, widths, sizes) {
  const srcset = cfImageSrcset(item.image_url, widths);
  const set = srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${sizes}"` : "";
  return `<div class="equip-photo"><img class="equip-photo-img ${imageFitClass(item.image_fit, "cover")}" src="${escapeHtml(item.image_url)}"${set} alt="${escapeHtml(item.title)}" loading="lazy" decoding="async"></div>`;
}

function renderEquipmentHub(item) {
  const media = item.image_url
    ? renderEquipmentPhoto(item, [300, 600, 900], "(max-width: 1020px) 46vw, 264px")
    : EQUIPMENT_BAG_ICON;
  return `
        <div class="equip-hub">
          <div class="equip-hub-medal">${media}</div>
          <div class="equip-hub-caption">
            <h3>${escapeHtml(item.title)}</h3>
            ${item.description ? `<p title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</p>` : ""}
            ${renderEquipmentLink(item)}
          </div>
        </div>`;
}

function renderEquipmentStarNode(item, position) {
  const image = item.image_url ? renderEquipmentPhoto(item, [240, 480, 720], "(max-width: 1020px) 90vw, 212px") : "";
  const description = item.description
    ? `<p class="sponsor-node-desc" title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</p>`
    : "";
  return `
          <li class="sponsor-node equip-node" style="--x:${position.x}%;--y:${position.y}%">
            <article class="equipment-card sponsor-partner-card">
              ${image}
              <h3>${escapeHtml(item.title)}</h3>
              ${description}
              ${renderEquipmentLink(item)}
            </article>
          </li>`;
}

function renderEquipmentStar(hub, satellites) {
  const shown = satellites.slice(0, STAR_MAX);
  const overflow = satellites.slice(STAR_MAX);
  const roomy = shown.length <= 6; // assez de place pour des photos entières et des textes plus longs
  // Description du sac affichée seulement si aucun satellite n'est juste sous lui (3 ou 5 : bas libre ; 1-2 : orbite à plat).
  const hubNote = [1, 2, 3, 5].includes(shown.length);
  // Photos qui remplissent tout leur cadre : à partir de 7 satellites les cartes sont plus hautes,
  // on agrandit donc l'étoile (7-8 : 1220, 9-10 : 1250) pour qu'elles ne se chevauchent pas.
  const dense = shown.length >= STAR_DENSE_FROM;
  const height = roomy ? 0 : dense ? 1250 : 1220;
  const geo = starGeometry(shown.length, { tall: roomy, height });
  const chips = renderStarSatellites(
    overflow.map((item) => ({ label: item.title, image: item.image_url, href: item.cta_href })),
    "Autres équipements",
    false
  );
  return `<div class="sponsor-star equip-star${roomy ? " is-roomy" : ""}${hubNote ? " has-hub-note" : ""}${roomy && !geo.compact ? " is-tall" : ""}${height === 1220 ? " is-taller" : ""}${height === 1250 ? " is-tallest" : ""}${geo.dense ? " is-dense" : ""}${geo.compact ? " is-compact" : ""}" role="group" aria-label="Équipement recommandé">
        ${renderStarLinks(geo)}${renderEquipmentHub(hub)}
        <ul class="sponsor-star-nodes">${shown.map((item, index) => renderEquipmentStarNode(item, geo.points[index])).join("")}
        </ul>
      </div>${chips}`;
}

function renderEquipmentGrid(items) {
  return `<div class="equipment-grid">
        ${items
          .map(
            (item) => `
          <article class="equipment-card${textAlignClass(item.text_align)}">
            ${item.image_url ? `<img class="card-media ${imageFitClass(item.image_fit, "cover")}" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [400,800]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [400,800]))}" sizes="(max-width: 640px) 100vw, 400px"` : ""} alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ""}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            ${item.cta_href ? `<a class="cta" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : ""}
          </article>
        `
          )
          .join("")}
      </div>`;
}

function renderEquipmentSection(data, section) {
  const items = (data.equipment || []).filter((item) => Number(item.enabled ?? 1) === 1);
  const hub = items.find(isEquipmentBag);
  const satellites = hub ? items.filter((item) => item !== hub) : [];
  return `
    <section id="equipement" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Équipement")}</div>
          <h2>${escapeHtml(section.subtitle || "Protections et matériel recommandés")}</h2>
        </div>
        <p>${escapeHtml(data.equipmentIntro || "")}</p>
      </div>
      ${hub && satellites.length ? renderEquipmentStar(hub, satellites) : renderEquipmentGrid(items)}
    </section>
  `;
}

function renderSponsorStarNode(item, position, dense) {
  const featured = Number(item.featured) === 1;
  const srcset = cfImageSrcset(item.logo_url, [200, 400]);
  const logo = item.logo_url
    ? `<img class="card-media ${imageFitClass(item.image_fit, "contain")}" src="${escapeHtml(item.logo_url)}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="200px"` : ""} alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">`
    : "";
  const description = item.description
    ? `<p class="sponsor-node-desc" title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</p>`
    : "";
  const link = item.website_url
    ? `<a class="cta" href="${escapeHtml(safeHref(item.website_url))}" target="_blank" rel="noreferrer">${escapeHtml(item.cta_label || "Voir le site")}</a>`
    : "";
  return `
          <li class="sponsor-node${featured ? " is-featured" : ""}" style="--x:${position.x}%;--y:${position.y}%">
            <article class="sponsor-partner-card ${featured ? "is-featured" : ""}">
              ${featured ? `<span class="sponsor-node-mark" aria-hidden="true">★</span>` : ""}
              ${logo}
              <h3>${escapeHtml(item.name)}</h3>
              ${description}
              ${link}
            </article>
          </li>`;
}

function renderSponsorStar(data, sponsors) {
  const shown = sponsors.slice(0, STAR_MAX);
  const overflow = sponsors.slice(STAR_MAX);
  const geo = starGeometry(shown.length);
  const logoUrl = data.design?.logoUrl || "/assets/logo-affbc.png";
  const satellites = renderStarSatellites(
    overflow.map((item) => ({ label: item.name, image: item.logo_url, href: item.website_url })),
    "Autres partenaires",
    true
  );

  return `
      <div class="sponsor-star${geo.dense ? " is-dense" : ""}${geo.compact ? " is-compact" : ""}" role="group" aria-label="Partenaires du club">
        ${renderStarLinks(geo, shown.map((item) => Number(item.featured) === 1))}
        <div class="sponsor-hub">
          <img src="${escapeHtml(logoUrl)}" alt="Logo American Full Fighting Bons en Chablais" loading="lazy" decoding="async">
        </div>
        <ul class="sponsor-star-nodes">${shown.map((item, index) => renderSponsorStarNode(item, geo.points[index], geo.dense)).join("")}
        </ul>
      </div>${satellites}`;
}

function renderSponsorsSection(data, section) {
  const ordered = (data.sponsors || [])
    .filter((item) => Number(item.enabled ?? 1) === 1)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  // Les sponsors principaux passent en premier : le premier se place en haut de l'étoile.
  const sponsors = [
    ...ordered.filter((item) => Number(item.featured) === 1),
    ...ordered.filter((item) => Number(item.featured) !== 1),
  ];
  return `
    <section id="sponsors" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Sponsors")}</div>
          <h2>${escapeHtml(section.subtitle || "Ils soutiennent le club")}</h2>
        </div>
        <p>${escapeHtml(data.sponsorsIntro || "Merci aux partenaires qui accompagnent le club et soutiennent ses projets.")}</p>
      </div>${sponsors.length ? renderSponsorStar(data, sponsors) : ""}
    </section>
  `;
}

function renderSponsorSection(data, section) {
  const suggestedAmounts = data.sponsor?.checkoutSuggestedAmounts || [];
  const minAmount = Number.parseInt(data.sponsor?.checkoutMinAmountEur || "5", 10) || 5;
  return `
    <section id="don" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Mécénat")}</div>
          <h2>${escapeHtml(section.subtitle || "Soutenir le club et ses combattants.")}</h2>
        </div>
        <p>${escapeHtml(data.sponsor?.intro || "Le soutien des adhérents, proches et partenaires aide le club à mieux équiper ses pratiquants et à accompagner ses projets.")}</p>
      </div>
      <article class="sponsor-card">
        <h3>${escapeHtml(data.sponsor?.title)}</h3>
        <p>${escapeHtml(data.sponsor?.body)}</p>
        ${data.sponsor?.checkoutEnabled ? `
          <form id="donation-form" class="donation-form">
            <div class="donation-presets">
              ${suggestedAmounts.map((amount) => `<button class="donation-preset" type="button" data-donation-amount="${amount}">${amount} €</button>`).join("")}
            </div>
            <div class="donation-grid">
              <label><span>${escapeHtml(data.labels?.sponsorAmount || "Montant")}</span><input id="donation-amount" type="number" min="${minAmount}" step="1" placeholder="${minAmount}" required></label>
              <label><span>${escapeHtml(data.labels?.sponsorFirstName || "Prénom")}</span><input type="text" name="firstName" required></label>
              <label><span>${escapeHtml(data.labels?.sponsorLastName || "Nom")}</span><input type="text" name="lastName" required></label>
              <label><span>${escapeHtml(data.labels?.sponsorEmail || "E-mail")}</span><input type="email" name="email" required></label>
            </div>
            <div class="spotlight-actions">
              <button class="btn btn-red" type="submit">${escapeHtml(data.sponsor?.ctaLabel || "Faire un don")}</button>
            </div>
            <p id="donation-status" class="form-status"></p>
          </form>
        ` : `
          <div class="spotlight-actions">
            ${data.sponsor?.ctaHref ? `<a class="btn btn-red" href="${escapeHtml(safeHref(data.sponsor.ctaHref))}">${escapeHtml(data.sponsor.ctaLabel || "Ouvrir")}</a>` : ""}
          </div>
        `}
      </article>
    </section>
  `;
}

function renderCustomSection(data, section) {
  const blocks = (data.customBlocks || [])
    .filter((item) => Number(item.enabled) === 1)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  return `
    <section id="blocs" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Blocs personnalisés")}</div>
          <h2>${escapeHtml(section.subtitle || "Composez librement le site.")}</h2>
        </div>
      </div>
      <div class="custom-block-grid">
        ${blocks.map((item) => {
          const width = Math.min(100, Math.max(30, Number(item.width_percent) || 100));
          const height = Math.min(760, Math.max(180, Number(item.height_px) || 360));
          return `
          <article class="custom-block${textAlignClass(item.text_align)}" style="--custom-block-width:${width}%;--custom-block-height:${height}px">
            ${item.image_url ? `<img class="${imageFitClass(item.image_fit)}" src="${escapeHtml(item.image_url)}"${cfImageSrcset(item.image_url, [400,800]) ? ` srcset="${escapeHtml(cfImageSrcset(item.image_url, [400,800]))}" sizes="(max-width: 640px) 100vw, 400px"` : ""} alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ""}
            <div class="custom-block-copy">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.body)}</p>
              ${item.cta_href ? `<a class="btn btn-red" href="${escapeHtml(safeHref(item.cta_href))}">${escapeHtml(item.cta_label || "Ouvrir")}</a>` : ""}
            </div>
          </article>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderContactSection(data, section) {
  return `
    <section id="contact" class="section-shell">
      <div class="section-head">
        <div>
          <div class="section-tag">${escapeHtml(section.title || "Contact")}</div>
          <h2>${escapeHtml(section.subtitle || "Parler au club")}</h2>
        </div>
        <p>${escapeHtml(data.contactIntro || "Pour une question, une séance d'essai ou une demande sur la saison, le club peut être joint directement ici.")}</p>
      </div>
      <div class="contact-wrap">
        <article class="contact-card">
          <h3>${escapeHtml(data.contactForm?.detailsTitle || "Coordonnées")}</h3>
          <p>${escapeHtml(data.site.name)}<br>${escapeHtml(data.site.address)}<br>${escapeHtml(data.site.email)}<br>${escapeHtml(data.site.phone)}</p>
          ${data.contactForm?.mapEmbedUrl ? `
            <div class="contact-map-frame">
            <iframe
            src="${escapeHtml(safeHref(data.contactForm.mapEmbedUrl))}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="${escapeHtml(data.labels?.contactMapTitle || "Plan d'accès au club")}">
            </iframe>
            </div>` : ""}
        </article>
        <article class="contact-card">
          <h3>${escapeHtml(data.contactForm?.formTitle || "Envoyer un message")}</h3>
          <form id="contact-form" class="contact-form">
            <input type="text" name="website" hidden>
            <label><span>${escapeHtml(data.contactForm?.nameLabel || "Nom")}</span><input type="text" name="fullName" required></label>
            <label><span>${escapeHtml(data.contactForm?.emailLabel || "E-mail")}</span><input type="email" name="email" required></label>
            <label><span>${escapeHtml(data.contactForm?.phoneLabel || "Téléphone")}</span><input type="tel" name="phone" required></label>
            <label><span>${escapeHtml(data.contactForm?.messageLabel || "Message")}</span><textarea name="message" rows="6" required></textarea></label>
            <button class="btn btn-red" type="submit">${escapeHtml(data.contactForm?.submitLabel || "Envoyer")}</button>
            <p id="form-status" class="form-status"></p>
          </form>
        </article>
      </div>
    </section>
  `;
}

// Paire de sections que l'on affiche côte à côte (plutôt que l'une sous
// l'autre) quand elles sont toutes les deux actives ET adjacentes dans
// l'ordre choisi depuis l'admin. Si l'ordre est modifié pour qu'une autre
// section s'intercale entre les deux, ou que l'une des deux est désactivée,
// chacune retombe simplement sur son rendu pleine largeur habituel.
const DUO_PAIR = ["upcoming_events", "spotlight"];

function renderDuoSection(data, sectionA, sectionB) {
  const htmlA = SECTION_RENDERERS[sectionA.section_key](data, sectionA, { compact: true });
  const htmlB = SECTION_RENDERERS[sectionB.section_key](data, sectionB, { compact: true });
  return `
    <div class="section-shell section-duo">
      <div class="section-duo-col">${htmlA}</div>
      <div class="section-duo-col">${htmlB}</div>
    </div>
  `;
}

const SECTION_RENDERERS = {
  upcoming_events: renderUpcomingEventsSection,
  spotlight: renderSpotlightSection,
  story: renderStorySection,
  schedule: renderScheduleSection,
  team: renderTeamSection,
  pricing: renderPricingSection,
  news: renderNewsSection,
  highlights: renderHighlightsSection,
  gallery: renderGallerySection,
  resources: renderResourcesSection,
  equipment: renderEquipmentSection,
  sponsors: renderSponsorsSection,
  faq: renderFaqSection,
  testimonials: renderTestimonialsSection,
  sponsor: renderSponsorSection,
  custom: renderCustomSection,
  contact: renderContactSection,
};

export function renderSectionsHtml(data) {
  const enabled = (data.sections || []).filter(
    (section) => Number(section.enabled) === 1 && SECTION_RENDERERS[section.section_key]
  );
  const html = [];
  for (let i = 0; i < enabled.length; i++) {
    const section = enabled[i];
    const next = enabled[i + 1];
    const isPair = next && DUO_PAIR.includes(section.section_key) && DUO_PAIR.includes(next.section_key) && section.section_key !== next.section_key;
    if (isPair) {
      html.push(renderDuoSection(data, section, next));
      i++; // la section suivante vient d'être rendue dans le duo, on la saute
      continue;
    }
    html.push(SECTION_RENDERERS[section.section_key](data, section));
  }
  return html.join("");
}
