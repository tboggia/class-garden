import type { Student } from '../types/models';

interface Props {
  students: Student[];
  selectedStudentId: number | null;
  selectedClassId: number;
  onSelectStudent: (id: number) => void;
  onUpdateSeating: (id: number, row: number, column: number) => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  selectedClassId,
  onSelectStudent,
}: Props) {
  return (
    <div className={[students.length <= 0 ? "hidden" : "block"].join(" ")}>
      <h2>Students</h2>
      <form name="Students List">
        <div className="student-list w-full" id="student-list-wrapper">
          <ul className={[
              "list-none ml-0 mr-2 gap-4 flex",
              selectedClassId ? "flex-col" : "flex-wrap",
            ].join(" ")}>
            {[...students].sort((a, b) => a.name.localeCompare(b.name)).map((student) => {
              const classAssignments = student.classAssignments;
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
                        <span className="text-sm" aria-label={`${student.name} spoke up ${classAssignments[selectedClassId].spokeUpCount ?? 0} times`}>📣 {classAssignments[selectedClassId].spokeUpCount ?? 0}</span>
                        <span className="text-sm" aria-label={`${student.name} was disruptive ${classAssignments[selectedClassId].disruptiveCount ?? 0} times`}>🚫 {classAssignments[selectedClassId].disruptiveCount ?? 0}</span>
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
