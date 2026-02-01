import type { Class } from '../types/models';

interface Props {
  classes: Class[];
  selectedClassId: number | null;
  onSelectClass: (id: number) => void;
  // onEditClass: (editedClass: Class) => void;
  onAddClass: (name: string) => void;
}

export default function ClassSelector({
  classes,
  selectedClassId,
  onSelectClass,
  // onEditClass,
  onAddClass
}: Props) {
  // function editClass( classId: number ) {
  // function editClass( e: React.MouseEvent<HTMLLIElement, MouseEvent> ) {
  //   let classId = e.target.dataset.id;
  //   const cls = classes.find(c => c.id === classId);
  //   if (!cls) return;
  //   const newName = prompt("Edit class name:", cls.name);
  //   if (newName && newName.trim() !== "") {
  //     onEditClass({ ...cls, name: newName.trim() });
  //   }
  // }

  return (
    <div>
      <h2>Classes</h2>
      {classes.length > 0 && (
        <ul className="mb-6">
          {classes.sort((a, b) => a.name.localeCompare(b.name)).map((cls) => (
            <li 
              key={cls.id}
              style={{ 
                fontWeight: cls.id == selectedClassId ? "bold" : "normal",
                cursor: "pointer"
              }}
              onClick={() => onSelectClass(cls.id)}
            >
              <span data-id={cls.id.toString()} className={`class-${cls.id.toString()}`}>{cls.name}</span>
            </li>
          ))}
        </ul>
      )}
      <button className="button-small" onClick={() => onAddClass(prompt("Class name?") || "")}>Add Class</button>
    </div>
  )
}