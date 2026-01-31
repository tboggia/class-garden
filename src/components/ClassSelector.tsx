import type { Class } from '../types/models';

interface Props {
  classes: Class[];
  selectedClassId: number | null;
  onSelectClass: (id: number) => void;
  onAddClass: (name: string) => void;
}

export default function ClassSelector({
  classes,
  selectedClassId,
  onSelectClass,
  onAddClass
}: Props) {
  return (
    <div>
      <h2>Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li 
            key={cls.id}
            style={{ 
              fontWeight: cls.id == selectedClassId ? "bold" : "normal",
              cursor: "pointer"
             }}
             onClick={() => onSelectClass(cls.id)}
          >
            {cls.name}
          </li>
        ))}
      </ul>
      <button onClick={() => onAddClass(prompt("Class name?") || "")}>Add Class</button>
    </div>
  )
}