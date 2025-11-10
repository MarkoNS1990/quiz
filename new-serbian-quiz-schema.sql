-- Nova struktura za pitanja sa slobodnim odgovorima
-- Prvo obriši staru tabelu i napravi novu

DROP TABLE IF EXISTS quiz_questions CASCADE;

CREATE TABLE quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('lako', 'srednje', 'teško')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Quiz questions policies: Everyone can read
CREATE POLICY "Quiz questions are viewable by everyone"
  ON quiz_questions FOR SELECT
  USING (true);

-- Dodaj srpska pitanja
INSERT INTO quiz_questions (question, answer, hint, category, difficulty) VALUES
-- Geografija
('Koji je glavni grad Srbije?', 'Beograd', 'Grad na ušću Save i Dunava', 'Geografija', 'lako'),
('Koja je najduža reka u Srbiji?', 'Dunav', 'Protice kroz 10 zemalja', 'Geografija', 'lako'),
('Koji je najveći grad u Vojvodini?', 'Novi Sad', 'Glavni grad Vojvodine', 'Geografija', 'lako'),
('Koja planina je najviša u Srbiji?', 'Midžor', 'Nalazi se na granici sa Bugarskom', 'Geografija', 'teško'),
('U kom gradu se nalazi Petrovaradin?', 'Novi Sad', 'Poznat po tvrđavi', 'Geografija', 'srednje'),
('Koji grad se zove Niška Banja?', 'Niš', 'Treći po veličini grad', 'Geografija', 'srednje'),

-- Istorija
('Ko je bio Prvi srpski kralj?', 'Stefan Prvovenčani', 'Sin Stefana Nemanje', 'Istorija', 'srednje'),
('U kojoj godini je Srbija postala nezavisna od Turske?', '1878', 'Berlinski kongres', 'Istorija', 'teško'),
('Ko je bio car Dušan?', 'Stefan Dušan', 'Najmoćniji srpski vladar', 'Istorija', 'srednje'),
('Koji kralj je izgradio Studenicu?', 'Stefan Nemanja', 'Osnivač dinastije Nemanjića', 'Istorija', 'srednje'),

-- Kultura i Književnost
('Ko je napisao Na Drini ćuprija?', 'Ivo Andrić', 'Dobitnik Nobelove nagrade', 'Kultura', 'lako'),
('Ko je bio Tesla?', 'Nikola Tesla', 'Pronalazač iz Smiljana', 'Nauka', 'lako'),
('Koji je nacionalni instrument Srbije?', 'Gusle', 'Žičani instrument', 'Kultura', 'srednje'),
('Ko je napisao Seobe?', 'Miloš Crnjanski', 'Srpski pisac 20. veka', 'Kultura', 'teško'),
('Ko je komponovao Tamo daleko?', 'Đorđe Marinković', 'Popularna ratna pesma', 'Kultura', 'teško'),

-- Sport
('Koji teniser je osvojio najviše Grend Slem titula?', 'Novak Đoković', 'Najbolji teniser svih vremena', 'Sport', 'lako'),
('U kom sportu je Vlade Divac bio poznat?', 'Košarka', 'Igrao u NBA', 'Sport', 'lako'),
('Ko je bio Dejan Stanković?', 'Fudbaler', 'Kapiten reprezentacije', 'Sport', 'srednje'),
('Koji klub je osvojio Kup UEFA 1981?', 'Crvena Zvezda', 'Beogradski klub', 'Sport', 'srednje'),

-- Hrana i Tradicija
('Koje je najpoznatije srpsko jelo?', 'Ćevapi', 'Malo prženo meso', 'Kultura', 'lako'),
('Od čega se pravi ajvar?', 'Paprika', 'Crveno povrće', 'Kultura', 'lako'),
('Koja je najpoznatija srpska rakija?', 'Šljivovica', 'Pravi se od voća', 'Kultura', 'lako'),
('Kako se zove srpski sir u salamuri?', 'Kajmak', 'Mlečni proizvod', 'Kultura', 'srednje'),

-- Priroda
('Koji je najstariji nacionalni park u Srbiji?', 'Fruška Gora', 'Planina u Vojvodini', 'Priroda', 'srednje'),
('Koja reka pravi kanjon Đerdap?', 'Dunav', 'Najduža reka u Srbiji', 'Priroda', 'srednje'),
('Kako se zove planina kod Niša?', 'Suva Planina', 'Poznata po stočarstvu', 'Priroda', 'teško'),

-- Jezik i Kultura
('Koliko slova ima srpska ćirilica?', '30', 'Između 25 i 35', 'Jezik', 'srednje'),
('Koja je valuta u Srbiji?', 'Dinar', 'RSD', 'Opšte', 'lako'),
('Ko je reformator srpskog jezika?', 'Vuk Karadžić', 'Napiši kao što govoriš', 'Kultura', 'srednje'),

-- Zabava i Moderna Kultura  
('Koji film je Kusturica snimio 1995?', 'Underground', 'Osvojio Zlatnu palmu', 'Kultura', 'teško'),
('Ko peva Đurađ Đura?', 'Šaban Šaulić', 'Kralj narodne muzike', 'Kultura', 'srednje');

