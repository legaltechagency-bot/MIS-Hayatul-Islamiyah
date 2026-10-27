CREATE TABLE school_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data JSONB NOT NULL);
CREATE INDEX school_records_kind ON school_records(kind);
