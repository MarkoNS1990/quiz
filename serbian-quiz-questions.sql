-- Srpska pitanja za kviz
-- Dodaj ova pitanja u quiz_questions tabelu

INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
-- Geografija
('Koji je glavni grad Srbije?', 'Novi Sad', 'Niš', 'Beograd', 'Kragujevac', 'C', 'Geografija', 'easy'),
('Koja je najduža reka u Srbiji?', 'Sava', 'Dunav', 'Morava', 'Drina', 'B', 'Geografija', 'easy'),
('Koji je najveći grad u Vojvodini?', 'Subotica', 'Novi Sad', 'Zrenjanin', 'Pančevo', 'B', 'Geografija', 'easy'),
('Koja planina se nalazi između Srbije i Bugarske?', 'Kopaonik', 'Rtanj', 'Stara Planina', 'Fruška Gora', 'C', 'Geografija', 'medium'),

-- Istorija
('U kojoj godini je osnovana Kalemegdanska tvrđava?', '1. vek', '2. vek', '3. vek', '4. vek', 'B', 'Istorija', 'hard'),
('Ko je bio Prvi srpski kralj?', 'Stefan Nemanja', 'Stefan Prvovenčani', 'Stefan Dušan', 'Lazar Hrebeljanović', 'B', 'Istorija', 'medium'),
('U kojoj godini je Srbija postala nezavisna od Turske?', '1867', '1878', '1882', '1912', 'B', 'Istorija', 'medium'),

-- Kultura
('Ko je napisao "Na Drini ćuprija"?', 'Ivo Andrić', 'Miloš Crnjanski', 'Dobrica Ćosić', 'Borislav Pekić', 'A', 'Kultura', 'easy'),
('Koji je nacionalni instrument Srbije?', 'Harmonika', 'Gusle', 'Frula', 'Tamburica', 'B', 'Kultura', 'medium'),
('Ko je bio poznat kao "Tesla"?', 'Nikola Tesla', 'Mihajlo Pupin', 'Milutin Milanković', 'Jovan Cvijić', 'A', 'Nauka', 'easy'),

-- Sport
('Koji srpski teniser je osvojio najviše Grend Slem titula?', 'Novak Đoković', 'Ana Ivanović', 'Jelena Janković', 'Nenad Zimonjić', 'A', 'Sport', 'easy'),
('U kom sportu je Vlade Divac bio poznat?', 'Fudbal', 'Košarka', 'Vaterpolo', 'Odbojka', 'B', 'Sport', 'easy'),

-- Opšta znanja
('Koliko ima букава u srpskoj ćirilici?', '28', '30', '32', '33', 'B', 'Jezik', 'medium'),
('Koja je valuta u Srbiji?', 'Evro', 'Dinar', 'Kuna', 'Marka', 'B', 'Opšte', 'easy'),
('Koliko ima opština u Beogradu?', '15', '17', '19', '21', 'B', 'Geografija', 'hard'),

-- Priroda
('Koja je najviša planina u Srbiji?', 'Kopaonik', 'Rtanj', 'Midžor', 'Đavolja Varoš', 'C', 'Priroda', 'medium'),
('Koji nacionalni park je najstariji u Srbiji?', 'Tara', 'Fruška Gora', 'Kopaonik', 'Đerdap', 'B', 'Priroda', 'medium'),

-- Hrana
('Koje je tradicionalno srpsko jelo?', 'Pizza', 'Ćevapi', 'Sushi', 'Burger', 'B', 'Kultura', 'easy'),
('Od čega se pravi ajvar?', 'Paradajz', 'Paprika', 'Krastavac', 'Kupus', 'B', 'Kultura', 'easy'),
('Koja je najpoznatija srpska rakija?', 'Vodka', 'Šljivovica', 'Viski', 'Rom', 'B', 'Kultura', 'easy');

