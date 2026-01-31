import type { Student, Class, LayoutSettings } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  classes: Class[],
  selectedClassId: number | 1;
  layout: LayoutSettings;
  onSelectStudent: (id: number) => void;
  onUpdateSeating: (students: Student[]) => void;
  onImportStudents: (students: Student[], classes: Class[]) => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  classes,
  selectedClassId,
  layout,
  onSelectStudent,
  onUpdateSeating,
  onImportStudents,
}: Props) {

  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const student = students.find(s => s.id === Number(e.target.dataset.studentId));
    if (!student) return;

    const field = e.target.name as keyof Pick<Student, 'row' | 'column'>;
    const sameCell = students.find(stdt => {
      if (stdt.id === student.id) return false;

      if (field == 'row') {
        return stdt.column === student.column && stdt.row === Number(e.target.value);
      } else {
        return stdt.row === student.row && stdt.column === Number(e.target.value);
      }
    });
    if (sameCell) {
      e.target.value = e.target.dataset.previousValue || "0";
      return;
    }

    student[field] = Number(e.target.value);
    e.target.dataset.previousValue = e.target.value;
    onUpdateSeating(students);
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

      const text = event.target?.result as string;
      const lines = text.split('\n').map((ln) => ln.trim()).filter(Boolean);

      const hasHeader = lines[0].toLowerCase().includes('name');
      
      let importedStudents: Student[] = [];
      let importedClasses: Class[] = [];

      let newClassCount = 0;

      if (hasHeader) {
        console.log("hasheader");
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = lines.slice(1);

        importedStudents = rows.map((line, key) => {
          const values = line.split(",").map((v) => v.trim());
          const record: any = {};
          let newClass: Class | undefined;

          headers.forEach((h, i) => {
            record[h] = values[i];
            if (h === 'class') {
              const studentClass = classes.find(c => c.name === record.class);
              if (studentClass) {
                record.classId = studentClass.id;
              } else {
                newClass = {
                  id: classes.length > 0 ? classes[classes.length - 1].id + 1 + newClassCount : 1,
                  name: record.class,
                };
                newClassCount++;
                importedClasses.push(newClass);
                record.classId = newClass.id;
              }
            }
          });
          
          const newStudent: Student = {
            id: students.length > 0 ? students[students.length - 1].id + key + 1 : key + 1,
            name: record.name,
            classId: record.classId || selectedClassId,
            row: Number(record.row) || 0,
            column: Number(record.column) || 0,
            spokeUpCount: Number(record.spokeUpCount) || 0,
            disruptiveCount: Number(record.disruptiveCount) || 0,
          }

          return newStudent;
        });
      } else {
        console.log("doesn't have header");
        importedStudents = lines.map((name, key) => {
          const newStudent: Student = {
            id: students.length > 0 ? students[students.length - 1].id + key + 1 : key + 1,
            name: name,
            classId: selectedClassId,
            row: 0,
            column: 0,
            spokeUpCount: 0,
            disruptiveCount: 0,
          }
          return newStudent;
        });
      }
      onImportStudents(importedStudents, importedClasses);
    }
    reader.readAsText(file);
  }
  return (
    <div>
      <h2>Students</h2>
      <ul>
        {students.map((student) => (
            <li key={student.id}>
              <button
                style={{
                  fontWeight: student.id == selectedStudentId ? "bold" : "normal",
                }}
                onClick={() => onSelectStudent(student.id)}
                >{student.name}</button>
              <form action="onUpdateSeating" name={`seatingForm-${student.id}`}>
                <input name="row"
                  min="0"
                  max={layout.rows - 1}
                  type="number"
                  value={student.row} 
                  onChange={handleSeatChange}
                  data-student-id={student.id}
                  data-previous-value
                />,
                <input name="column"
                  min="0"
                  max={layout.rows - 1}
                  type="number"
                  value={student.column} 
                  onChange={handleSeatChange}
                  data-student-id={student.id}
                  data-previous-value
                />
              </form>
            </li>
        ))}
      </ul>
      <input type="file" accept=".csv" onChange={(e) => handleCSVImport(e)} />
    </div>
  )
}