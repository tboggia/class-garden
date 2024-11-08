import initSqlJs, { Database } from 'sql.js';
import { Student, ClassSection } from '../types';

let db: Database | null = null;

async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('classroomDb', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('sqliteDb');
    };
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(['sqliteDb'], 'readonly');
    const store = transaction.objectStore('sqliteDb');
    const request = store.get('database');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(['sqliteDb'], 'readwrite');
    const store = transaction.objectStore('sqliteDb');
    const request = store.put(data, 'database');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing database from IndexedDB
  const savedData = await loadFromIndexedDB();
  if (savedData) {
    db = new SQL.Database(savedData);
  } else {
    // Create new database if none exists
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        participation_points INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        period_number INTEGER NOT NULL
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

      INSERT INTO grid_settings (id, rows, columns) VALUES (1, 3, 8);
    `);
  }

  return db;
}

async function persistDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    await saveToIndexedDB(data);
  } catch (error) {
    console.error('Failed to persist database:', error);
  }
}

export const dbService = {
  async getAllStudents(): Promise<Student[]> {
    if (!db) return [];
    const result = db.exec('SELECT * FROM students');
    if (!result.length) return [];

    return result[0].values.map((row) => ({
      id: row[0] as string,
      name: row[1] as string,
      photoUrl: row[2] as string,
      participationPoints: row[3] as number,
    }));
  },

  async createStudent(student: Student): Promise<void> {
    if (!db) return;
    db.run(
      'INSERT INTO students (id, name, photo_url, participation_points) VALUES (?, ?, ?, ?)',
      [student.id, student.name, student.photoUrl, student.participationPoints]
    );
    await persistDatabase();
  },

  async updateStudent(student: Student): Promise<void> {
    if (!db) return;
    db.run(
      'UPDATE students SET name = ?, photo_url = ?, participation_points = ? WHERE id = ?',
      [student.name, student.photoUrl, student.participationPoints, student.id]
    );
    await persistDatabase();
  },

  async getAllSections(): Promise<ClassSection[]> {
    if (!db) return [];
    const sections = db.exec('SELECT * FROM sections');
    const seatAssignments = db.exec('SELECT * FROM seat_assignments');

    if (!sections.length) return [];

    return sections[0].values.map((row) => {
      const sectionId = row[0] as string;
      const assignments = seatAssignments.length
        ? seatAssignments[0].values
            .filter((assignment) => assignment[1] === sectionId)
            .reduce(
              (acc, assignment) => ({
                ...acc,
                [assignment[0]]: assignment[2],
              }),
              {}
            )
        : {};

      return {
        id: sectionId,
        periodNumber: row[1] as number,
        seatAssignments: assignments,
      };
    });
  },

  async createSection(section: ClassSection): Promise<void> {
    if (!db) return;
    db.run('INSERT INTO sections (id, period_number) VALUES (?, ?)', [
      section.id,
      section.periodNumber,
    ]);

    Object.entries(section.seatAssignments).forEach(
      ([studentId, seatIndex]) => {
        db.run(
          'INSERT INTO seat_assignments (student_id, section_id, seat_index) VALUES (?, ?, ?)',
          [studentId, section.id, seatIndex]
        );
      }
    );

    await persistDatabase();
  },

  async updateSection(section: ClassSection): Promise<void> {
    if (!db) return;
    db.run('UPDATE sections SET period_number = ? WHERE id = ?', [
      section.periodNumber,
      section.id,
    ]);

    db.run('DELETE FROM seat_assignments WHERE section_id = ?', [section.id]);

    Object.entries(section.seatAssignments).forEach(
      ([studentId, seatIndex]) => {
        db.run(
          'INSERT INTO seat_assignments (student_id, section_id, seat_index) VALUES (?, ?, ?)',
          [studentId, section.id, seatIndex]
        );
      }
    );

    await persistDatabase();
  },

  async deleteSection(id: string): Promise<void> {
    if (!db) return;
    db.run('DELETE FROM sections WHERE id = ?', [id]);
    db.run('DELETE FROM seat_assignments WHERE section_id = ?', [id]);
    await persistDatabase();
  },

  async updateGrid(rows: number, columns: number): Promise<void> {
    if (!db) return;
    db.run('UPDATE grid_settings SET rows = ?, columns = ? WHERE id = 1', [
      rows,
      columns,
    ]);
    await persistDatabase();
  },
};
