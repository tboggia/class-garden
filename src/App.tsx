import { useState, useEffect, useRef } from 'react';
import type { Class, Student, LayoutSettings } from './types/models';
import ClassSelector from './components/ClassSelector';
import StudentList from './components/StudentList';
import ClassroomGrid from './components/ClassroomGrid';
import StudentDetailPanel from './components/StudentDetailPanel';
import './App.css'
import LayoutSettingsPanel from './components/LayoutSettingsPanel';
import { assignSeatInGrid } from './utils/seating';

function App() {
  const [selectedBackupKey, setSelectedBackupKey] = useState<string>('');
  const hasLoaded = useRef(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | 0>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState<LayoutSettings>({
    rows: 1,
    columns: 1,
    teacher: ""
  });

  const handleAddStudent = (name: string) => {
    if (!selectedClassId) return;
    const { cell, layout: newLayout } = assignSeatInGrid(students, selectedClassId, layout);
    if (newLayout !== layout) setLayout(newLayout);
    const newStudent: Student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      name,
      classAssignments: { [selectedClassId]: { row: cell.row, column: cell.column, spokeUpCount: 0, disruptiveCount: 0 } },
    };
    setStudents([...students, newStudent]);
  };

  const handleImportStudents = (importedStudents: Student[], importedClasses: Class[]) => {
    setStudents([...students, ...importedStudents]);
    setClasses([...classes, ...importedClasses]);
    setShowSettings(false);
  };

  const handleClearCounts = () => {
    setStudents(students.map(s => ({
      ...s,
      classAssignments: Object.fromEntries(
        Object.entries(s.classAssignments).map(([classId, a]) => [
          classId,
          { ...a, spokeUpCount: 0, disruptiveCount: 0 },
        ])
      ),
    })));
    setShowSettings(false);
  };

  const handleCallOnRandom = () => {
    if (!selectedClassId) return;
    const classStudents = students.filter(s => s.classAssignments[selectedClassId]);
    if (classStudents.length === 0) return;
    const minSpoken = Math.min(...classStudents.map(s => s.classAssignments[selectedClassId].spokeUpCount));
    const candidates = classStudents.filter(s => s.classAssignments[selectedClassId].spokeUpCount === minSpoken);
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    setSelectedStudentId(picked.id);
  };

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
      <div className={[
          "grid-container grid gap-6 w-full max-w-350 m-6",
        students.length > 0 ? "grid-cols-[280px_1fr]  grid-rows-[auto_auto_1fr]" : "grid-rows-[auto_1fr] items-center"
        ].join(" ")}>
        <div className="col-span-full flex justify-between items-center">
          <h1>{layout.teacher ? layout.teacher + (layout.teacher[layout.teacher.length - 1] === "s" ? "' " : "'s ") : ""}Class Garden</h1>
            {students.length > 0 && (
              <button
                onClick={() => setShowSettings(true)}
                className="button-small"
                aria-label="Settings"
              >
                ⚙️
              </button>
            )}
        </div>

        {students.length === 0 && (
          <div className="welcome-screen col-span-full w-1/2 mx-auto mt-6 flex flex-col gap-4">
            <div className="bg-teal-800 text-teal-100 rounded-md p-4">
              <p className="mb-2">Welcome to Class Garden! To get started:</p>
              <ol className="list-decimal list-inside mb-3 ml-3">
                <li>Write your teacher name</li>
                <li>Define your classroom desk grid</li>
                <li>Add class periods<sup>*</sup></li>
                <li>Import students from a CSV file with headings: Name, Class<sup>*</sup>, Row<sup>*</sup>, and Column<sup>*</sup></li>
              </ol>
              <p>You can find these settings using the gear icon on the top-right of the screen.</p>
              <p className="text-sm"><sup>*</sup> Optional fields</p>
            </div>
            <LayoutSettingsPanel
              layout={layout}
              students={students}
              classes={classes}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              setSelectedStudentId={setSelectedStudentId}
              setClasses={setClasses}
              onUpdateLayout={setLayout}
              onImportStudents={(importedStudents, importedClasses) => {
                handleImportStudents(importedStudents, importedClasses);
              }}
              onAddStudent={handleAddStudent}
            />

          </div>
        )}
        {students.length > 0 && (
          <div className="col-span-full flex justify-between items-center">
            <ClassSelector
              classes={classes}
              selectedClassId={selectedClassId}
              context='sidebar'
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
          </div>
        )}
        {students.length > 0 && (
          <div id="sidebar" className={[
            "flex-col gap-6 overflow-scroll",
            selectedClassId ? '' : 'col-span-full'
          ].join(" ")}>
            <StudentList
              students={students.filter((student) => selectedClassId === 0 || student.classAssignments[selectedClassId] !== undefined)}
              selectedStudentId={selectedStudentId}
              selectedClassId={selectedClassId}
              layout={layout}
              onSelectStudent={setSelectedStudentId}
              onUpdateSeating={(id, row, column) => {
                setStudents(
                  students.map((student) =>
                    student.id === id
                      ? { ...student, classAssignments: { ...student.classAssignments, [selectedClassId]: { ...student.classAssignments[selectedClassId], row, column } } }
                      : student
                  )
                )
              }}
            />
          </div>
        )}
        {students.length > 0 && (
          <div id="classroom-grid" className={[
            "flex flex-col gap-6 w-full overflow-hidden",
          ].join(" ")}>
            <ClassroomGrid
              layout={layout}
              students={students.filter((student) => selectedClassId === 0 || student.classAssignments[selectedClassId] !== undefined)}
              selectedClass={classes.find((cls) => cls.id === selectedClassId) || null}
              selectedClassId={selectedClassId}
              onSelectStudent={setSelectedStudentId}
              onSeatChange={(id, row, column) => {
                setStudents(
                  students.map((student) =>
                    student.id === id
                      ? { ...student, classAssignments: { ...student.classAssignments, [selectedClassId]: { ...student.classAssignments[selectedClassId], row, column } } }
                      : student
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
              onCallOnRandom={handleCallOnRandom}
            />
          </div>
        )}
        {(
          <StudentDetailPanel
            student={students.find((student) => student.id === selectedStudentId) || null}
            classes={classes}
            selectedClassId={selectedClassId}
            onClose={() => setSelectedStudentId(null)}
            onUpdateAssignment={(studentId, classId, field, value, close = false) => {
              setStudents((prevStudents) =>
                prevStudents.map((student) => {
                  if (student.id !== studentId) return student;
                  const assignment = student.classAssignments[classId];
                  if (!assignment) return student;
                  return {
                    ...student,
                    classAssignments: {
                      ...student.classAssignments,
                      [classId]: { ...assignment, [field]: value },
                    },
                  };
                })
              );
              if (close) {
                setSelectedStudentId(null);
              }
            }}
          />
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-teal-950/95 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white text-teal-950 rounded-lg p-6 min-w-1/3 max-w-[60ch] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="mb-0!">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="button-small">×</button>
            </div>
            <div className="mb-3">
              <LayoutSettingsPanel
                layout={layout}
                students={students}
                classes={classes}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                setSelectedStudentId={setSelectedStudentId}
                setClasses={setClasses}
                onUpdateLayout={setLayout}
                onImportStudents={(importedStudents, importedClasses) => {
                  handleImportStudents(importedStudents, importedClasses);
                }}
                onAddStudent={handleAddStudent}
              />
            </div>

            <div>
              <h3 className="mb-3">Data Management</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4">
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
                {students.length > 0 &&
                  <p>
                    <button type="button" className="button-small" onClick={handleClearCounts}>Clear all counts</button>
                  </p>
                }
                <button
                  className="button-small button-danger w-max mt-6"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
                      setClasses([]);
                      setStudents([]);
                      setSelectedClassId(0);
                      setSelectedStudentId(null);
                      setLayout({ rows: 1, columns: 1, teacher: "" });
                      localStorage.removeItem("class-garden-data");
                      setShowSettings(false);
                    }
                  }}
                >
                  Delete all data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
