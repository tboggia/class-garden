import type { Student } from '../types/models';

interface Props {
  student: Student | null;
  onIncrementValue: (type: string) => void;
}

export default function StudentDetailPanel({
  student,
  onIncrementValue,
}: Props) {
  if (!student) return null;
  return (
    <div 
      className={[
        'absolute bg-white/90 p-8 rounded-md left-[54%] top-[41%] text-center text-rose-400',
      ].join(' ')}
    >
      <h2>{student.name}</h2>
      <form className="flex gap-2">
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