import type { LayoutSettings } from '../types/models';

interface Props {
  layout: LayoutSettings;
  onUpdateLayout: (layout: LayoutSettings) => void;
}

export default function LayoutSettingsPanel({
  layout,
  onUpdateLayout,
}: Props) {
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rows = Number(e.target.value);
    onUpdateLayout({...layout, rows});
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const columns = Number(e.target.value);
    onUpdateLayout({ ...layout, columns});
  }

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const teacher = e.target.value;
    onUpdateLayout({ ...layout, teacher });
  }

  return (
    <div>
      <h2>Classroom Settings</h2>
      <form>
        <label>
          Teacher:
          <input 
            type="text" 
            name="teacher" 
            value={layout.teacher}
            onChange={handleTeacherChange}
          />
        </label>
        <br />
        <label>
          Rows:
          <input 
            type="number" 
            min={1}
            name="rows" 
            value={layout.rows}
            onChange={handleRowsChange}
          />
        </label>
        <br />
        <label>
          Columns:
          <input 
            type="number" 
            min={1}
            name="columns" 
            value={layout.columns}
            onChange={handleColumnsChange}
          />
        </label>
      </form>
    </div>
  )
}