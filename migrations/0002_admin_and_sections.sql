CREATE TABLE IF NOT EXISTS landing_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  password_changed_at TEXT
);

INSERT OR IGNORE INTO landing_sections (section_key, title, subtitle, enabled, display_order) VALUES
  ('story', 'Le club', 'Identité, méthode et esprit du club.', 1, 1),
  ('schedule', 'Planning', 'Les séances de la semaine.', 1, 2),
  ('team', 'Équipe', 'Encadrement et progression sportive.', 1, 3),
  ('pricing', 'Tarifs', 'Tarifs et informations utiles.', 1, 4),
  ('highlights', 'Temps forts', 'Stages, matériel et progression.', 1, 5),
  ('gallery', 'Galerie', 'Ambiance et images du club.', 1, 6),
  ('contact', 'Contact', 'Formulaire et coordonnées du club.', 1, 7);

INSERT OR IGNORE INTO admin_users (id, email, display_name, password_hash, active)
VALUES (
  'admin-default',
  'club@americanfullfightingbons.fr',
  'Administration AFFBC',
  'pbkdf2_sha256$100000$d3kv9TSSHiguxsne95Cb9A$Cwsbh1jTP067dfyQRpb5c7OGj54tNb45QrWu8j_fNLY',
  1
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('hero_primary_label', 'Préinscription'),
  ('hero_primary_href', 'https://inscription.americanfullfightingbons.fr/'),
  ('hero_secondary_label', 'Voir le calendrier'),
  ('hero_secondary_href', 'https://calendrier.americanfullfightingbons.fr/'),
  ('footer_note', 'American Full Fighting Bons en Chablais');
