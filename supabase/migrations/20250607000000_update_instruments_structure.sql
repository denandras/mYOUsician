-- Migration to update instruments table structure with Hungarian names and rankings
-- Updated: 2025-06-07

-- First, backup existing data (if needed)
-- CREATE TABLE instruments_backup AS SELECT * FROM instruments;

-- Drop existing columns that are not needed
ALTER TABLE instruments 
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;

-- Add new columns to instruments table
ALTER TABLE instruments 
ADD COLUMN IF NOT EXISTS category_rank INTEGER,
ADD COLUMN IF NOT EXISTS instrument_rank INTEGER;

-- Update the existing instruments table structure
-- Note: name_hun and category_hun already exist based on the types

-- Clear existing data and insert new structured data
TRUNCATE TABLE instruments;

-- Insert string instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('violin', 'hegedű', 'strings', 'vonós', 1, 1),
('viola', 'brácsa', 'strings', 'vonós', 1, 2),
('cello', 'cselló', 'strings', 'vonós', 1, 3),
('double bass', 'bőgő', 'strings', 'vonós', 1, 4);

-- Insert woodwinds
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('flute', 'fuvola', 'woodwinds', 'fafúvós', 2, 1),
('recorder', 'furulya', 'woodwinds', 'fafúvós', 2, 2),
('oboe', 'oboa', 'woodwinds', 'fafúvós', 2, 3),
('clarinet', 'klarinét', 'woodwinds', 'fafúvós', 2, 4),
('bassoon', 'fagott', 'woodwinds', 'fafúvós', 2, 5),
('saxophone', 'szaxofon', 'woodwinds', 'fafúvós', 2, 6);
 
-- Insert brass instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('trumpet', 'trombita', 'brass', 'rézfúvós', 3, 1),
('trombone', 'harsona', 'brass', 'rézfúvós', 3, 2),
('french horn', 'kürt', 'brass', 'rézfúvós', 3, 3),
('euphonium', 'eufónium', 'brass', 'rézfúvós', 3, 4),
('tuba', 'tuba', 'brass', 'rézfúvós', 3, 5);

-- Insert percussive instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('orchestral percussion', 'zenekari ütőhangszerek', 'percussive instruments', 'ütőhangszer', 4, 1),
('drum set', 'dobszerkó', 'percussive instruments', 'ütőhangszer', 4, 2);

-- Insert chordal instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('piano', 'zongora', 'chordal', 'akkordikus', 5, 1),
('synthesizer', 'szintetizátor', 'chordal', 'akkordikus', 5, 2),
('organ', 'orgona', 'chordal', 'akkordikus', 5, 3),
('harpsichord', 'csembaló', 'chordal', 'akkordikus', 5, 4),
('harp', 'hárfa', 'chordal', 'akkordikus', 5, 5),
('accordion', 'harmonika', 'chordal', 'akkordikus', 5, 6),
('guitar', 'gitár', 'chordal', 'akkordikus', 5, 7);

-- Insert singing instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('soprano', 'szoprán choir', 'singing', 'ének', 6, 1),
('soprano solo', 'szoprán szóló', 'singing', 'ének', 6, 2),
('mezzo', 'mezzo choir', 'singing', 'ének', 6, 3),
('mezzo solo', 'mezzo szóló', 'singing', 'ének', 6, 4),
('alto choir', 'alt', 'singing', 'ének', 6, 5),
('alto solo', 'alt szóló', 'singing', 'ének', 6, 6),
('baritone choir', 'bariton', 'singing', 'ének', 6, 7),
('baritone solo', 'bariton szóló', 'singing', 'ének', 6, 8),
('tenore choir', 'tenor', 'singing', 'ének', 6, 9),
('tenore solo', 'tenor szóló', 'singing', 'ének', 6, 10),
('bass choir', 'basszus', 'singing', 'ének', 6, 11),
('bass solo', 'basszus szóló', 'singing', 'ének', 6, 12);

-- Insert theory instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('choir conducting', 'karvezetés', 'theory', 'elméleti', 7, 1),
('orchestral conducting', 'karmester', 'theory', 'elméleti', 7, 2),
('solfeggio', 'szolfézs', 'theory', 'elméleti', 7, 3),
('composition', 'zeneszerzés', 'theory', 'elméleti', 7, 4);

-- Insert folk instruments
INSERT INTO instruments (name, name_hun, category, category_hun, category_rank, instrument_rank) VALUES
('folk singing', 'népi ének', 'folk', 'népi', 8, 1),
('zither', 'citera', 'folk', 'népi', 8, 2),
('lute', 'koboz', 'folk', 'népi', 8, 3),
('tambura', 'tambura', 'folk', 'népi', 8, 4),
('struck gardon', 'ütőgardon', 'folk', 'népi', 8, 5);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instruments_category_rank ON instruments(category_rank, instrument_rank);
CREATE INDEX IF NOT EXISTS idx_instruments_category ON instruments(category);
CREATE INDEX IF NOT EXISTS idx_instruments_name ON instruments(name);
