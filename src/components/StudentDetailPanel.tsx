import { useEffect, useRef } from 'react';
import type { Student, Class } from '../types/models';

interface Props {
  student: Student | null;
  classes: Class[];
  selectedClassId: number;
  onUpdateAssignment: (studentId: number, classId: number, field: string, value: number) => void;
  onClose: () => void;
}

export default function StudentDetailPanel({
  student,
  classes,
  selectedClassId,
  onUpdateAssignment,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [student, onClose]);

  if (!student) return null;

  const activeAssignment = selectedClassId !== 0 ? student.classAssignments[selectedClassId] : null;
  const assignedClassIds = Object.keys(student.classAssignments).map(Number);

  return (
    <div
      ref={panelRef}
      data-is-tooltip
      className={[
        "absolute bg-white/90 p-8 rounded-md text-center text-rose-400 w-125 inset-0 h-min m-auto"
      ].join(' ')}
    >
      <h2>{student.name}</h2>

      {activeAssignment && selectedClassId !== 0 && (
        <form className="flex gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={() => onUpdateAssignment(student.id, selectedClassId, 'spokeUpCount', activeAssignment.spokeUpCount + 1)}
          >
            📣 {activeAssignment.spokeUpCount}
          </button>
          <button
            type="button"
            onClick={() => onUpdateAssignment(student.id, selectedClassId, 'disruptiveCount', activeAssignment.disruptiveCount + 1)}
          >
            🚫 {activeAssignment.disruptiveCount}
          </button>
        </form>
      )}

      {assignedClassIds.length > 0 && (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th>Class</th>
              <th>Row</th>
              <th>Col</th>
              <th>📣</th>
              <th>🚫</th>
            </tr>
          </thead>
          <tbody>
            {assignedClassIds.map((classId) => {
              const assignment = student.classAssignments[classId];
              const cls = classes.find(c => c.id === classId);
              return (
                <tr key={classId} className={classId === selectedClassId ? 'font-bold' : ''}>
                  <td>{cls?.name ?? `Class ${classId}`}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assignment.row}
                      onChange={(e) => onUpdateAssignment(student.id, classId, 'row', Number(e.target.value))}
                      className="w-12"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assignment.column}
                      onChange={(e) => onUpdateAssignment(student.id, classId, 'column', Number(e.target.value))}
                      className="w-12"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assignment.spokeUpCount}
                      onChange={(e) => onUpdateAssignment(student.id, classId, 'spokeUpCount', Number(e.target.value))}
                      className="w-12"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assignment.disruptiveCount}
                      onChange={(e) => onUpdateAssignment(student.id, classId, 'disruptiveCount', Number(e.target.value))}
                      className="w-12"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
