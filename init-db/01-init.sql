-- Initialize the train_schedule database
-- This file will be executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE train_type AS ENUM ('express','metro', 'suburban', 'regional', 'intercity', 'high_speed');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- // maybe to create a table for the train types with additional fields like id, name, etc.
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(50) NOT NULL,
    train_type train_type NOT NULL,
    departure_station VARCHAR(100) NOT NULL,
    arrival_station VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration INTERVAL GENERATED ALWAYS AS (arrival_time - departure_time) STORED,
    price DECIMAL(10,2) NOT NULL,
    total_available_seats INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station VARCHAR(100) NOT NULL,
    time_arrival TIMESTAMP NULL,
    order_index INTEGER NOT NULL,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, route_id) -- Prevent duplicate favorites
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_routes_departure_station ON routes(departure_station);
CREATE INDEX IF NOT EXISTS idx_routes_arrival_station ON routes(arrival_station);
CREATE INDEX IF NOT EXISTS idx_routes_departure_time ON routes(departure_time);
CREATE INDEX IF NOT EXISTS idx_routes_train_type ON routes(train_type);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_station ON route_stops(station);
CREATE INDEX IF NOT EXISTS idx_route_stops_order ON route_stops(route_id, order_index);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Insert sample data
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$UA1cUU.UfV0AcFCQmgaPG.RdiMQTyTFtSik3h1YgE/u0LNLRmYW8i', 'admin'),
('user', '$2b$10$bfPykdeVdmscpeHPnoy4SufnwiGrZ7Z.7a4igTy1EMkN8E5ff4fiK', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO routes (train_number, train_type, departure_station, arrival_station, departure_time, arrival_time, price, total_available_seats) VALUES 
-- Intercity trains
('IC101', 'intercity', 'New York', 'Boston', '2024-01-15 08:00:00', '2024-01-15 12:30:00', 89.50, 200),
('IC202', 'intercity', 'Miami', 'Orlando', '2024-01-16 07:30:00', '2024-01-16 11:45:00', 65.00, 250),
('IC303', 'intercity', 'New York', 'Philadelphia', '2024-01-17 06:45:00', '2024-01-17 10:30:00', 75.25, 220),
('IC404', 'intercity', 'Chicago', 'Cleveland', '2024-01-18 09:15:00', '2024-01-18 15:20:00', 95.00, 180),
('IC505', 'intercity', 'Los Angeles', 'Las Vegas', '2024-01-19 14:30:00', '2024-01-19 20:45:00', 120.00, 160),
('IC606', 'intercity', 'Denver', 'Salt Lake City', '2024-01-20 11:00:00', '2024-01-20 18:30:00', 110.75, 190),
('IC707', 'intercity', 'Atlanta', 'Nashville', '2024-01-21 13:45:00', '2024-01-21 18:15:00', 85.50, 170),

-- Express trains
('EX205', 'express', 'Chicago', 'Detroit', '2024-01-15 14:15:00', '2024-01-15 19:45:00', 125.00, 150),
('EX306', 'express', 'Seattle', 'Portland', '2024-01-16 13:20:00', '2024-01-16 18:10:00', 95.50, 180),
('EX407', 'express', 'Chicago', 'Milwaukee', '2024-01-17 11:20:00', '2024-01-17 14:15:00', 85.00, 160),
('EX508', 'express', 'Boston', 'Montreal', '2024-01-18 16:30:00', '2024-01-18 22:45:00', 135.25, 140),
('EX609', 'express', 'Dallas', 'Houston', '2024-01-19 10:15:00', '2024-01-19 14:30:00', 75.00, 200),
('EX710', 'express', 'Phoenix', 'Tucson', '2024-01-20 08:45:00', '2024-01-20 12:20:00', 65.75, 120),

-- Regional trains
('REG301', 'regional', 'Los Angeles', 'San Diego', '2024-01-15 09:30:00', '2024-01-15 12:15:00', 45.75, 180),
('REG402', 'regional', 'San Francisco', 'Sacramento', '2024-01-16 12:00:00', '2024-01-16 15:30:00', 35.50, 160),
('REG503', 'regional', 'Portland', 'Eugene', '2024-01-17 15:20:00', '2024-01-17 18:45:00', 42.25, 140),
('REG604', 'regional', 'Minneapolis', 'St. Paul', '2024-01-18 07:30:00', '2024-01-18 09:15:00', 25.00, 100),
('REG705', 'regional', 'Tampa', 'St. Petersburg', '2024-01-19 11:45:00', '2024-01-19 13:20:00', 18.75, 80),
('REG806', 'regional', 'Austin', 'San Antonio', '2024-01-20 16:10:00', '2024-01-20 18:30:00', 32.50, 120),

-- High Speed trains
('HS401', 'high_speed', 'San Francisco', 'Los Angeles', '2024-01-15 16:00:00', '2024-01-15 21:30:00', 199.99, 300),
('HS502', 'high_speed', 'New York', 'Washington DC', '2024-01-16 08:30:00', '2024-01-16 12:45:00', 175.00, 280),
('HS603', 'high_speed', 'Boston', 'New York', '2024-01-17 14:15:00', '2024-01-17 17:30:00', 155.75, 250),
('HS704', 'high_speed', 'Chicago', 'St. Louis', '2024-01-18 10:45:00', '2024-01-18 15:20:00', 165.50, 220),
('HS805', 'high_speed', 'Miami', 'Jacksonville', '2024-01-19 13:20:00', '2024-01-19 18:10:00', 185.25, 190),

-- Suburban trains
('SUB101', 'suburban', 'New York', 'White Plains', '2024-01-15 07:30:00', '2024-01-15 08:45:00', 12.50, 300),
('SUB202', 'suburban', 'Chicago', 'Evanston', '2024-01-16 06:45:00', '2024-01-16 07:30:00', 8.75, 250),
('SUB303', 'suburban', 'Los Angeles', 'Pasadena', '2024-01-17 17:20:00', '2024-01-17 18:15:00', 9.25, 200),
('SUB404', 'suburban', 'Boston', 'Cambridge', '2024-01-18 08:15:00', '2024-01-18 08:45:00', 6.50, 180),
('SUB505', 'suburban', 'Philadelphia', 'Wilmington', '2024-01-19 15:30:00', '2024-01-19 16:20:00', 11.00, 160),
('SUB606', 'suburban', 'Seattle', 'Bellevue', '2024-01-20 12:10:00', '2024-01-20 12:50:00', 7.75, 140),
('SUB707', 'suburban', 'Denver', 'Boulder', '2024-01-21 09:40:00', '2024-01-21 10:25:00', 10.25, 120)
ON CONFLICT DO NOTHING;

-- Insert sample route stops
-- IC101: New York -> Boston (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Hartford', '2024-01-15 10:15:00', 1, id FROM routes WHERE train_number = 'IC101';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Springfield', '2024-01-15 11:30:00', 2, id FROM routes WHERE train_number = 'IC101';

-- IC202: Miami -> Orlando (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Fort Lauderdale', '2024-01-16 08:45:00', 1, id FROM routes WHERE train_number = 'IC202';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'West Palm Beach', '2024-01-16 09:30:00', 2, id FROM routes WHERE train_number = 'IC202';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Melbourne', '2024-01-16 10:15:00', 3, id FROM routes WHERE train_number = 'IC202';

-- IC303: New York -> Philadelphia (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Newark', '2024-01-17 08:15:00', 1, id FROM routes WHERE train_number = 'IC303';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Trenton', '2024-01-17 09:30:00', 2, id FROM routes WHERE train_number = 'IC303';

-- IC404: Chicago -> Cleveland (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Toledo', '2024-01-18 12:30:00', 1, id FROM routes WHERE train_number = 'IC404';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Sandusky', '2024-01-18 13:45:00', 2, id FROM routes WHERE train_number = 'IC404';

-- IC505: Los Angeles -> Las Vegas (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Barstow', '2024-01-19 16:20:00', 1, id FROM routes WHERE train_number = 'IC505';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Baker', '2024-01-19 17:30:00', 2, id FROM routes WHERE train_number = 'IC505';

-- EX205: Chicago -> Detroit (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Kalamazoo', '2024-01-15 16:45:00', 1, id FROM routes WHERE train_number = 'EX205';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Ann Arbor', '2024-01-15 18:20:00', 2, id FROM routes WHERE train_number = 'EX205';

-- EX306: Seattle -> Portland (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Tacoma', '2024-01-16 14:10:00', 1, id FROM routes WHERE train_number = 'EX306';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Olympia', '2024-01-16 15:25:00', 2, id FROM routes WHERE train_number = 'EX306';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Centralia', '2024-01-16 16:40:00', 3, id FROM routes WHERE train_number = 'EX306';

-- EX407: Chicago -> Milwaukee (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Evanston', '2024-01-17 12:10:00', 1, id FROM routes WHERE train_number = 'EX407';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Waukegan', '2024-01-17 13:05:00', 2, id FROM routes WHERE train_number = 'EX407';

-- EX508: Boston -> Montreal (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Burlington', '2024-01-18 19:15:00', 1, id FROM routes WHERE train_number = 'EX508';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Montpelier', '2024-01-18 20:30:00', 2, id FROM routes WHERE train_number = 'EX508';

-- EX609: Dallas -> Houston (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Waco', '2024-01-19 11:45:00', 1, id FROM routes WHERE train_number = 'EX609';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'College Station', '2024-01-19 12:30:00', 2, id FROM routes WHERE train_number = 'EX609';

-- REG301: Los Angeles -> San Diego (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Anaheim', '2024-01-15 10:15:00', 1, id FROM routes WHERE train_number = 'REG301';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Oceanside', '2024-01-15 11:30:00', 2, id FROM routes WHERE train_number = 'REG301';

-- REG402: San Francisco -> Sacramento (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Oakland', '2024-01-16 12:45:00', 1, id FROM routes WHERE train_number = 'REG402';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Davis', '2024-01-16 14:15:00', 2, id FROM routes WHERE train_number = 'REG402';

-- REG503: Portland -> Eugene (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Salem', '2024-01-17 16:30:00', 1, id FROM routes WHERE train_number = 'REG503';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Albany', '2024-01-17 17:15:00', 2, id FROM routes WHERE train_number = 'REG503';

-- HS401: San Francisco -> Los Angeles (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'San Jose', '2024-01-15 17:30:00', 1, id FROM routes WHERE train_number = 'HS401';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Fresno', '2024-01-15 19:15:00', 2, id FROM routes WHERE train_number = 'HS401';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Bakersfield', '2024-01-15 20:45:00', 3, id FROM routes WHERE train_number = 'HS401';

-- HS502: New York -> Washington DC (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Newark', '2024-01-16 09:15:00', 1, id FROM routes WHERE train_number = 'HS502';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Philadelphia', '2024-01-16 10:30:00', 2, id FROM routes WHERE train_number = 'HS502';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Baltimore', '2024-01-16 11:45:00', 3, id FROM routes WHERE train_number = 'HS502';

-- HS603: Boston -> New York (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Providence', '2024-01-17 15:30:00', 1, id FROM routes WHERE train_number = 'HS603';
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'New Haven', '2024-01-17 16:15:00', 2, id FROM routes WHERE train_number = 'HS603';

-- SUB101: New York -> White Plains (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Yonkers', '2024-01-15 08:00:00', 1, id FROM routes WHERE train_number = 'SUB101';

-- SUB202: Chicago -> Evanston (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Rogers Park', '2024-01-16 07:15:00', 1, id FROM routes WHERE train_number = 'SUB202';

-- SUB303: Los Angeles -> Pasadena (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Glendale', '2024-01-17 17:45:00', 1, id FROM routes WHERE train_number = 'SUB303';

-- SUB404: Boston -> Cambridge (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Somerville', '2024-01-18 08:30:00', 1, id FROM routes WHERE train_number = 'SUB404';

-- SUB505: Philadelphia -> Wilmington (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Chester', '2024-01-19 15:50:00', 1, id FROM routes WHERE train_number = 'SUB505';

-- SUB606: Seattle -> Bellevue (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Mercer Island', '2024-01-20 12:30:00', 1, id FROM routes WHERE train_number = 'SUB606';

-- SUB707: Denver -> Boulder (with stops)
INSERT INTO route_stops (station, time_arrival, order_index, route_id) 
SELECT 'Westminster', '2024-01-21 10:00:00', 1, id FROM routes WHERE train_number = 'SUB707';

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON route_stops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();