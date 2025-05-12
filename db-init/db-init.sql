-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE, -- Nouvelle colonne ajoutée
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- -----------------------------------------------------
-- Table: events
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Ajout du UNIQUE ici
    description TEXT,
    location VARCHAR(255),
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    total_tickets INTEGER NOT NULL,
    available_tickets INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_name ON events (name);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events (location); -- Ajout d'un index sur location

-- -----------------------------------------------------
-- Table: tickets
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    purchase_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets (ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets (event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets (user_id);

-- -----------------------------------------------------
-- Optional: Additional Constraints and Triggers
-- -----------------------------------------------------

-- Automatically update the 'updated_at' column on row update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for events table
CREATE TRIGGER trigger_update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for tickets table
CREATE TRIGGER trigger_update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- -----------------------------------------------------
-- Ajouter le droit admin à l'utilisateur lou-anne
-- -----------------------------------------------------

-- Créer l'utilisateur lou-anne avec le statut admin
INSERT INTO public.users
(email, hashed_password, first_name, last_name, is_admin) -- Inclure is_admin dans l'INSERT
VALUES
('lougautr@gmail.com', 'password', 'Lou-Anne', 'Gautherie', TRUE)
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------
-- Ajouter plusieurs événements d'artistes de rap français récents
-- -----------------------------------------------------

INSERT INTO public.events
(name, description, location, date, total_tickets, available_tickets)
VALUES
('PNL Live Tour 2025', 'PNL annonce sa tournée mondiale 2025 avec des dates à Paris, Lyon et Marseille.', 'Accor Arena - Paris', '2025-06-20 20:00:00', 1500, 1500),
('Jul Festival 2025', 'Jul revient avec un festival incontournable à Montpellier, réunissant plusieurs artistes de la scène rap.', 'Arena de Nîmes', '2025-07-15 19:30:00', 2000, 2000),
('SCH Concert Tour 2025', 'SCH en tournée à travers la France avec des performances spectaculaires et de nouveaux morceaux.', 'Olympia - Lyon', '2025-08-10 21:00:00', 1200, 1200),
('Booba World Tour 2025', 'Booba lance sa tournée mondiale avec des étapes majeures à Paris, Bruxelles et Genève.', 'Accor Arena - Paris', '2025-09-05 20:30:00', 2500, 2500),
('Nekfeu Live 2025', 'Nekfeu revient sur scène pour une série de concerts intimistes à Nantes et Strasbourg.', 'Atlantique - Nantes', '2025-10-12 19:00:00', 800, 800),
('Orelsan Experience Tour 2025', 'Orelsan présente son nouvelle tournée avec des concerts à Bordeaux, Lille et Nice.', 'Grand Théâtre - Bordeaux', '2025-11-18 20:00:00', 1800, 1800),
('Ninho Live 2025', 'Ninho en tournée en France avec des dates à Toulouse, Rennes et Dijon.', 'Zénith - Toulouse', '2025-12-03 21:00:00', 1600, 1600),
('Kaaris Tour 2025', 'Kaaris se déplace dans plusieurs villes françaises pour sa tournée 2025.', 'La Maroquinerie - Paris', '2025-12-15 20:00:00', 1400, 1400),
('Vald Performance 2025', 'Vald organise une série de performances uniques à Aix-en-Provence et Grenoble.', 'Silo - Aix-en-Provence', '2025-01-25 19:30:00', 900, 900),
('Damso Live 2025', 'Damso en tournée avec des concerts à Lyon, Nice et Montpellier.', 'Le Dôme Arena - Lyon', '2025-02-10 21:00:00', 2200, 2200)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------
-- Créer un ticket
-- -----------------------------------------------------
INSERT INTO public.tickets
(ticket_number, event_id, user_id, purchase_date)
VALUES
('1203', 1, 1, '2025-03-20 10:14:56')
ON CONFLICT (ticket_number) DO NOTHING;