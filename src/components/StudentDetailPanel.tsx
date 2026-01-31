import type { Student } from '../types/models';

interface Props {
  student: Student | null;
  onIncrementValue: (type: string) => void;
}

export default function StudentDetailPanel({
  student,
  onIncrementValue,
}: Props) {
  if (!student) {
    return (
      <div>
        <h2>Student Details</h2>
        <p>Select a student to view details.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2>{student.name}</h2>
      <form>
        <button
          type="button"
          onClick={() => onIncrementValue('spokeUpCount')}
        >
          👍🏼 {student.spokeUpCount}
        </button>
        <button
          type="button"
          onClick={() => onIncrementValue('disruptiveCount')}
        >
          👎 {student.disruptiveCount}
        </button>
      </form>
    </div>
  )
}