import type { Student, LayoutSettings } from '../types/models';
import { 
  DndContext,
  useDraggable,
  useDroppable
 } from "@dnd-kit/core";

interface Props {
  layout: LayoutSettings;
  students: Student[];
  onSelectStudent: (id: number) => void;
  onSeatChange: (id: number, row: number, column: number) => void;
}

export default function ClassroomGrid({
  layout,
  students,
  onSelectStudent,
  onSeatChange
}: Props) {
  const {rows, columns} = layout;

  const getStudentAt = (row: number, col: number) => {
    return students.find(
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
      <div>
        <h2>Class Grid</h2>
        <DndContext onDragEnd={handleDragEnd}>
          <div 
            style={{ 
              display: "grid",
              gridTemplateRows: `repeat(${rows}, 60px)`,
              gridTemplateColumns: `repeat(${columns}, 120px)`,
              gap: "8px",
              marginTop: "16px"
            }}
          >
            {Array.from({length: rows}).map((_, rowIndex) =>
              Array.from({ length: columns }).map((_, colIndex) => {
                const student = getStudentAt(rowIndex, colIndex);

                return (
                  <SeatCell 
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    column={colIndex}
                    student={student}
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
  student: Student | undefined;
  onSelectStudent: (id: number) => void;
}

function SeatCell({ row, column, student, onSelectStudent }: SeatCellProps) {

  const { setNodeRef: setDropRef, isOver} = useDroppable({
    id: `seat-${row}-${column}`
  });
  return ( 
    <div
      ref={setDropRef}
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: isOver ? "lightblue"
          : student 
            ? "#bbb"
            : "#ddd",
      }}
    >
      {student ? (
        <DraggableStudent student={student} onSelectStudent={onSelectStudent} />
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
