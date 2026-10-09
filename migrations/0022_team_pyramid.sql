-- Position d'un membre dans la présentation pyramidale de l'équipe.
-- 'auto' : déduite du rôle (président → sommet ; secrétaire, trésorier,
-- suppléant, vice-… → milieu ; le reste → base). Sinon : 'sommet', 'milieu'
-- ou 'base' pour forcer la position depuis l'admin.
ALTER TABLE team_members ADD COLUMN pyramid_level TEXT NOT NULL DEFAULT 'auto';

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('team_layout', 'pyramid');
