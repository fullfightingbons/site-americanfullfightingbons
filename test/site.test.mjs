import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSectionsHtml } from '../public/assets/sections-render.mjs';
import {
  checkLoginRateLimit,
  parseCookies,
  quoteIdentifier,
  toBase64Url,
  fromBase64Url,
  secureEquals,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  normalizeDbValue,
  escapeHtmlText,
  parseBooleanSetting,
  mergePricing,
  normalizeGoogleReview,
  detectImageSignature,
} from '../src/index.ts';

const adminSource = readFileSync(new URL('../public/assets/admin.js', import.meta.url), 'utf8');
const workerSource = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');

describe('secureEquals', () => {
  it('retourne true pour deux chaînes identiques', () => {
    expect(secureEquals('signature123', 'signature123')).toBe(true);
  });

  it('retourne false pour des longueurs différentes', () => {
    expect(secureEquals('abc', 'ab')).toBe(false);
  });

  it('retourne false pour un seul caractère différent', () => {
    expect(secureEquals('abcdef', 'abcdeg')).toBe(false);
  });
});

describe('parseCookies', () => {
  function fakeRequest(cookieHeader) {
    return { headers: { get: (name) => (name === 'cookie' ? cookieHeader : null) } };
  }

  it('extrait le cookie de session', () => {
    const cookies = parseCookies(fakeRequest('affbc_site_session=abc.def; other=1'));
    expect(cookies.affbc_site_session).toBe('abc.def');
  });

  it('retourne un objet vide sans en-tête cookie', () => {
    expect(parseCookies(fakeRequest(null))).toEqual({});
  });

  it('décode les valeurs encodées en URL', () => {
    const cookies = parseCookies(fakeRequest('msg=hello%20world'));
    expect(cookies.msg).toBe('hello world');
  });
});

describe('quoteIdentifier', () => {
  it('accepte un identifiant de colonne/table valide', () => {
    expect(quoteIdentifier('site_settings')).toBe('"site_settings"');
  });

  it("rejette une tentative d'injection SQL", () => {
    expect(() => quoteIdentifier('site_settings; DROP TABLE users')).toThrow();
  });

  it('rejette un identifiant commençant par un chiffre', () => {
    expect(() => quoteIdentifier('1table')).toThrow();
  });
});

describe('toBase64Url / fromBase64Url', () => {
  it('fait un aller-retour fidèle sans caractères +/= ', () => {
    const original = JSON.stringify({ userId: 42, expiresAt: 1234567890 });
    const encoded = toBase64Url(original);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(fromBase64Url(encoded)).toBe(original);
  });
});

describe('sanitizeText', () => {
  it('trim et compresse les espaces multiples', () => {
    expect(sanitizeText('  Bonjour    le   monde  ', 100)).toBe('Bonjour le monde');
  });

  it('tronque à la longueur maximale', () => {
    expect(sanitizeText('abcdefghij', 5)).toBe('abcde');
  });

  it('gère les valeurs null/undefined', () => {
    expect(sanitizeText(null, 10)).toBe('');
    expect(sanitizeText(undefined, 10)).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('met en minuscules et trim', () => {
    expect(sanitizeEmail('  Jean.Dupont@Example.COM  ', 100)).toBe('jean.dupont@example.com');
  });
});

describe('sanitizeUrl', () => {
  it('trim et tronque sans modifier la casse', () => {
    expect(sanitizeUrl('  https://Example.com/Path  ', 100)).toBe('https://Example.com/Path');
  });
});

describe('normalizeDbValue', () => {
  it('convertit undefined en null (compatibilité D1)', () => {
    expect(normalizeDbValue(undefined)).toBeNull();
  });

  it('convertit les booléens en 0/1', () => {
    expect(normalizeDbValue(true)).toBe(1);
    expect(normalizeDbValue(false)).toBe(0);
  });

  it('laisse les autres valeurs inchangées', () => {
    expect(normalizeDbValue('texte')).toBe('texte');
    expect(normalizeDbValue(42)).toBe(42);
    expect(normalizeDbValue(null)).toBeNull();
  });
});

describe('escapeHtmlText', () => {
  it('échappe les caractères HTML spéciaux', () => {
    expect(escapeHtmlText(`<script>alert("xss")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it("échappe l'apostrophe et l'esperluette", () => {
    expect(escapeHtmlText(`L'équipe & vous`)).toBe('L&#39;équipe &amp; vous');
  });
});

describe('parseBooleanSetting', () => {
  it.each(['1', 'true', 'TRUE', 'yes', 'on'])('reconnaît "%s" comme vrai', (value) => {
    expect(parseBooleanSetting(value)).toBe(true);
  });

  it.each(['0', 'false', 'no', 'off', '', undefined, null])('reconnaît "%s" comme faux', (value) => {
    expect(parseBooleanSetting(value)).toBe(false);
  });
});

/**
 * Faux D1Database minimal, suffisant pour les requêtes utilisées par
 * checkLoginRateLimit() (DELETE / SELECT / INSERT...ON CONFLICT / UPDATE sur
 * la table auth_rate_limits). checkLoginRateLimit() est passé en D1 réel
 * (persistant, multi-instances) au lieu de l'ancien Map en mémoire — ce
 * stub reproduit le même comportement pour les tests unitaires.
 */
function createFakeAuthRateLimitDb() {
  const rows = new Map(); // ip -> { attempt_count, last_attempt, blocked_until }
  return {
    prepare(sql) {
      const bound = { sql, args: [] };
      return {
        bind(...args) {
          bound.args = args;
          return this;
        },
        async first() {
          if (sql.trim().startsWith('SELECT')) {
            const [ip] = bound.args;
            return rows.get(ip) || null;
          }
          return null;
        },
        async run() {
          const kind = sql.trim().split(/\s+/, 1)[0]; // 1er mot : DELETE / INSERT / UPDATE
          if (kind === 'DELETE') {
            const [ip, windowStart] = bound.args;
            const row = rows.get(ip);
            if (row && row.last_attempt && row.last_attempt < windowStart) {
              rows.delete(ip);
            }
          } else if (kind === 'UPDATE') {
            const [blockedUntil, ip] = bound.args;
            const row = rows.get(ip) || { attempt_count: 0 };
            rows.set(ip, { ...row, blocked_until: blockedUntil });
          } else if (kind === 'INSERT') {
            const [ip] = bound.args;
            const row = rows.get(ip);
            if (row) {
              rows.set(ip, { ...row, attempt_count: Number(row.attempt_count) + 1 });
            } else {
              rows.set(ip, { attempt_count: 1, last_attempt: new Date().toISOString(), blocked_until: null });
            }
          }
          return { success: true };
        },
      };
    },
  };
}

describe('checkLoginRateLimit', () => {
  it('autorise les 8 premières tentatives puis bloque', async () => {
    const env = { DB: createFakeAuthRateLimitDb() };
    const ip = 'test-ip-' + Math.random();
    for (let i = 0; i < 8; i++) {
      expect(await checkLoginRateLimit(ip, env)).toBe(true);
    }
    expect(await checkLoginRateLimit(ip, env)).toBe(false);
  });

  it('traite chaque IP indépendamment', async () => {
    const env = { DB: createFakeAuthRateLimitDb() };
    const ipA = 'test-ip-a-' + Math.random();
    const ipB = 'test-ip-b-' + Math.random();
    for (let i = 0; i < 8; i++) await checkLoginRateLimit(ipA, env);
    expect(await checkLoginRateLimit(ipA, env)).toBe(false);
    expect(await checkLoginRateLimit(ipB, env)).toBe(true);
  });
});

describe('mergePricing', () => {
  it('retourne les tarifs locaux activés quand aucun tarif partagé', () => {
    const result = mergePricing([], [{ id: '1', label: 'Cours adulte' }]);
    expect(result).toEqual([{ enabled: 1, id: '1', label: 'Cours adulte' }]);
  });

  it('applique les surcharges locales sur les tarifs partagés et trie par display_order', () => {
    const shared = [
      { id: '1', label: 'Adulte', price: 50, display_order: 2 },
      { id: '2', label: 'Enfant', price: 30, display_order: 1 },
    ];
    const local = [{ id: '1', price: 45 }]; // surcharge de prix uniquement
    const result = mergePricing(shared, local);
    expect(result.map((r) => r.id)).toEqual(['2', '1']); // trié par display_order
    expect(result.find((r) => r.id === '1').price).toBe(45); // surcharge appliquée
    expect(result.find((r) => r.id === '1').label).toBe('Adulte'); // reste du partagé conservé
  });
});

describe('normalizeGoogleReview', () => {
  it('normalise un avis Google valide', () => {
    const review = {
      name: 'places/x/reviews/1',
      authorAttribution: { displayName: 'Marie D.', photoUri: 'https://example.com/photo.jpg' },
      text: { text: 'Super club, ambiance au top !' },
      rating: 5,
      publishTime: '2026-01-01T00:00:00Z',
    };
    const result = normalizeGoogleReview(review, 0, 4);
    expect(result.author_name).toBe('Marie D.');
    expect(result.quote).toBe('Super club, ambiance au top !');
    expect(result.role_label).toBe('Google · ★★★★★');
    expect(result.rating).toBe(5);
  });

  it('rejette un avis sans texte', () => {
    const review = { authorAttribution: {}, text: {}, rating: 5 };
    expect(normalizeGoogleReview(review, 0, 4)).toBeNull();
  });

  it('rejette un avis sous la note minimale', () => {
    const review = { authorAttribution: {}, text: { text: 'Correct' }, rating: 3 };
    expect(normalizeGoogleReview(review, 0, 4)).toBeNull();
  });
});

describe('detectImageSignature', () => {
  it('reconnaît un JPEG à ses octets de tête', () => {
    expect(detectImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe('image/jpeg');
  });

  it('reconnaît un PNG à ses octets de tête', () => {
    expect(detectImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
  });

  it('reconnaît un WEBP (conteneur RIFF...WEBP)', () => {
    const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(detectImageSignature(bytes)).toBe('image/webp');
  });

  it('reconnaît un GIF89a', () => {
    expect(detectImageSignature(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe('image/gif');
  });

  it("rejette un contenu qui n'est pas une image (ex : un exécutable ou un fichier renommé)", () => {
    expect(detectImageSignature(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]))).toBeNull();
  });

  it('rejette un buffer trop court pour être une image valide', () => {
    expect(detectImageSignature(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });

  it("ne se fie pas à une extension/Content-Type usurpé : seuls les octets comptent", () => {
    // Un fichier .png dont le contenu réel est du texte brut (cas d'un
    // fichier renommé à la main pour contourner une vérification côté
    // client) doit être rejeté malgré son nom/extension.
    const fakeBytes = new TextEncoder().encode('<script>alert(1)</script>');
    expect(detectImageSignature(fakeBytes)).toBeNull();
  });
});

describe('admin messages', () => {
  it('charge plus de messages et propose un export CSV local', () => {
    expect(workerSource).toContain('contact_messages ORDER BY created_at DESC LIMIT 200');
    expect(adminSource).toContain('function exportMessagesCSV');
    expect(adminSource).toContain('data-export-messages');
  });
});

describe('section sponsors (étoile)', () => {
  const section = { section_key: 'sponsors', enabled: 1, title: 'Sponsors', subtitle: 'Ils soutiennent le club.' };
  const sponsor = (i, extra = {}) => ({
    id: `s${i}`, name: `Sponsor ${i}`, description: '', website_url: `https://example.com/${i}`,
    cta_label: 'Voir le site', logo_url: '', image_fit: 'contain', featured: 0, enabled: 1, display_order: i, ...extra,
  });
  const render = (sponsors, design = {}) => renderSectionsHtml({ sections: [section], sponsors, design });
  const count = (html, needle) => html.split(needle).length - 1;

  it('place le logo du club au centre et un rayon par sponsor', () => {
    const html = render([sponsor(1), sponsor(2), sponsor(3)]);
    expect(html).toContain('class="sponsor-hub"');
    expect(html).toContain('/assets/logo-affbc.png');
    expect(count(html, 'class="sponsor-node')).toBe(3);
    expect(count(html, '<line class="sponsor-spoke')).toBe(3);
  });

  it('utilise le logo configuré dans le design quand il existe', () => {
    const html = render([sponsor(1)], { logoUrl: '/media/logo-custom.png' });
    expect(html).toContain('/media/logo-custom.png');
  });

  it('place le sponsor principal en premier, même avec un display_order plus grand', () => {
    const html = render([sponsor(1), sponsor(2, { featured: 1, display_order: 9 })]);
    expect(html.indexOf('Sponsor 2')).toBeLessThan(html.indexOf('Sponsor 1'));
    expect(html).toContain('is-featured');
  });

  it('ignore les sponsors non publiés et n\'affiche pas d\'étoile sans sponsor', () => {
    const html = render([sponsor(1, { enabled: 0 })]);
    expect(html).not.toContain('sponsor-star');
    expect(html).toContain('id="sponsors"');
  });

  it('bascule en mode dense à partir de 9 sponsors', () => {
    expect(render(Array.from({ length: 8 }, (_, i) => sponsor(i + 1)))).not.toContain('is-dense');
    expect(render(Array.from({ length: 9 }, (_, i) => sponsor(i + 1)))).toContain('is-dense');
  });

  it('range les sponsors au-delà de 10 sous l\'étoile', () => {
    const html = render(Array.from({ length: 13 }, (_, i) => sponsor(i + 1)));
    expect(count(html, 'class="sponsor-node')).toBe(10);
    expect(count(html, 'class="sponsor-chip"')).toBe(3);
  });

  it('échappe le HTML des champs saisis en admin', () => {
    const html = render([sponsor(1, { name: '<img src=x onerror=alert(1)>' })]);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
  });
});

describe('section équipement (étoile, sac de sport au centre)', () => {
  const section = { section_key: 'equipment', enabled: 1, title: 'Équipement', subtitle: 'Protections et matériel.' };
  const item = (id, title, extra = {}) => ({
    id, title, description: `Description ${title}`, cta_label: 'Voir la sélection', cta_href: 'https://boutique.example/',
    image_url: '', image_fit: 'cover', text_align: 'left', enabled: 1, display_order: 1, ...extra,
  });
  const bag = item('equip-sac', 'Sac de sport');
  const render = (equipment) => renderSectionsHtml({ sections: [section], equipment, equipmentIntro: 'Intro' });
  const count = (html, needle) => html.split(needle).length - 1;
  const nodesPart = (html) => html.split('<ul class="sponsor-star-nodes">')[1] || '';

  it('place le sac au centre et les autres équipements autour', () => {
    const html = render([item('g', 'Gants'), bag, item('c', 'Casque')]);
    expect(html).toContain('class="equip-hub"');
    expect(html).toContain('id="equipement"');
    expect(count(html, 'class="sponsor-node equip-node"')).toBe(2);
    expect(count(html, '<line class="sponsor-spoke')).toBe(2);
    expect(nodesPart(html)).not.toContain('Sac de sport');
    expect(html.indexOf('Sac de sport')).toBeLessThan(html.indexOf('Gants'));
  });

  it('repère le sac par son titre (casse et accents ignorés) ou par l\'id d\'origine', () => {
    expect(render([item('g', 'Gants'), item('x', 'SAC à dos')])).toContain('class="equip-hub"');
    expect(render([item('g', 'Gants'), item('equip-sac', 'Bagagerie')])).toContain('class="equip-hub"');
    expect(render([item('g', 'Gants'), item('x', 'Sachet de magnésie')])).not.toContain('equip-hub');
  });

  it('garde la grille d\'origine sans sac, avec un sac seul ou sans équipement', () => {
    for (const list of [[item('g', 'Gants'), item('c', 'Casque')], [bag], []]) {
      const html = render(list);
      expect(html).toContain('class="equipment-grid"');
      expect(html).not.toContain('sponsor-star');
    }
  });

  it('ignore les équipements non publiés, y compris le sac', () => {
    expect(render([item('g', 'Gants'), { ...bag, enabled: 0 }])).toContain('class="equipment-grid"');
    const html = render([bag, item('g', 'Gants'), item('c', 'Casque', { enabled: 0 })]);
    expect(count(html, 'class="sponsor-node equip-node"')).toBe(1);
  });

  it('affiche la photo du sac si elle existe, sinon une icône', () => {
    expect(render([item('g', 'Gants'), bag])).toContain('class="equip-hub-icon"');
    const html = render([item('g', 'Gants'), { ...bag, image_url: '/media/sac.jpg' }]);
    expect(html).toContain('/media/sac.jpg');
    expect(html).not.toContain('equip-hub-icon');
  });

  it('remplit le cadre avec chaque photo (cover) et la garde entière en contain', () => {
    const html = render([{ ...bag, image_url: '/media/sac.jpg' }, item('g', 'Gants', { image_url: '/media/gants.jpg', image_fit: 'cover' })]);
    expect(count(html, 'class="equip-photo"')).toBe(2);
    expect(count(html, 'class="equip-photo-img is-cover"')).toBe(2);
    expect(html).toContain('alt="Gants"');
    expect(html).not.toContain('equip-photo-bg');
    expect(render([item('g', 'Gants'), bag])).not.toContain('equip-photo');
    const contained = render([bag, item('g', 'Gants', { image_url: '/media/gants.jpg', image_fit: 'contain' })]);
    expect(contained).toContain('class="equip-photo-img is-contain"');
  });

  it('adapte la hauteur et la densité au nombre de satellites', () => {
    const many = (n) => [bag, ...Array.from({ length: n }, (_, i) => item(`e${i}`, `Équipement ${i}`))];
    expect(render(many(5))).toContain('is-roomy');
    expect(render(many(5))).toContain('is-tall');
    expect(render(many(5))).toContain('viewBox="0 0 1000 1000"');
    expect(render(many(8))).not.toContain('is-roomy');
    expect(render(many(9))).toContain('is-dense');
    expect(render(many(8))).toContain('is-taller');
    expect(render(many(9))).toContain('is-tallest');
    expect(render(many(5))).not.toContain('is-taller');
    expect(render(many(1))).toContain('is-compact');
  });

  it('garde la description du sac seulement si le bas de l\'orbite est libre', () => {
    const many = (n) => [bag, ...Array.from({ length: n }, (_, i) => item(`e${i}`, `Équipement ${i}`))];
    for (const n of [1, 2, 3, 5]) expect(render(many(n))).toContain('has-hub-note');
    for (const n of [4, 6, 8]) expect(render(many(n))).not.toContain('has-hub-note');
  });

  it('range les équipements au-delà de 10 sous l\'étoile, sans ouvrir de nouvel onglet', () => {
    const html = render([bag, ...Array.from({ length: 12 }, (_, i) => item(`e${i}`, `Équipement ${i}`))]);
    expect(count(html, 'class="sponsor-node equip-node"')).toBe(10);
    expect(count(html, 'class="sponsor-chip"')).toBe(2);
    expect(html).not.toContain('target="_blank"');
  });

  it('échappe le HTML des champs saisis en admin et neutralise les liens dangereux', () => {
    const html = render([{ ...bag, title: 'Sac <script>alert(1)</script>' }, item('g', 'Gants', { cta_href: 'javascript:alert(1)' })]);
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('javascript:alert(1)');
  });
});

describe('section équipe (pyramide)', () => {
  const section = { section_key: 'team', enabled: 1, title: 'Équipe', subtitle: 'Encadrement.' };
  const member = (name, role, extra = {}) => ({
    id: name, full_name: name, role_label: role, belt_label: '', bio: '', image_url: '', display_order: 0, ...extra,
  });
  const render = (team, extra = {}) => renderSectionsHtml({ sections: [section], team, ...extra });
  const tierOf = (html, name) => {
    const at = html.indexOf(`<h3>${name}</h3>`);
    const before = html.slice(0, at);
    return Number(before.slice(before.lastIndexOf('data-tier="') + 11, before.lastIndexOf('data-tier="') + 12));
  };
  const team = [
    member('Alice', 'Présidente'),
    member('Bob', 'Secrétaire'),
    member('Chloé', 'Trésorière adjointe'),
    member('David', 'Suppléant'),
    member('Éric', 'Vice-président'),
    member('Fanny', 'Assistante fédérale'),
    member('Gaël', 'Assistant'),
  ];

  it('range président au sommet, bureau au milieu, assistants à la base', () => {
    const html = render(team);
    expect(html).toContain('class="team-pyramid"');
    expect(tierOf(html, 'Alice')).toBe(1);
    ['Bob', 'Chloé', 'David', 'Éric'].forEach((name) => expect(tierOf(html, name)).toBe(2));
    ['Fanny', 'Gaël'].forEach((name) => expect(tierOf(html, name)).toBe(3));
    expect(html.indexOf('Alice')).toBeLessThan(html.indexOf('Bob'));
    expect(html.indexOf('Bob')).toBeLessThan(html.indexOf('Fanny'));
  });

  it('respecte la position forcée depuis l\'admin', () => {
    const html = render([...team, member('Hugo', 'Assistant', { pyramid_level: 'milieu' })]);
    expect(tierOf(html, 'Hugo')).toBe(2);
  });

  it('retombe sur la grille classique si demandé ou si un seul étage existe', () => {
    expect(render(team, { teamLayout: 'grid' })).toContain('class="team-grid"');
    const flat = render([member('Fanny', 'Assistante'), member('Gaël', 'Assistant')]);
    expect(flat).toContain('class="team-grid"');
    expect(flat).not.toContain('team-pyramid');
  });

  it('échappe le HTML des champs saisis en admin', () => {
    const html = render([member('<b>x</b>', 'Président'), member('Gaël', 'Assistant')]);
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});

describe('section avis (mur en colonnes)', () => {
  const section = { section_key: 'testimonials', enabled: 1, title: 'Avis', subtitle: 'Ils parlent du club' };
  const review = (i, extra = {}) => ({
    id: `r${i}`, author_name: `Auteur ${i}`, role_label: 'Parent', quote: `Avis numéro ${i}`, image_url: '',
    image_fit: 'cover', enabled: 1, display_order: i, ...extra,
  });
  const render = (items, extra = {}) => renderSectionsHtml({ sections: [section], testimonials: items, ...extra });
  const colCount = (html) => (html.match(/class="testimonials-col"/g) || []).length;

  it('choisit le nombre de colonnes selon le nombre d\'avis', () => {
    const n = (count) => Array.from({ length: count }, (_, i) => review(i + 1));
    expect(colCount(render(n(1)))).toBe(1);
    expect(colCount(render(n(2)))).toBe(2);
    expect(colCount(render(n(3)))).toBe(3);
    expect(colCount(render(n(4)))).toBe(2);
    expect(colCount(render(n(7)))).toBe(3);
    expect(render(n(4))).toContain('testimonials-grid--2');
  });

  it('équilibre les colonnes : un long avis reste seul face à plusieurs courts', () => {
    const long = 'x'.repeat(500);
    const html = render([review(1, { quote: long }), review(2), review(3), review(4), review(5)]);
    const cols = html.split('class="testimonials-col"').slice(1);
    expect(cols).toHaveLength(3);
    expect(cols[0]).toContain('Auteur 1');
    expect(cols[0]).not.toContain('Auteur 2');
    expect(cols.reduce((total, col) => total + (col.match(/class="testimonial-card/g) || []).length, 0)).toBe(5);
  });

  it('conserve l\'ordre d\'origine via --i et ignore les avis désactivés', () => {
    const html = render([review(2), review(1), review(3, { enabled: 0 })]);
    expect(html).toContain('style="--i:0"');
    expect(html).toContain('style="--i:1"');
    expect(html).not.toContain('Auteur 3');
    expect(html.indexOf('Auteur 1')).toBeLessThan(html.indexOf('Auteur 2') + 1000);
  });

  it('affiche note, source et date pour un avis Google, le rôle pour un avis manuel', () => {
    const google = render([review(1, { source: 'google', rating: 5, relative_time: 'il y a 2 mois', role_label: 'Google · ★★★★★' })]);
    expect(google).toContain('aria-label="Note : 5 sur 5"');
    expect(google).toContain('il y a 2 mois');
    expect(google).not.toContain('Parent');
    const manual = render([review(1)]);
    expect(manual).toContain('Parent');
    expect(manual).not.toContain('testimonial-stars');
  });

  it('affiche l\'initiale sans photo, la photo sinon, et échappe le HTML', () => {
    const html = render([review(1, { author_name: 'élodie' }), review(2, { image_url: '/media/a.jpg', quote: '<script>x</script>' })]);
    expect(html).toContain('testimonial-photo--empty');
    expect(html).toContain('>É<');
    expect(html).toContain('src="/media/a.jpg"');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('garde le bouton des avis Google uniquement pour une source Google', () => {
    const cta = { source: 'google', ctaHref: 'https://g.page/r/xxx', ctaLabel: 'Voir les avis Google' };
    expect(render([review(1)], { googleReviews: cta })).toContain('Voir les avis Google');
    expect(render([review(1)], { googleReviews: { ...cta, source: 'manual' } })).not.toContain('Voir les avis Google');
  });
});

describe('section FAQ (accordéon)', () => {
  const section = { section_key: 'faq', enabled: 1, title: 'FAQ', subtitle: 'Questions fréquentes' };
  const contact = { section_key: 'contact', enabled: 1, title: 'Contact', subtitle: 'Contact' };
  const q = (i, extra = {}) => ({ id: `q${i}`, question: `Question ${i} ?`, answer: `Réponse ${i}.`, enabled: 1, display_order: i, ...extra });
  const render = (items, extra = {}) => renderSectionsHtml({ sections: [section], faq: items, ...extra });
  const count = (html, needle) => html.split(needle).length - 1;

  it('affiche un accordéon par défaut, première question ouverte, une seule à la fois', () => {
    const html = render([q(1), q(2), q(3)]);
    expect(html).toContain('class="faq-layout"');
    expect(count(html, 'class="faq-item"')).toBe(3);
    expect(count(html, 'name="faq"')).toBe(3);
    expect(count(html, ' open')).toBe(1);
    expect(html.indexOf('Question 1')).toBeLessThan(html.indexOf('Question 2'));
    expect(html).not.toContain('faq-card');
  });

  it('permet plusieurs questions ouvertes si le réglage est désactivé', () => {
    const html = render([q(1), q(2)], { faqSingleOpen: false });
    expect(html).not.toContain('name="faq"');
    expect(count(html, 'class="faq-item"')).toBe(2);
  });

  it('rétablit les cartes d\'origine avec faqLayout = cards', () => {
    const html = render([q(1), q(2)], { faqLayout: 'cards' });
    expect(html).toContain('class="faq-grid"');
    expect(count(html, 'class="faq-card')).toBe(2);
    expect(html).not.toContain('faq-layout');
  });

  it('ignore les questions désactivées et respecte l\'ordre', () => {
    const html = render([q(2), q(1), q(3, { enabled: 0 })]);
    expect(html).not.toContain('Question 3');
    expect(html.indexOf('Question 1')).toBeLessThan(html.indexOf('Question 2'));
  });

  it('propose le bouton de contact seulement si la section Contact est affichée', () => {
    expect(renderSectionsHtml({ sections: [section, contact], faq: [q(1)], site: { name: 'AFFBC', address: '', email: '', phone: '' } })).toContain('href="#contact"');
    expect(render([q(1)])).not.toContain('href="#contact"');
    expect(renderSectionsHtml({ sections: [section, { ...contact, enabled: 0 }], faq: [q(1)] })).not.toContain('href="#contact"');
  });

  it('échappe le HTML et publie des données structurées FAQPage sûres', () => {
    const html = render([q(1, { question: '<b>Q</b> ?', answer: 'A </script><script>alert(1)</script>' }), q(2, { answer: '' })]);
    expect(html).not.toContain('<b>Q</b>');
    expect(html).toContain('&lt;b&gt;Q&lt;/b&gt;');
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const data = JSON.parse(match[1]);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(1);
    expect(data.mainEntity[0].acceptedAnswer.text).toContain('</script>');
    expect(match[1]).not.toContain('</script');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('n\'ajoute pas de JSON-LD sans question exploitable', () => {
    expect(render([])).not.toContain('application/ld+json');
  });
});
