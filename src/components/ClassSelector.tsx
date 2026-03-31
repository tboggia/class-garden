import type { Class } from '../types/models';

interface Props {
  classes: Class[];
  selectedClassId: number | null;
  context: string | null;
  onSelectClass: (id: number) => void;
  onAddClass: (name: string) => void;
}

export default function ClassSelector({
  classes,
  selectedClassId,
  context,
  onSelectClass,
  onAddClass
}: Props) {
  return (
    <div>
      {context === 'sidebar' 
       && (
        <>
          <h2>Classes</h2>
          {classes.length > 0 && (
            <ul className="inline-flex flex-row gap-3 mr-6">
              {[...classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls) => (
                <li
                  className={[
                    "cursor-pointer",
                    cls.id == selectedClassId ? "font-bold" : "font-normal",
                  ].join(" ")}
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                >
                  <span data-id={cls.id.toString()} className={`class-${cls.id.toString()}`}>{cls.name}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {context === 'settings' && (
        <h3>Add Classes</h3>
      )}
      <button className="button-small" onClick={() => onAddClass(prompt("Class name?") || "")}>Add Class</button>
    </div>
  )
}