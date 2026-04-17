import { useState } from 'react';
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
  const [isAdding, setIsAdding] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const handleSubmit = () => {
    const name = newClassName.trim();
    if (name) {
      onAddClass(name);
      setNewClassName('');
      setIsAdding(false);
    }
  };

  return (
    <div>
      {context === 'sidebar'
       && (
        <>
          <h2>Classes</h2>
          {classes.length > 0 && (
            <ul className="inline-flex flex-row gap-4 flex-wrap">
              {[...classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls) => (
                <li
                  className={[
                    "cursor-pointer last:mr-8",
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
      {isAdding ? (
        <span className="inline-flex gap-2 items-center">
          <input
            type="text"
            value={newClassName}
            autoFocus
            placeholder="Class name"
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
              if (e.key === 'Escape') { setIsAdding(false); setNewClassName(''); }
            }}
          />
          <button type="button" className="button-small" onClick={handleSubmit}>Add</button>
          <button type="button" className="button-small" onClick={() => { setIsAdding(false); setNewClassName(''); }}>Cancel</button>
        </span>
      ) : (
        <button type="button" className="button-small" onClick={() => setIsAdding(true)}>Add Class</button>
      )}
    </div>
  )
}
