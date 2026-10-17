import {
  escapeHtml,
  safeHref,
  visibleButtons,
  renderCustomButton,
  renderSectionsHtml,
  renderTopLinksHtml,
  renderSocialLinksHtml,
  renderHeroStatsHtml,
  buildJsonLd,
} from "./sections-render.mjs";

async function fetchBootstrap() {
  const response = await fetch("/api/bootstrap");
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Chargement impossible");
  return payload.data;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function setLink(id, label, href) {
  const element = document.getElementById(id);
  if (!element) return;
  if (label) element.textContent = label;
  if (href) element.href = href;
}

function setContactLink(id, label, href) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = label || "";
  if (href) {
    element.href = href;
    element.removeAttribute("aria-disabled");
  } else {
    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
  }
}

function phoneHref(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone ? `tel:${phone}` : "";
}

function setVisible(id, visible) {
  const element = document.getElementById(id);
  if (!element) return;
  element.hidden = !visible;
  element.style.display = visible ? "" : "none";
  element.setAttribute("aria-hidden", visible ? "false" : "true");
}

function setMetaContent(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", value || "");
}

function setLinkHref(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) element.setAttribute("href", value);
}

function setCssVar(name, value) {
  document.documentElement.style.setProperty(name, value ? `url("${String(value).replace(/"/g, '\\"')}")` : "none");
}

function setRootVar(name, value) {
  if (value) document.documentElement.style.setProperty(name, value);
}

function applyDesign(data) {
  setCssVar("--site-ambient-image", data.design?.siteAmbientImage);
  setCssVar("--hero-background-image", data.design?.heroBackgroundImage);
  setCssVar("--spotlight-background-image", data.design?.spotlightBackgroundImage);
  setRootVar("--accent", data.design?.primaryColor);
  setRootVar("--accent-deep", data.design?.primaryColor);
  setRootVar("--gold", data.design?.secondaryColor);
  setRootVar("--font-display", data.design?.headingFont);
  setRootVar("--font-body", data.design?.bodyFont);
  setRootVar("--font-nav", data.design?.navFont);
  setRootVar("--font-button", data.design?.buttonFont);
  setRootVar("--font-card-title", data.design?.cardTitleFont);
  setRootVar("--font-card-body", data.design?.cardBodyFont);
}

function applyBrandAssets(data) {
  const logo = document.getElementById("brand-logo");
  if (logo && data.design?.logoUrl) logo.src = data.design.logoUrl;
  const favicon = document.getElementById("site-favicon");
  if (favicon && data.design?.faviconUrl) favicon.href = data.design.faviconUrl;
}

function applyStaticContent(data) {
  window.__siteData = data;
  if (data.site?.browserTitle) document.title = data.site.browserTitle;
  setText("brand-primary", data.site?.brandPrimary);
  setText("brand-secondary", data.site?.brandSecondary);
  setLink("nav-club", data.navigation?.clubLabel, "#club");
  setVisible("nav-club", data.navigation?.clubEnabled !== false);
  setLink("nav-schedule", data.navigation?.scheduleLabel, "#planning");
  setVisible("nav-schedule", data.navigation?.scheduleEnabled !== false);
  setLink("nav-pricing", data.navigation?.pricingLabel, "#tarifs");
  setVisible("nav-pricing", data.navigation?.pricingEnabled !== false);
  setLink("nav-contact", data.navigation?.contactLabel, "#contact");
  setVisible("nav-contact", data.navigation?.contactEnabled !== false);
  setLink("nav-inscription", data.navigation?.inscriptionLabel, data.navigation?.inscriptionHref);
  setVisible("nav-inscription", data.navigation?.inscriptionEnabled !== false);
  setLink("nav-calendar", data.navigation?.calendarLabel, data.navigation?.calendarHref);
  setVisible("nav-calendar", data.navigation?.calendarEnabled !== false);
  setLink("nav-shop", data.navigation?.shopLabel, data.navigation?.shopHref);
  setVisible("nav-shop", data.navigation?.shopEnabled !== false);
  setLink("nav-membre", data.navigation?.membreLabel, data.navigation?.membreHref);
  setVisible("nav-membre", data.navigation?.membreEnabled !== false);

  setLink("hero-primary", data.hero?.primaryLabel, data.hero?.primaryHref);
  setVisible("hero-primary", data.hero?.primaryEnabled !== false);
  setLink("hero-secondary", data.hero?.secondaryLabel, data.hero?.secondaryHref);
  setVisible("hero-secondary", data.hero?.secondaryEnabled !== false);

  const utilityLinks = data.hero?.utilityLinks || [];
  utilityLinks.forEach((item, index) => {
    setLink(`hero-utility-${index + 1}`, item.label, item.href);
    setVisible(`hero-utility-${index + 1}`, item.enabled !== false);
  });
  const navMenu = document.getElementById("nav-menu");
  if (navMenu) {
    navMenu.querySelectorAll("[data-custom-placement='nav']").forEach((item) => item.remove());
    visibleButtons(data, "nav").forEach((item) => {
      navMenu.insertAdjacentHTML("beforeend", renderCustomButton({ ...item, style: "link" }).replace("<a ", "<a data-custom-placement=\"nav\" "));
    });
  }
  const heroActions = document.getElementById("hero-actions");
  if (heroActions) {
    heroActions.querySelectorAll("[data-custom-placement='hero']").forEach((item) => item.remove());
    visibleButtons(data, "hero").forEach((item) => {
      heroActions.insertAdjacentHTML("beforeend", renderCustomButton(item).replace("<a ", "<a data-custom-placement=\"hero\" "));
    });
  }
  setText("contact-email-title", data.labels?.contactEmailTitle);
  setText("contact-phone-title", data.labels?.contactPhoneTitle);
  setText("contact-address-title", data.labels?.contactAddressTitle);
}

function applyMeta(data) {
  const publicUrl = String(data.sitePublicUrl || window.location.origin).replace(/\/+$/, "");
  setMetaContent('meta[name="description"]', data.meta?.description);
  setMetaContent('meta[name="keywords"]', data.meta?.keywords);
  setMetaContent('meta[property="og:title"]', data.site?.name);
  setMetaContent('meta[property="og:description"]', data.meta?.description);
  setMetaContent('meta[property="og:url"]', publicUrl);
  setMetaContent('meta[name="twitter:title"]', data.site?.name);
  setMetaContent('meta[name="twitter:description"]', data.meta?.description);
  setLinkHref("#site-canonical", publicUrl);
  applyStructuredData(data, publicUrl);
}

function applyStructuredData(data, publicUrl) {
  const element = document.getElementById("site-jsonld");
  if (!element) return;
  element.textContent = JSON.stringify(buildJsonLd(data, publicUrl), null, 2);
}

function renderTopLinks(data) {
  const host = document.getElementById("partner-links-top");
  if (!host) return;
  host.innerHTML = renderTopLinksHtml(data);
}

function renderSocialLinks(data) {
  const host = document.getElementById("social-links");
  if (!host) return;
  const html = renderSocialLinksHtml(data);
  host.innerHTML = html;
  host.hidden = !html;
}

function renderHeroStats(data) {
  const host = document.getElementById("hero-stats");
  if (!host) return;
  const html = renderHeroStatsHtml(data);
  host.innerHTML = html;
  host.hidden = !html;
}

function renderFooter(data) {
  setText("footer-note", data.site?.footerNote);
  setText("footer-legal", data.footer?.legal);
  setText("footer-meta", data.footer?.meta);
  renderSocialLinks(data);
}

function renderSections(data) {
  document.getElementById("page-sections").innerHTML = renderSectionsHtml(data);
}

function renderMainMap(url) {
  const host = document.getElementById("map-frame");
  if (!host) return;

  if (!url) {
    host.innerHTML = `<p>${escapeHtml(window.__siteData?.labels?.mapUnavailable || "Carte indisponible")}</p>`;
    return;
  }

  host.innerHTML = `
  <iframe
  src="${escapeHtml(safeHref(url))}"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  allowfullscreen
  title="${escapeHtml(window.__siteData?.labels?.contactMapTitle || "Localisation du club")}">
  </iframe>
  `;
}


function initGalleryCarousels() {
  document.querySelectorAll('[data-carousel="gallery"]').forEach((root) => {
    const track = root.querySelector(".gallery-carousel-track");
    const slides = Array.from(root.querySelectorAll(".gallery-slide"));
    const dots = Array.from(root.querySelectorAll("[data-gallery-dot]"));
    const prev = root.querySelector("[data-gallery-prev]");
    const next = root.querySelector("[data-gallery-next]");
    if (!track || slides.length <= 1) return;

    let index = 0;
    let autoplayId = null;

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const goTo = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      update();
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayId = window.setInterval(() => {
        goTo(index + 1);
      }, 5000);
    };

    prev?.addEventListener("click", () => {
      goTo(index - 1);
      startAutoplay();
    });
    next?.addEventListener("click", () => {
      goTo(index + 1);
      startAutoplay();
    });
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.getAttribute("data-gallery-dot")));
        startAutoplay();
      });
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    update();
    startAutoplay();
  });
}

async function bindContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Envoi en cours...";
    const formData = new FormData(form);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = await response.json();
    status.textContent = payload.ok ? payload.data.message : payload.error;
    if (payload.ok) form.reset();
  });
}

async function bindDonationForm() {
  const form = document.getElementById("donation-form");
  if (!form) return;
  const status = document.getElementById("donation-status");
  const amountInput = document.getElementById("donation-amount");

  document.querySelectorAll("[data-donation-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      amountInput.value = button.getAttribute("data-donation-amount") || "";
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Redirection vers HelloAsso...";
    const formData = new FormData(form);
    const amount = Number.parseInt(String(amountInput.value || ""), 10);
    const response = await fetch("/api/donations/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        amountCents: amount * 100,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      status.textContent = payload.error || "Impossible de créer le paiement.";
      return;
    }
    window.location.href = payload.data.redirectUrl;
  });
}

async function bindDonationReturn() {
  const status = document.getElementById("donation-status");
  if (!status) return;
  const params = new URLSearchParams(window.location.search);
  const checkoutIntentId = params.get("checkoutIntentId");
  const code = params.get("code");
  const flow = params.get("ha_checkout");
  const error = params.get("error");

  if (!checkoutIntentId && !flow) return;

  if (flow === "back") {
    status.textContent = "Paiement annulé avant validation.";
    return;
  }

  if (flow === "error" || error) {
    status.textContent = "Une erreur est survenue pendant le paiement. Vous pouvez réessayer.";
    return;
  }

  if (checkoutIntentId && code === "succeeded") {
    status.textContent = "Vérification du paiement...";
    try {
      const response = await fetch(`/api/donations/checkout-status?intentId=${encodeURIComponent(checkoutIntentId)}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Vérification impossible");
      const payerEmail = payload.data?.order?.payer?.email;
      status.textContent = payerEmail
        ? `Merci, votre don a bien été enregistré pour ${payerEmail}.`
        : "Merci, votre don a bien été enregistré.";
    } catch (errorCaught) {
      status.textContent = errorCaught instanceof Error ? errorCaught.message : "Merci, retour reçu depuis HelloAsso.";
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchBootstrap();
    document.title = data.site.name || "American Full Fighting Bons en Chablais";
    applyDesign(data);
    applyBrandAssets(data);
    applyMeta(data);
    applyStaticContent(data);
    setText("hero-kicker", data.hero.kicker);
    setText("hero-title", data.hero.title);
    setText("hero-body", data.hero.body);
    setText("announcement-badge", data.announcement.badge);
    setText("announcement-title", data.announcement.title);
    setText("announcement-body", data.announcement.body);
    setContactLink("site-email", data.site.email, data.site.email ? `mailto:${data.site.email}` : "");
    setContactLink("site-phone", data.site.phone, phoneHref(data.site.phone));
    setText("site-address", data.site.address);
    setText("inpi-note", data.inpiNote);
    setLink("hero-primary", data.hero.primaryLabel, data.hero.primaryHref);
    setLink("hero-secondary", data.hero.secondaryLabel, data.hero.secondaryHref);
    renderHeroStats(data);
    renderTopLinks(data);
    try {
      renderSections(data);
    } catch (sectionError) {
      // Une section mal formée ne doit pas empêcher le pied de page, le
      // carrousel et les formulaires (contact, don) de s'initialiser.
      console.error("Erreur de rendu des sections", sectionError);
    }
    renderFooter(data);
    initGalleryCarousels();
    bindContactForm();
    bindDonationForm();
    bindDonationReturn();
  } catch (error) {
    setText("hero-body", error instanceof Error ? error.message : "Chargement impossible");
  } finally {
    document.body.classList.remove("is-loading");
  }
});
