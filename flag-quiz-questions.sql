-- Example quiz questions with country flag images
-- Using free flag images from flagcdn.com (CDN for country flags)

INSERT INTO quiz_questions (question, answer, image_url, category, difficulty) VALUES
-- Easy flags (well-known countries)
('Koja je ovo zastava?', 'Srbija', 'https://flagcdn.com/w320/rs.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Nemacka', 'https://flagcdn.com/w320/de.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Francuska', 'https://flagcdn.com/w320/fr.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Italija', 'https://flagcdn.com/w320/it.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Spanija', 'https://flagcdn.com/w320/es.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Velika Britanija', 'https://flagcdn.com/w320/gb.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'SAD', 'https://flagcdn.com/w320/us.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Rusija', 'https://flagcdn.com/w320/ru.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Kina', 'https://flagcdn.com/w320/cn.png', 'Zastave', 'lako'),
('Koja je ovo zastava?', 'Japan', 'https://flagcdn.com/w320/jp.png', 'Zastave', 'lako'),

-- Medium flags (neighboring countries)
('Koja je ovo zastava?', 'Hrvatska', 'https://flagcdn.com/w320/hr.png', 'Zastave', 'srednje'),
('Koja je oto zastava?', 'Bosna i Hercegovina', 'https://flagcdn.com/w320/ba.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Crna Gora', 'https://flagcdn.com/w320/me.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Makedonija', 'https://flagcdn.com/w320/mk.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Albanija', 'https://flagcdn.com/w320/al.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Grcka', 'https://flagcdn.com/w320/gr.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Rumunija', 'https://flagcdn.com/w320/ro.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Bugarska', 'https://flagcdn.com/w320/bg.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Madjarska', 'https://flagcdn.com/w320/hu.png', 'Zastave', 'srednje'),
('Koja je ovo zastava?', 'Austrija', 'https://flagcdn.com/w320/at.png', 'Zastave', 'srednje'),

-- Hard flags (less known countries)
('Koja je ovo zastava?', 'Slovenija', 'https://flagcdn.com/w320/si.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Slovacka', 'https://flagcdn.com/w320/sk.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Ceska', 'https://flagcdn.com/w320/cz.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Poljska', 'https://flagcdn.com/w320/pl.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Ukrajina', 'https://flagcdn.com/w320/ua.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Svedska', 'https://flagcdn.com/w320/se.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Norveska', 'https://flagcdn.com/w320/no.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Finska', 'https://flagcdn.com/w320/fi.png', 'Zastave', 'teško'),
('Koja je ovo zastava?', 'Danska', 'https://flagcdn.com/w320/dk.png', 'Zastave', 'teško'),
('Koja je oto zastava?', 'Holandija', 'https://flagcdn.com/w320/nl.png', 'Zastave', 'teško');

-- NOTE: flagcdn.com provides free flag images in various sizes:
-- w20, w40, w80, w160, w320, w640, w1280
-- Format: https://flagcdn.com/{size}/{country-code}.png
-- Example: https://flagcdn.com/w320/rs.png (Serbia flag at 320px width)

