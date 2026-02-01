import type { 
  LayoutSettings, 
  Student, 
  Class
} from '../types/models';
import ImportStudents from './ImportStudents';

interface Props {
  layout: LayoutSettings;
  students: Student[];
  classes: Class[];
  selectedClassId: number | 0;
  onUpdateLayout: (layout: LayoutSettings) => void;
  onImportStudents: (students: Student[], classes: Class[]) => void;
  onAddStudent: (name: string) => void;
}

export default function LayoutSettingsPanel({
  layout,
  students,
  classes,
  selectedClassId,
  onUpdateLayout,
  onImportStudents,
  onAddStudent,
}: Props) {
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdateLayout({ ...layout, [name]: value });
  }

  return (
    <div>
      <h3>Classroom Settings</h3>
      <form className="flex flex-col gap-3">
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
        <label className="label-input-text">
          Teacher:
          <input
            type="text"
            name="teacher"
            value={layout.teacher}
            onChange={handleSettingChange}
          />
        </label>
        <ImportStudents
          students={students}
          classes={classes}
          layout={layout}
          selectedClassId={selectedClassId}
          onUpdateLayout={onUpdateLayout}
          onImportStudents={onImportStudents}
        />
        { selectedClassId !== 0 &&
          <p>
            <button className="button-small" onClick={() => onAddStudent(prompt("Student name?") || "")}>Add Student</button>
          </p>
        }
      </form>
    </div>
  )
}