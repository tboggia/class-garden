import type { Student, LayoutSettings } from '../types/models';
import {
  DndContext,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";

interface Props {
  layout: LayoutSettings;
  students: Student[];
  selectedClassId: number | null;
  onSelectStudent: (id: number) => void;
  onSeatChange: (id: number, row: number, column: number) => void;
}

export default function ClassroomGrid({
  layout,
  students,
  selectedClassId,
  onSelectStudent,
  onSeatChange
}: Props) {
  const { rows, columns } = layout;

  const getStudentsAt = (row: number, col: number) => {
    return students.filter(
      (student) => student.row === row && student.column === col
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const studentId = event.active.id;
    const dropTarget = event.over?.id;

    if (!dropTarget) return;

    const [_, row, column] = dropTarget.split("-");
    const newRow = Number(row);
    const newColumn = Number(column);

    const seatTaken = students.some((s) => s.row === newRow && s.column === newColumn);
    if (seatTaken) return;

    onSeatChange(studentId as number, newRow, newColumn);
  }


  return (
    <div className={[
      "overflow-hidden",
      selectedClassId === null || students.length > 0 ? "block" : "hidden"
    ].join(" ")}>
      <h2>Class Grid</h2>
      <DndContext onDragEnd={handleDragEnd}>
        <div
          className="grid gap-2 overflow-scroll"
          style={{
            gridTemplateRows: `repeat(${rows}, 60px)`,
            gridTemplateColumns: `repeat(${columns}, 120px)`,
          }}
        >
          {Array.from({ length: rows }).map((_, rowIndex) =>
            Array.from({ length: columns }).map((_, colIndex) => {
              const students = getStudentsAt(rowIndex, colIndex);
              return (
                <SeatCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  column={colIndex}
                  students={students}
                  onSelectStudent={onSelectStudent}
                />
              )
            })
          )}
        </div>
      </DndContext>

    </div>
  )
}

interface SeatCellProps {
  row: number;
  column: number;
  students: Student[];
  onSelectStudent: (id: number) => void;
}

function SeatCell({ row, column, students, onSelectStudent }: SeatCellProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat-${row}-${column}`
  });
  return (
    <div
      className="seat-cell"
      ref={setDropRef}
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: isOver ? "lightblue"
          : students.length > 0
            ? "#bbb"
            : "#ddd",
        gridTemplateColumns: students.length > 1 ? "repeat(auto-fit, minmax(50px, 1fr))" : "none",
        display: students.length > 1 ? "grid" : "block",

      }}
    >
      {students.length > 0 ? (
        students.map(student => (
          <DraggableStudent key={student.id} student={student} onSelectStudent={onSelectStudent} />
        ))
      ) : ""}
    </div>
  );
}


interface DraggableStudentProps {
  student: Student;
  onSelectStudent: (id: number) => void;
}

function DraggableStudent({ student, onSelectStudent }: DraggableStudentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: student ? student.id : ''
  })

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelectStudent(student.id)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1rem",
        gridTemplateRows: "1rem 1fr",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        height: "100%",
        cursor: "pointer",
        zIndex: isDragging ? "9999" : "auto",
        position: 'relative',
        backgroundColor: isDragging ? "darkblue" : "blue",
        transition: "transform 50ms ease-in-out",
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px) scale(0.97)`
          : "scale(1)",
      }}
    >
      <span
        style={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
          lineHeight: '0',
          height: '100%',
        }}
        {...listeners}
        {...attributes}
        aria-label="Drag Element"
      >
        ❖
      </span>
      <p style={{ gridColumn: '1/-1', gridRow: '1/-1' }}
      >{student.name}</p>
    </div>
  )
}
