import { useState } from 'react';
import type {
  Student,
  Class,
  LayoutSettings
} from '../types/models';
import { assignSeatInGrid } from '../utils/seating';

interface Props {
  students: Student[] | [];
  classes: Class[] | [];
  layout: LayoutSettings;
  selectedClassId: number | 0;
  onUpdateLayout: (layout: LayoutSettings) => void;
  onImportStudents: (students: Student[] | [], classes: Class[] | []) => void;
}

interface CSVRecord {
  name: string;
  class?: string;
  classId?: number;
  row?: string;
  column?: string;
  spokeUpCount?: string;
  disruptiveCount?: string;
}

/** Convert "Last, First M" or "*Last, First M" to "First M L" */
function formatAeriesName(raw: string): string {
  const cleaned = raw.replace(/^\*/, '').trim();
  const commaIndex = cleaned.indexOf(',');
  if (commaIndex === -1) return cleaned;

  // const last = cleaned.slice(0, commaIndex).trim();
  const last = cleaned.slice(0, 1).trim();
  const firstMiddle = cleaned.slice(commaIndex + 1).trim();
  return `${firstMiddle} ${last}`;
}

function createImportContext(students: Student[], classes: Class[], layout: LayoutSettings) {
  let importedClasses: Class[] = [];
  let classesLoop = [...classes];
  let currentLayout = { ...layout, columns: Math.max(Number(layout.columns), 8) };
  let allStudents = [...students];
  let _nextId = allStudents.length > 0 ? Math.max(...allStudents.map(s => s.id)) + 1 : 1;

  return {
    get importedClasses() { return importedClasses; },
    get currentLayout() { return currentLayout; },
    get classesLoop() { return classesLoop; },
    nextId() { return _nextId++; },

    addNewClass(name: string): Class {
      const newClass: Class = {
        id: classesLoop.length > 0 ? Math.max(...classesLoop.map(c => c.id)) + 1 : 1,
        name,
      };
      importedClasses = [...importedClasses, newClass];
      classesLoop = [...classesLoop, newClass];
      return newClass;
    },

    assignSeat(classId: number): { row: number; column: number } {
      const result = assignSeatInGrid(allStudents, classId, currentLayout);
      currentLayout = result.layout;
      return result.cell;
    },

    trackStudent(student: Student) {
      allStudents = [...allStudents, student];
    },

    ensureFits(row: number, column: number) {
      const neededRows = row + 1;
      const neededCols = column + 1;
      if (neededRows > Number(currentLayout.rows) || neededCols > Number(currentLayout.columns)) {
        currentLayout = {
          ...currentLayout,
          rows: Math.max(Number(currentLayout.rows), neededRows),
          columns: Math.max(Number(currentLayout.columns), neededCols),
        };
      }
    },

    updateStudent(id: number, student: Student) {
      allStudents = allStudents.map(s => s.id === id ? student : s);
    },
  };
}

export default function ImportStudents({
  students,
  classes,
  selectedClassId,
  layout,
  onUpdateLayout,
  onImportStudents,
}: Props) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('idle');
    setImportMessage('');

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: null,
          });
          handleAeriesXLS(rows);
        } catch (err) {
          console.error('Failed to parse Excel file:', err);
          setImportStatus('error');
          setImportMessage('Failed to read Excel file. Please check the file format.');
        }
      };
      reader.onerror = () => {
        setImportStatus('error');
        setImportMessage('Failed to read the file.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          handleCSVImport(text);
        } catch (err) {
          console.error('Failed to parse CSV file:', err);
          setImportStatus('error');
          setImportMessage('Failed to read CSV file. Please check the file format.');
        }
      };
      reader.onerror = () => {
        setImportStatus('error');
        setImportMessage('Failed to read the file.');
      };
      reader.readAsText(file);
    }

    // Reset the input so the same file can be re-imported if needed
    e.target.value = '';
  };

  const handleAeriesXLS = (rows: (string | number | null)[][]) => {
    const studentsByName = new Map<string, Student>();
    const ctx = createImportContext(students, classes, layout);

    let currentClassId: number | null = null;
    let inStudentSection = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const cellA = row[0] != null ? String(row[0]).trim() : '';
      const cellC = row[2] != null ? String(row[2]).trim() : '';
      const cellE = row[4] != null ? String(row[4]).trim() : '';

      // Detect "Period" label row — the next row contains the actual period number
      if (cellA === 'Period' && cellC === 'Course Title') {
        inStudentSection = false;
        const nextRow = rows[i + 1];
        if (nextRow) {
          const periodNum = nextRow[0] != null ? String(nextRow[0]).trim() : '';
          if (periodNum !== '') {
            const className = `Period ${periodNum}`;
            const existingClass = ctx.classesLoop.find(c => c.name === className);
            if (existingClass) {
              currentClassId = existingClass.id;
            } else {
              const newClass = ctx.addNewClass(className);
              currentClassId = newClass.id;
            }
          }
        }
        continue;
      }

      // Detect student header row
      if (cellE === 'Student Name') {
        inStudentSection = true;
        continue;
      }

      // Parse student rows: col A has a row number (01, 02, ...), col E has the name
      if (inStudentSection && cellE && currentClassId != null) {
        const rowNum = parseInt(cellA, 10);
        if (isNaN(rowNum)) {
          inStudentSection = false;
          continue;
        }

        const formattedName = formatAeriesName(cellE);
        const seat = ctx.assignSeat(currentClassId);

        const existing = studentsByName.get(formattedName);
        if (existing) {
          existing.classAssignments[currentClassId] = { row: seat.row, column: seat.column, spokeUpCount: 0, disruptiveCount: 0 };
          ctx.updateStudent(existing.id, existing);
        } else {
          const newStudent: Student = {
            id: ctx.nextId(),
            name: formattedName,
            classAssignments: { [currentClassId]: { row: seat.row, column: seat.column, spokeUpCount: 0, disruptiveCount: 0 } },
          };
          studentsByName.set(formattedName, newStudent);
          ctx.trackStudent(newStudent);
        }
      }
    }

    const count = studentsByName.size;
    onUpdateLayout(ctx.currentLayout);
    onImportStudents(Array.from(studentsByName.values()), ctx.importedClasses);
    setImportStatus('success');
    setImportMessage(`Imported ${count} student${count !== 1 ? 's' : ''} across ${ctx.importedClasses.length} class${ctx.importedClasses.length !== 1 ? 'es' : ''}.`);
  };

  const handleCSVImport = (text: string) => {
    const lines = text.split('\n').map((ln) => ln.trim()).filter(Boolean);

    const hasHeader = lines[0].toLowerCase().includes('name');

    let importedStudents: Student[] = [];
    const ctx = createImportContext(students, classes, layout);

    if (hasHeader) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const rows = lines.slice(1);

      importedStudents = rows.map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const record: CSVRecord = { name: '' };

        headers.forEach((h, i) => {
          (record as unknown as Record<string, string>)[h] = values[i];
          if (h === 'class') {
            const studentClass = ctx.classesLoop.find(c => c.name === record.class);

            if (studentClass) {
              record.classId = studentClass.id;
            } else if (record.class) {
              const newClass = ctx.addNewClass(record.class);
              record.classId = newClass.id;
            }
          }
        });

        if (!record.classId) {
          if (ctx.classesLoop.length === 0) {
            const newClass = ctx.addNewClass("Imported Class");
            record.classId = newClass.id;
          } else {
            record.classId = selectedClassId || ctx.classesLoop[0].id;
          }
        }

        // Use explicit row/column from CSV if provided, otherwise auto-assign
        const hasExplicitRow = record.row !== undefined && record.row !== '';
        const hasExplicitCol = record.column !== undefined && record.column !== '';
        let seatRow: number, seatCol: number;

        if (hasExplicitRow && hasExplicitCol) {
          seatRow = Number(record.row);
          seatCol = Number(record.column);
          ctx.ensureFits(seatRow, seatCol);
        } else {
          const seat = ctx.assignSeat(record.classId);
          seatRow = seat.row;
          seatCol = seat.column;
        }

        const newStudent: Student = {
          id: ctx.nextId(),
          name: record.name,
          classAssignments: { [record.classId]: { row: seatRow, column: seatCol, spokeUpCount: Number(record.spokeUpCount) || 0, disruptiveCount: Number(record.disruptiveCount) || 0 } },
        }

        ctx.trackStudent(newStudent);
        return newStudent;
      });
    } else {
      if (ctx.classesLoop.length === 0 && !hasHeader) {
        ctx.addNewClass("Imported Class");
      }
      importedStudents = lines.map((name) => {
        const assignedClassId = selectedClassId || ctx.classesLoop[0].id;
        const seat = ctx.assignSeat(assignedClassId);

        const newStudent: Student = {
          id: ctx.nextId(),
          name: name,
          classAssignments: { [assignedClassId]: { row: seat.row, column: seat.column, spokeUpCount: 0, disruptiveCount: 0 } },
        }

        ctx.trackStudent(newStudent);
        return newStudent;
      });
    }
    onUpdateLayout(ctx.currentLayout);
    onImportStudents(importedStudents, ctx.importedClasses);
    setImportStatus('success');
    setImportMessage(`Imported ${importedStudents.length} student${importedStudents.length !== 1 ? 's' : ''}.`);
  }

  return (
    <div>
      <h3 className="">Import Students</h3>
      <p className="text-sm mb-2">
        Use the "Print Class Rosters" XLS export from Aeries or upload a CSV (one student per line, can use 'name', 'class', 'row', 'column', 'spokeUpCount', 'disruptiveCount' headers).
      </p>
      <label htmlFor="csv-import" className="max-w-40 flex flex-col gap-2">
        <input id="csv-import" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileImport(e)} />
      </label>
      {importStatus === 'success' && (
        <p className="text-sm text-teal-700 mt-2">{importMessage}</p>
      )}
      {importStatus === 'error' && (
        <p className="text-sm text-red-600 mt-2">{importMessage}</p>
      )}
    </div>
  )
}
