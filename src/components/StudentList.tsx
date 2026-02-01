import type { Student, Class, LayoutSettings } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  layout: LayoutSettings;
  onSelectStudent: (id: number) => void;
  onUpdateSeating: (students: Student[]) => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  layout,
  onSelectStudent,
  onUpdateSeating,
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
    <div className={[students.length <= 0 ? "hidden" : "block"].join(" ")}>
      <h2>Students</h2>
      <form action=""name="Students List">
        <table className="student-list w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Row</th>
              <th>Column</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr className="student-list--item" key={student.id}>
                <td>
                  <button
                    type="button"
                    className={[
                      "button-small h-min",
                      student.id == selectedStudentId ? "font-bold" : "font-normal",
                    ].join(" ")}
                    style={{
                      fontWeight: student.id == selectedStudentId ? "bold" : "normal",
                    }}
                    onClick={() => onSelectStudent(student.id)}
                  >{student.name}</button>
                </td>
                <td>
                  <label htmlFor="row" className="items-center space-between flex gap-1">
                  <span className="text-xs sr-only">{student.name} Row</span>
                    <input name="row"
                      min="0"
                      max={layout.rows - 1}
                      type="number"
                      value={student.row} 
                      onChange={handleSeatChange}
                      data-student-id={student.id}
                      data-previous-value
                    />
                  </label>
                </td>
                <td>
                  <label htmlFor="column" className="items-center space-between flex gap-1">
                    <span className="text-xs sr-only">{student.name} Column</span>
                    <input name="column"
                      min="0"
                      max={layout.rows - 1}
                      type="number"
                      value={student.column} 
                      onChange={handleSeatChange}
                      data-student-id={student.id}
                      data-previous-value
                    />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  )
}