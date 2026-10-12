-- Point de cadrage des portraits de l'équipe (en % de l'image, 0–100).
-- Sert à `object-position` : le centre du visage reste au centre du rond,
-- quelle que soit la proportion de la photo d'origine (portrait 3:4, paysage…).
-- Défaut : centré horizontalement, légèrement au-dessus du milieu (là où se
-- trouve le visage sur la plupart des portraits).
ALTER TABLE team_members ADD COLUMN image_focus_x INTEGER NOT NULL DEFAULT 50;
ALTER TABLE team_members ADD COLUMN image_focus_y INTEGER NOT NULL DEFAULT 30;
