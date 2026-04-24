-- Seed de catégories (schéma kultivaprix)
insert into kultivaprix.categories (slug, name, icon, sort_order) values
  ('graines',          'Graines',          '🌱', 10),
  ('plants',           'Plants',           '🪴', 20),
  ('bulbes',           'Bulbes',           '🧄', 30),
  ('outils',           'Outils de jardin', '🪓', 40),
  ('terreau-engrais',  'Terreau & engrais','🌾', 50),
  ('serres-abris',     'Serres & abris',   '🏡', 60),
  ('arrosage',         'Arrosage',         '💧', 70),
  ('protection',       'Protection',       '🐛', 80)
on conflict (slug) do nothing;

-- Sous-catégories graines
with parent as (select id from kultivaprix.categories where slug = 'graines')
insert into kultivaprix.categories (slug, name, icon, parent_id, sort_order)
select s, n, i, parent.id, o from parent, (values
  ('graines-tomates',   'Graines de tomates',   '🍅', 1),
  ('graines-salades',   'Graines de salades',   '🥬', 2),
  ('graines-courges',   'Graines de courges',   '🎃', 3),
  ('graines-aromates',  'Graines aromatiques',  '🌿', 4),
  ('graines-fleurs',    'Graines de fleurs',    '🌸', 5)
) as v(s, n, i, o)
on conflict (slug) do nothing;
