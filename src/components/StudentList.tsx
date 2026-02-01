import type { Student, LayoutSettings } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  layout: LayoutSettings;
  onSelectStudent: (id: number) => void;
  onUpdateSeating: (id: number, row: number, column: number) => void;
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
    onUpdateSeating(student.id, student.row, student.column);
  }

  return (
    <div className={[students.length <= 0 ? "hidden" : "block"].join(" ")}>
      <h2>Students</h2>
      <form name="Students List">
        <table className="student-list w-full">
          <thead>
            <tr>
              <th className="w-3/5">Name</th>
              <th className="w-1/5">Row</th>
              <th className="w-1/5">Column</th>
            </tr>
          </thead>
          <tbody>
            {students.sort((a, b) => a.name.localeCompare(b.name)).map((student) => (
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
                  <label htmlFor={`student-${student.id}-row`} className="items-center space-between flex gap-1">
                  <span className="text-xs sr-only">{student.name} Row</span>
                    <input name="row"
                      id={`student-${student.id}-row`}
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
                  <label htmlFor={`student-${student.id}-column`} className="items-center space-between flex gap-1">
                    <span className="text-xs sr-only">{student.name} Column</span>
                    <input name="column"
                      id={`student-${student.id}-column`}
                      min="0"
                      max={layout.columns - 1}
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