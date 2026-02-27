CREATE TABLE IF NOT EXISTS alerts (
  id          TEXT PRIMARY KEY,
  keyword     TEXT NOT NULL,
  min_price   INTEGER,
  max_price   INTEGER,
  sites       TEXT NOT NULL DEFAULT 'daangn,bunjang,joonggonara',
  created_at  TEXT NOT NULL
);
