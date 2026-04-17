import { useState } from 'react';
import type {
  LayoutSettings,
  Student,
  Class
} from '../types/models';
import ClassSelector from './ClassSelector';
import ImportStudents from './ImportStudents';

interface Props {
  layout: LayoutSettings;
  students: Student[] | [];
  classes: Class[] | [];
  selectedClassId: number | 0;
  setSelectedClassId: (id: number | 0) => void;
  setSelectedStudentId: (id: number | null) => void;
  setClasses: (classes: Class[]) => void;
  onUpdateLayout: (layout: LayoutSettings) => void;
  onImportStudents: (students: Student[], classes: Class[]) => void;
  onAddStudent: (name: string) => void;
}

export default function LayoutSettingsPanel({
  layout,
  students,
  classes,
  selectedClassId,
  setSelectedClassId,
  setSelectedStudentId,
  setClasses,
  onUpdateLayout,
  onImportStudents,
  onAddStudent,
}: Props) {
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdateLayout({ ...layout, [name]: value });
  }

  const handleAddStudent = () => {
    const name = newStudentName.trim();
    if (name) {
      onAddStudent(name);
      setNewStudentName('');
      setIsAddingStudent(false);
    }
  };

  return (
    <div>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="!mb-0">Classroom Settings</h3>
          <label className="label-input-text">
            Teacher:
            <input
              type="text"
              name="teacher"
              value={layout.teacher}
              onChange={handleSettingChange}
            />
          </label>
          <label className="label-input-number">
            Rows:
            <input
              type="number"
              min={1}
              name="rows"
              value={layout.rows}
              onChange={handleSettingChange}
            />
          </label>
          <label className="label-input-number">
            Columns:
            <input
              type="number"
              min={1}
              name="columns"
              value={layout.columns}
              onChange={handleSettingChange}
            />
          </label>
        </div>
        <ClassSelector
          classes={classes}
          selectedClassId={selectedClassId}
          context='settings'
          onSelectClass={(id) => {
            if (id !== selectedClassId) {
              setSelectedClassId(id);
            } else {
              setSelectedClassId(0);
            }
            setSelectedStudentId(null);
          }}
          onAddClass={(name) => {
            const newClass: Class = {
              id: classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1,
              name
            };
            setClasses([...classes, newClass]);
          }}
        />
        <ImportStudents
          students={students}
          classes={classes}
          layout={layout}
          selectedClassId={selectedClassId}
          onUpdateLayout={onUpdateLayout}
          onImportStudents={onImportStudents}
        />
        {selectedClassId !== 0 && (
          <div>
            {isAddingStudent ? (
              <span className="inline-flex gap-2 items-center">
                <input
                  type="text"
                  value={newStudentName}
                  autoFocus
                  placeholder="Student name"
                  onChange={(e) => setNewStudentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddStudent(); }
                    if (e.key === 'Escape') { setIsAddingStudent(false); setNewStudentName(''); }
                  }}
                />
                <button type="button" className="button-small" onClick={handleAddStudent}>Add</button>
                <button type="button" className="button-small" onClick={() => { setIsAddingStudent(false); setNewStudentName(''); }}>Cancel</button>
              </span>
            ) : (
              <button type="button" className="button-small" onClick={() => setIsAddingStudent(true)}>Add Student</button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
