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

    const classAssignments = student.classAssignments[selectedClassId];
    if (!classAssignments) return;

    const field = e.target.name as 'row' | 'column';
    const newValue = Number(e.target.value);

    const sameCell = students.find(stdt => {
      if (stdt.id === student.id) return false;
      const other = stdt.classAssignments[selectedClassId];
      if (!other) return false;

      if (field === 'row') {
        return other.column === classAssignments.column && other.row === newValue;
      } else {
        return other.row === classAssignments.row && other.column === newValue;
      }
    });
    if (sameCell) {
      e.target.value = e.target.dataset.previousValue || "0";
      return;
    }

    const newRow = field === 'row' ? newValue : classAssignments.row;
    const newColumn = field === 'column' ? newValue : classAssignments.column;
    e.target.dataset.previousValue = e.target.value;
    onUpdateSeating(student.id, newRow, newColumn);
  }

  return (
    <div className={[students.length <= 0 ? "hidden" : "block"].join(" ")}>
      <h2>Students</h2>
      <form name="Students List">
        <div className="student-list w-full" id="student-list-wrapper">
          <ul className={[
              "list-none ml-0 gap-4 flex ",
              selectedClassId ? "flex-col" : "flex-wrap",
            ].join(" ")}>
            {students.sort((a, b) => a.name.localeCompare(b.name)).map((student) => {
              const classAssignments = student.classAssignments[selectedClassId];
              return (
                <li className="student-list-item flex gap-2 justify-between" key={student.id}>
                    <button
                      type="button"
                      className={[
                        "button-small h-min",
                        "",
                        student.id == selectedStudentId ? "font-bold" : "font-normal",
                      ].join(" ")}
                      onClick={() => onSelectStudent(student.id)}
                    >{student.name}</button>
                  {selectedClassId !== 0 && (
                      <div className="student-info flex gap-3 items-center">
                        <span className="text-xs">📣 {classAssignments?.spokeUpCount ?? 0}</span>
                        <span className="text-xs">🚫 {classAssignments?.disruptiveCount ?? 0}</span> 
                        {/* <label htmlFor={`student-${student.id}-row`} className="items-center space-between flex gap-1">
                          <span className="text-xs sr-only">{student.name} Row</span>
                          <input name="row"
                            id={`student-${student.id}-row`}
                            min="0"
                            max={layout.rows - 1}
                            type="number"
                            value={classAssignments?.row ?? 0}
                            onChange={handleSeatChange}
                            data-student-id={student.id}
                            data-previous-value
                          />
                        </label>
                        <label htmlFor={`student-${student.id}-column`} className="items-center space-between flex gap-1">
                          <span className="text-xs sr-only">{student.name} Column</span>
                          <input name="column"
                            id={`student-${student.id}-column`}
                            min="0"
                            max={layout.columns - 1}
                            type="number"
                            value={classAssignments?.column ?? 0}
                            onChange={handleSeatChange}
                            data-student-id={student.id}
                            data-previous-value
                          />
                        </label> */}
                      </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </form>
    </div>
  )
}
