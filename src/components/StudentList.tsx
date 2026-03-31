import type { Student, LayoutSettings } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  selectedClassId: number;
  layout: LayoutSettings;
  onSelectStudent: (id: number) => void;
  onUpdateSeating: (id: number, row: number, column: number) => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  selectedClassId,
  layout,
  onSelectStudent,
  onUpdateSeating,
}: Props) {

  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const student = students.find(s => s.id === Number(e.target.dataset.studentId));
    if (!student) return;

    const assignment = student.classAssignments[selectedClassId];
    if (!assignment) return;

    const field = e.target.name as 'row' | 'column';
    const newValue = Number(e.target.value);

    const sameCell = students.find(stdt => {
      if (stdt.id === student.id) return false;
      const other = stdt.classAssignments[selectedClassId];
      if (!other) return false;

      if (field === 'row') {
        return other.column === assignment.column && other.row === newValue;
      } else {
        return other.row === assignment.row && other.column === newValue;
      }
    });
    if (sameCell) {
      e.target.value = e.target.dataset.previousValue || "0";
      return;
    }

    const newRow = field === 'row' ? newValue : assignment.row;
    const newColumn = field === 'column' ? newValue : assignment.column;
    e.target.dataset.previousValue = e.target.value;
    onUpdateSeating(student.id, newRow, newColumn);
  }

  return (
    <div className={[students.length <= 0 ? "hidden" : "block"].join(" ")}>
      <h2>Students</h2>
      <form name="Students List">
        <table className="student-list w-full">
          <thead>
            <tr>
              <th className={selectedClassId === 0 ? "w-full" : "w-3/5"}>Name</th>
              {selectedClassId !== 0 && <th className="w-1/5">Row</th>}
              {selectedClassId !== 0 && <th className="w-1/5">Column</th>}
            </tr>
          </thead>
          <tbody>
            {students.sort((a, b) => a.name.localeCompare(b.name)).map((student) => {
              const assignment = student.classAssignments[selectedClassId];
              return (
                <tr className="student-list--item" key={student.id}>
                  <td>
                    <button
                      type="button"
                      className={[
                        "button-small h-min",
                        student.id == selectedStudentId ? "font-bold" : "font-normal",
                      ].join(" ")}
                      onClick={() => onSelectStudent(student.id)}
                    >{student.name}</button>
                  </td>
                  {selectedClassId !== 0 && (
                    <td>
                      <label htmlFor={`student-${student.id}-row`} className="items-center space-between flex gap-1">
                      <span className="text-xs sr-only">{student.name} Row</span>
                        <input name="row"
                          id={`student-${student.id}-row`}
                          min="0"
                          max={layout.rows - 1}
                          type="number"
                          value={assignment?.row ?? 0}
                          onChange={handleSeatChange}
                          data-student-id={student.id}
                          data-previous-value
                        />
                      </label>
                    </td>
                  )}
                  {selectedClassId !== 0 && (
                    <td>
                      <label htmlFor={`student-${student.id}-column`} className="items-center space-between flex gap-1">
                        <span className="text-xs sr-only">{student.name} Column</span>
                        <input name="column"
                          id={`student-${student.id}-column`}
                          min="0"
                          max={layout.columns - 1}
                          type="number"
                          value={assignment?.column ?? 0}
                          onChange={handleSeatChange}
                          data-student-id={student.id}
                          data-previous-value
                        />
                      </label>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </form>
    </div>
  )
}
