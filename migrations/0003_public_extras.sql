CREATE TABLE IF NOT EXISTS resource_cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_href TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS equipment_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_href TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO landing_sections (section_key, title, subtitle, enabled, display_order) VALUES
  ('spotlight', 'À la une', 'Stage, actualité ou message fort du club.', 1, 1),
  ('resources', 'Membre actif', 'Accès utiles pour la saison.', 1, 6),
  ('equipment', 'Équipement', 'Protections et matériel recommandés.', 1, 7),
  ('sponsor', 'Mécénat', 'Soutenir le club et ses combattants.', 1, 9);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('spotlight_intro', 'Les rendez-vous importants de la saison sont mis en avant ici pour rester visibles au premier coup d''oeil.'),
  ('spotlight_date', 'Samedi 18 avril 2026'),
  ('spotlight_title', 'Stage Christian Battesti'),
  ('spotlight_body', 'Venez découvrir ou perfectionner votre technique lors d''un stage encadré par Christian Battesti, ancien officier du RAID, pionnier du full contact et multiple champion du monde. Tarif : 25 €.'),
  ('spotlight_background_image', 'https://images.unsplash.com/photo-1517438984742-1262db08379e?auto=format&fit=crop&w=1800&q=80'),
  ('spotlight_cta_label', 'Voir le calendrier'),
  ('spotlight_cta_href', 'https://calendrier.americanfullfightingbons.fr/'),
  ('spotlight_secondary_label', 'Dossier d''inscription'),
  ('spotlight_secondary_href', 'https://inscription.americanfullfightingbons.fr/'),
  ('schedule_intro', 'Des créneaux réguliers pour installer de bons repères techniques et physiques tout au long de la semaine.'),
  ('team_intro', 'Un encadrement identifié, présent sur les séances et engagé dans la progression de chaque pratiquant.'),
  ('pricing_intro_synced', 'Tarifs alignés avec l''inscription en ligne.'),
  ('pricing_intro_local', 'Tarifs actuellement affichés par le club.'),
  ('highlights_intro', 'Stages, matériel, progression et moments clés de la saison restent accessibles sans alourdir la navigation.'),
  ('gallery_intro', 'Une sélection d''images pour retrouver l''énergie du club, le rythme des séances et les temps forts de la saison.'),
  ('resources_intro', 'Retrouvez en un coup d''oeil les accès utiles pour préparer et suivre votre saison.'),
  ('equipment_intro', 'Le club recommande quelques essentiels pour s''entraîner dans de bonnes conditions et en sécurité.'),
  ('sponsor_intro', 'Le soutien des adhérents, proches et partenaires aide le club à mieux équiper ses pratiquants et à accompagner ses projets.'),
  ('sponsor_title', 'Devenez notre mécène'),
  ('sponsor_body', 'Que vous soyez adhérent, entreprise ou amateur de la discipline, votre soutien nous aide à proposer de meilleurs équipements et à soutenir nos combattants. Un reçu peut permettre une déduction allant jusqu''à 66% du montant du don, dans les limites prévues par la loi.'),
  ('sponsor_cta_label', 'Faire un don'),
  ('sponsor_cta_href', 'mailto:club@americanfullfightingbons.fr?subject=Demande%20de%20mecenat%20AFFBC'),
  ('contact_intro', 'Pour une question, une séance d''essai ou une demande sur la saison, le club peut être joint directement ici.'),
  ('contact_map_embed_url', 'https://www.google.com/maps?q=Gymnase%20Intercommunal%20des%20Voirons%2C%2074890%20Bons-en-Chablais&z=15&output=embed'),
  ('contact_details_title', 'Coordonnées'),
  ('contact_email_title', 'E-mail'),
  ('contact_phone_title', 'Téléphone'),
  ('contact_address_title', 'Adresse'),
  ('contact_form_title', 'Envoyer un message'),
  ('contact_name_label', 'Nom'),
  ('contact_email_label', 'E-mail'),
  ('contact_phone_label', 'Téléphone'),
  ('contact_message_label', 'Message'),
  ('contact_submit_label', 'Envoyer'),
  ('inpi_note', 'Logo déposé INPI 20243002');

INSERT OR IGNORE INTO resource_cards (id, title, description, cta_label, cta_href, image_url, display_order) VALUES
  ('resource-decathlon', 'Préparer ses achats', 'Un accès simple pour commander ou compléter son équipement personnel.', 'Ouvrir Décathlon', 'https://www.decathlon.fr/', '', 1),
  ('resource-boutique', 'Retrouver la boutique du club', 'Textiles, accessoires et produits utiles pour la saison.', 'Voir la boutique', 'https://boutique.americanfullfightingbons.fr/', '', 2),
  ('resource-techniques', 'Suivre sa progression', 'Consultez les repères techniques utiles pour les passages de grade et le travail personnel.', 'Voir les ressources', 'https://gestion.americanfullfightingbons.fr/', '', 3);

INSERT OR IGNORE INTO equipment_items (id, title, description, cta_label, cta_href, image_url, display_order) VALUES
  ('equip-sac', 'Sac de sport', 'Pour transporter facilement tenue, protections et accessoires.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 1),
  ('equip-gants', 'Gants de boxe', 'La base pour les ateliers techniques, les frappes et les oppositions.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 2),
  ('equip-sous-gants', 'Sous-gants', 'Un bon complément pour le confort, l''hygiène et la durée de vie des gants.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 3),
  ('equip-protege', 'Protège-tibias et pieds', 'Recommandés pour le travail des jambes, des déplacements et des mises en situation.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 4),
  ('equip-casque', 'Casque de protection', 'Apporte davantage de sécurité pendant les phases de sparring.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 5),
  ('equip-dent', 'Protège-dents', 'Indispensable dès que l''opposition et les exercices engagés montent en intensité.', 'Voir la sélection', 'https://boutique.americanfullfightingbons.fr/', '', 6);
