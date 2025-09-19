-- init_db.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL -- 'client' or 'driver' or 'admin'
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'created',
  pickup_location TEXT,
  dropoff_location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  amount NUMERIC(10,2),
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add a test user
INSERT INTO users (username, email, password_hash, role)
VALUES ('client', 'client@gmail.com', 'client', 'client')
ON CONFLICT DO NOTHING;
