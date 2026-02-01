import { useState, useEffect, useRef } from 'react';
import type { Class, Student, LayoutSettings } from './types/models';
import ClassSelector from './components/ClassSelector';
import StudentList from './components/StudentList';
import ClassroomGrid from './components/ClassroomGrid';
import StudentDetailPanel from './components/StudentDetailPanel';
import './App.css'
import LayoutSettingsPanel from './components/LayoutSettingsPanel';

function App() {
  const [selectedBackupKey, setSelectedBackupKey] = useState<string>('');
  const hasLoaded = useRef(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | 0>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutSettings>({
    rows: 1,
    columns: 1,
    teacher: ""
  });

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    try {
      // Remove all but 5 class-garden-data localStorage items
      const keys = Object.keys(localStorage).filter(key => key.startsWith('class-garden-data-')).sort();
      const keysToRemove = keys.length - 5;
      for (let i = 0; i < keysToRemove; i++) {
        localStorage.removeItem(keys[i]);
      }
    } catch (error) {
      console.warn('Failed to clean up old data: ', error)
    }
    try {
      const saved = localStorage.getItem('class-garden-data');
      
      if (saved) {
        const parsed = JSON.parse(saved);

        setClasses(parsed.classes || []);
        setStudents(parsed.students || []);
        setLayout(parsed.layout || { rows: 1, columns: 1, teacher: "" });
      }
      console.log("finished saving data");
      return () => {};
    } catch (error) {
      console.warn('Failed to load saved data: ', error)
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    const data = {
      classes,
      students,
      layout
    };
    const dateString = new Date().toISOString().split('T')[0];
    localStorage.setItem("class-garden-data", JSON.stringify(data));
    localStorage.setItem(`class-garden-data-${dateString}`, JSON.stringify(data));
  }, [classes, students, layout]);

  return (
    <>
      <div className="grid grid-cols-[280px_1fr] grid-rows-[auto_1fr] gap-6 w-full max-w-[1400px] m-6">
        <h1 className="col-span-full">{layout.teacher ? layout.teacher + "'s " : ""}Class Garden</h1>
        <div id="sidebar" className="flex flex-col gap-6">
          <ClassSelector
            classes={classes}
            selectedClassId={selectedClassId}
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
                id: classes.length > 0 ? classes[classes.length - 1].id + 1 : 1,
                name
              };
              setClasses([...classes, newClass]);
            }}
          />
          <StudentList
            students={students.filter((student) => selectedClassId === 0 || student.classId === selectedClassId)}
            selectedStudentId={selectedStudentId}
            layout={layout}
            onSelectStudent={setSelectedStudentId}
            onUpdateSeating={(id, row, column) => {
              setStudents(
                students.map((student) =>
                  student.id === id ? { ...student, row, column } : student
                )
              )
            }}
          />
          <LayoutSettingsPanel
            students={students}
            classes={classes}
            selectedClassId={selectedClassId}
            layout={layout}
            onUpdateLayout={setLayout}
            onImportStudents={(importedStudents, importedClasses) => {
              setStudents([...students, ...importedStudents]);
              setClasses([...classes, ...importedClasses]);
            }}
            onAddStudent={(name) => {
              if (!selectedClassId) return;
              const newStudent: Student = {
                id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
                name,
                classId: selectedClassId,
                row: 0,
                column: 0,
                spokeUpCount: 0,
                disruptiveCount: 0
              };
              setStudents([...students, newStudent]);
            }}
          />
          <div>
            <h2>Data Management</h2>
            <div className="flex flex-col gap-2 mb-6">
              <select
                name="backup selection"
                value={selectedBackupKey}
                onChange={(e) => setSelectedBackupKey(e.target.value)}
              >
                <option value="" disabled>Select Backup</option>
                {Object.keys(localStorage)
                  .filter(key => key.startsWith('class-garden-data-'))
                  .sort()
                  .reverse()
                  .map(key => (
                    <option key={key} value={key}>
                      {key.replace('class-garden-data-', '')}
                    </option>
                  ))
                }
              </select>
              <div>
                <button
                  className="button-small"
                  disabled={!selectedBackupKey}
                  onClick={() => {
                  if (!selectedBackupKey) return;
                  const backupData = localStorage.getItem(selectedBackupKey);
                  if (backupData) {
                    try {
                    const parsed = JSON.parse(backupData);
                    setClasses(parsed.classes || []);
                    setStudents(parsed.students || []);
                    setLayout(parsed.layout || { rows: 1, columns: 1, teacher: "" });
                    setSelectedClassId(0);
                    setSelectedStudentId(null);
                    alert(`Restored backup from ${selectedBackupKey.replace('class-garden-data-', '')}`);
                    setSelectedBackupKey('');
                    } catch (error) {
                    alert("Failed to restore backup: Invalid backup data.");
                      setSelectedBackupKey('');
                    }
                  }
                  }}
                >
                  Restore Backup
                </button>
              </div>
            </div>
            <button
              className="button-small button-danger"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
                  setClasses([]);
                  setStudents([]);
                  setSelectedClassId(0);
                  setSelectedStudentId(null);
                  setLayout({ rows: 1, columns: 1, teacher: "" });
                  localStorage.removeItem("class-garden-data");
                }
              }}
            >
              Delete all data
            </button>
          </div>
        </div>
        <div id="classroom-grid" className="flex flex-col gap-6 w-full overflow-hidden">
          <ClassroomGrid
            layout={layout}
            students={students.filter((student) => selectedClassId === null || student.classId === selectedClassId)}
            selectedClass={classes.find((cls) => cls.id === selectedClassId) || null}
            selectedClassId={selectedClassId}
            onSelectStudent={setSelectedStudentId}
            onSeatChange={(id, row, column) => {
              setStudents(
                students.map((student) =>
                  student.id === id ? { ...student, row, column } : student
                )
              )
            }}
            onEditClassName={(name) => {
              setClasses(
                classes.map((cls) =>
                  cls.id === selectedClassId ? { ...cls, name } : cls
                )
              )
            }}
          />
          <StudentDetailPanel
            student={students.find((student) => student.id === selectedStudentId) || null}
            onIncrementValue={(type) => {
              if (selectedStudentId === null) return;
              setStudents((prevStudents) =>
                prevStudents.map((student) =>
                  student.id === selectedStudentId
                    ? { ...student, [type]: student[type] + 1 }
                    : student
                )
              );
            }}
          />
        </div>
      </div>
    </>
  )
}

export default App
