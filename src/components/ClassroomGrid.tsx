import type { Student, Class, LayoutSettings } from '../types/models';
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

interface Props {
  layout: LayoutSettings;
  students: Student[] | [];
  selectedClass: Class | null;
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
    return students.filter((student) => {
      const assignment = student.classAssignments[selectedClassId ?? 0];
      return assignment && assignment.row === row && assignment.column === col;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const studentId = event.active.id;
    const dropTarget: string | 0 = event.over?.id as string;

    if (!dropTarget) return;

    const [_, row, column] = dropTarget.split("-");
    const newRow = Number(row);
    const newColumn = Number(column);

    const seatTaken = students.some((s) => {
      const assignment = s.classAssignments[selectedClassId ?? 0];
      return assignment && assignment.row === newRow && assignment.column === newColumn;
    });
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
        selectedClassId && students.length > 0 ? "block" : "hidden"
      ].join(" ")}
    >
      <div className="flex gap-2 items-center mb-2 justify-between">
        <h2 className="mb-0!" id="class-name">{selectedClass?.name}</h2>
        <p className="mb-0!">
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
        >
          {Array.from({ length: rows }).map((_, rowIndex) =>
            Array.from({ length: columns }).map((_, colIndex) => {
              const studentsInSeat = getStudentsAt(rowIndex, colIndex);
              return (
                <SeatCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  column={colIndex}
                  studentsInSeat={studentsInSeat}
                  students={students}
                  selectedClassId={selectedClassId ?? 0}
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
  studentsInSeat: Student[];
  students: Student[];
  selectedClassId: number;
  onSelectStudent: (id: number) => void;
}

function SeatCell({ row, column, studentsInSeat, students, selectedClassId, onSelectStudent }: SeatCellProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat-${row}-${column}`
  });
  return (
    <div
      className={[
        studentsInSeat.length > 0 ? "seat-cell-occupied" : '',
        "seat-cell rounded-md border border-gray-400 transition-colors duration-750 ease-in-out",
        isOver ? "bg-teal-100" : students.length > 0 ? "bg-rose-100" : "bg-gray-200",
        studentsInSeat.length > 1 ? 'grid' : 'block',
      ].join(" ")}
      ref={setDropRef}
      style={{
        gridTemplateColumns: studentsInSeat.length > 1 ? "repeat(auto-fit, minmax(50px, 1fr))" : "none",
      }}
    >
      {studentsInSeat.length > 0 ? (
        studentsInSeat.map(student => (
          <DraggableStudent key={student.id} student={student} onSelectStudent={onSelectStudent} students={students} selectedClassId={selectedClassId} />
        ))
      ) : ""}
    </div>
  );
}


interface DraggableStudentProps {
  student: Student;
  onSelectStudent: (id: number) => void;
  students: Student[];
  selectedClassId: number;
}

function DraggableStudent({ student, onSelectStudent, students, selectedClassId }: DraggableStudentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: student ? student.id : ''
  })

  const getSpokeUpColor = () => {
    if (!students) return { background: 'rgb(4, 47, 46)', color: 'white' };

    const minSpeakUp = Math.min(...students.map(s => s.classAssignments[selectedClassId]?.spokeUpCount ?? 0));
    const maxSpeakUp = Math.max(...students.map(s => s.classAssignments[selectedClassId]?.spokeUpCount ?? 0));

    const studentCount = student.classAssignments[selectedClassId]?.spokeUpCount ?? 0;
    const normalized = (maxSpeakUp - minSpeakUp) ? (studentCount - minSpeakUp) / (maxSpeakUp - minSpeakUp) : 1;
    
    const hue = 160; // teal hue
    const saturation = 20 + normalized * 90; // 30% to 90%
    const lightness = 60 - normalized * 50; // 70% to 40%
    const color: { background: string; color: string } = { 
      background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      color: lightness > 50 ? 'black' : 'white'
    };
    return color;
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelectStudent(student.id)}
      className={[
        "grid grid-cols-[1fr_1rem] grid-rows-[1rem_1fr] border border-rose-100",
        "rounded-md items-center justify-center h-full cursor-pointer relative text-center touch-none",
        isDragging ? "z-10" : "z-auto",
      ].join(" ")}
      style={{
        transition: "transform 25ms ease-in-out, background-color 100ms ease-in-out",
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px) scale(0.97)`
          : "scale(1)",
        backgroundColor: getSpokeUpColor()['background'],
        color: getSpokeUpColor()['color'],
      }}
    >
      <span
        className={[
          "flex items-center justify-center cursor-grab select-none leading-0 h-full col-start-2 row-start-1"
        ].join(" ")}
        {...listeners}
        {...attributes}
        aria-label="Drag Element"
      >
          ❖
      </span>
      <p
        className={[
          "overflow-wrap col-span-full row-span-full"
        ].join(" ")} 
      >{student.name}</p>
    </div>
  )
}
