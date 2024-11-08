const Database = require('better-sqlite3');

function migrate() {
  const db = new Database('classroom.db');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      participation_points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      period_number INTEGER NOT NULL,
    );

    CREATE TABLE IF NOT EXISTS seat_assignments (
      student_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      seat_index INTEGER NOT NULL,
      PRIMARY KEY (student_id, section_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS grid_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      rows INTEGER NOT NULL,
      columns INTEGER NOT NULL
    );

  `);

  console.log('Database migration completed successfully');
}

migrate();
