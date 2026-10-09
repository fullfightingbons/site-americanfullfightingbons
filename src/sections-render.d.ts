/**
 * Déclarations de types pour public/assets/sections-render.mjs, importé
 * directement par le Worker (src/index.ts) afin de générer le HTML de la
 * page d'accueil côté serveur (SSR) avec les mêmes fonctions de rendu que
 * celles utilisées côté navigateur dans public/assets/site.js.
 *
 * Le fichier réel est du JS pur (pas de TS) car il doit aussi être chargé
 * tel quel par le navigateur ; ces déclarations servent uniquement au
 * typecheck (tsc) du Worker.
 */
declare module "*sections-render.mjs" {
  export function escapeHtml(value: unknown): string;
  export function safeHref(value: unknown): string;
  export function imageFitClass(value: unknown, fallback?: string): string;
  export function textAlignClass(value: unknown): string;
  export function visibleButtons(data: Record<string, unknown>, placement: string): Array<Record<string, unknown>>;
  export function renderCustomButton(item: Record<string, unknown>, fallbackClass?: string): string;
  export function renderTopLinksHtml(data: Record<string, unknown>): string;
  export function renderSocialLinksHtml(data: Record<string, unknown>): string;
  export function renderHeroStatsHtml(data: Record<string, unknown>): string;
  export function renderSectionsHtml(data: Record<string, unknown>): string;
  export function buildJsonLd(data: Record<string, unknown>, publicUrl: string): Record<string, unknown>;
  export function teamTier(item: Record<string, unknown>): 1 | 2 | 3;
  export function cfImageSrcset(url: string | undefined | null, widths: number[]): string | null;
}
