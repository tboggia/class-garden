import type { Student, LayoutSettings } from '../types/models';
import {
  DndContext,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";

interface Props {
  layout: LayoutSettings;
  students: Student[];
  selectedClass: Class;
  selectedClassId: number | null;
  onSelectStudent: (id: number) => void;
  onSeatChange: (id: number, row: number, column: number) => void;
  onEditClassName: (name: string) => void;
}

export default function ClassroomGrid({
  layout,
  students,
  selectedClass,
  selectedClassId,
  onSelectStudent,
  onSeatChange,
  onEditClassName
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

  const editClassName = () => {
    const classElement = document.getElementById('class-name');
    if (!classElement) return;
    
    const changeName = () => {
      
      const newName = editElement.value.trim();
      if (newName && selectedClass) {
        onEditClassName(newName);
      }
      editElement.replaceWith(classElement);
    }

    const editElement = document.createElement('input');
    
    editElement.type = 'text';
    editElement.value = selectedClass?.name || '';

    classElement.replaceWith(editElement);
    editElement.focus();

    editElement.onblur = changeName;

    editElement.onkeyup = (e) => {
      if (e.key === "Enter") {
        editElement.onblur = null;
        changeName();
      } else if (e.key === "Escape") {
        editElement.onblur = null;
        editElement.replaceWith(classElement);
      }
    };
  }

  return (
    <div className={[
      "overflow-hidden",
      selectedClassId === null || students.length > 0 ? "block" : "hidden"
    ].join(" ")}>
      <div className="flex gap-2 items-center mb-2 justify-between">
        <h2 className="!mb-0" id="class-name">{selectedClass?.name}</h2>
        <p className="!mb-0">
          <button
            className="button-small"
            onClick={editClassName}
          >
            Rename class
          </button>
        </p>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div
          className="grid gap-2 overflow-scroll"
          style={{
            gridTemplateRows: `repeat(${rows}, 60px)`,
            gridTemplateColumns: `repeat(${columns}, 120px)`,
          }}
          onClick={(e) => {
            const targetEl = e.target as HTMLElement;
            if (!targetEl.closest('.seat-cell-occupied')) {
              onSelectStudent(0);
            }
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
      className={[
        students.length > 0 ? "seat-cell-occupied" : '',
        "seat-cell"
      ].join(" ")}
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
