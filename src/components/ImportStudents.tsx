import type { 
  Student, 
  Class,
  LayoutSettings
} from '../types/models';

interface Props {
  students: Student[] | [];
  classes: Class[] | [];
  layout: LayoutSettings;
  selectedClassId: number | 0;
  onUpdateLayout: (layout: LayoutSettings) => void;
  onImportStudents: (students: Student[] | [], classes: Class[] | []) => void;
}

export default function ImportStudents({
  students,
  classes,
  selectedClassId,
  layout,
  onUpdateLayout,
  onImportStudents,
}: Props) {
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((ln) => ln.trim()).filter(Boolean);

      const hasHeader = lines[0].toLowerCase().includes('name');
      
      let newClass: Class;
      let importedStudents: Student[] = [];
      let importedClasses: Class[] = [];
      let classesLoop = classes;
      let biggestRow = layout.rows;
      let biggestColumn = layout.columns;

      const addNewClass = (name: string): Class => {
        let newClass: Class = {
          id: classesLoop.length > 0 ? classesLoop[classesLoop.length - 1].id + 1 : 1,
          name: name,
        };
        importedClasses= [...importedClasses, newClass];
        classesLoop = [...classesLoop, newClass];
        return newClass;
      }

      if (hasHeader) {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const rows = lines.slice(1);

        importedStudents = rows.map((line, key) => {
          const values = line.split(",").map((v) => v.trim());
          const record: any = {};

          headers.forEach((h, i) => {
            record[h] = values[i];
            if (h === 'class') {
              const studentClass = classesLoop.find(c => c.name === record.class);
              
              if (studentClass) {
                record.classId = studentClass.id;
              } else {
                newClass = addNewClass(record.class); 
                record.classId = newClass.id;
              }
            }
          });

          if (!record.classId) {
            if (classesLoop.length === 0) {
              newClass = addNewClass("Imported Class");
              record.classId = newClass.id;
            } else {
              record.classId = selectedClassId || classesLoop[0].id;
            }
          }
          
          const newStudent: Student = {
            id: students.length > 0 ? students[students.length - 1].id + key + 1 : key + 1,
            name: record.name,
            classId: record.classId,
            row: Number(record.row) || key % 3,
            column: Number(record.column) || key % 8,
            spokeUpCount: Number(record.spokeUpCount) || 0,
            disruptiveCount: Number(record.disruptiveCount) || 0,
          }
          
          if (newStudent.row > biggestRow) biggestRow = newStudent.row;
          if (newStudent.column > biggestColumn) biggestColumn = newStudent.column;

          return newStudent;
        });
      } else {
        if (classesLoop.length === 0 && !hasHeader) {
          newClass = addNewClass("Imported Class");
        }
        importedStudents = lines.map((name, key) => {
          const newStudent: Student = {
            id: students.length > 0 ? students[students.length - 1].id + key + 1 : key + 1,
            name: name,
            classId: selectedClassId || classesLoop[0].id,
            row: key % layout.rows,
            column: key % 8,
            spokeUpCount: 0,
            disruptiveCount: 0,
          }

          if (newStudent.row > biggestRow) biggestRow = newStudent.row;
          if (newStudent.column > biggestColumn) biggestColumn = newStudent.column;

          return newStudent;
        });
      }
      onUpdateLayout({ ...layout, rows: biggestRow + 1, columns: biggestColumn + 1 });
      onImportStudents(importedStudents, importedClasses);
    }
    reader.readAsText(file);
  }

  return (
    <div>
      <h3 className="">Import Students:</h3>
      <label htmlFor="csv-import" className="max-w-40 flex flex-col gap-2">
        <input id="csv-import" type="file" accept=".csv" onChange={(e) => handleCSVImport(e)} />
      </label>
    </div>
  )
}