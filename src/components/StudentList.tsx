import type { Student, LayoutSettings } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  layout: LayoutSettings;
  onSelectStudent: (id: number) => void;
  onAddStudent: (name: string) => void;
  onUpdateSeating: (students: Student[]) => void;
  onImportStudents: (students: Student[]) => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  layout,
  onSelectStudent,
  onAddStudent,
  onUpdateSeating,
  onImportStudents
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
      <button onClick={() => onAddStudent(prompt("Student name?") || "")}>Add Student</button>
      <button onClick={() => onImportStudents([])}>Import Students</button>
    </div>
  )
}