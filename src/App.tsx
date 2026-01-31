import { useState } from 'react';
import type { Class, Student, LayoutSettings } from './types/models';
import ClassSelector from './components/ClassSelector';
import StudentList from './components/StudentList';
import ClassroomGrid from './components/ClassroomGrid';
import StudentDetailPanel from './components/StudentDetailPanel';
import './App.css'
import LayoutSettingsPanel from './components/LayoutSettingsPanel';

function App() {
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: "A Period" },
    { id: 2, name: "B Period" },
    { id: 3, name: "C Period" },
  ]);
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Alice", classId: 1, row: 1, column: 1, spokeUpCount: 0, disruptiveCount: 0 },
    { id: 2, name: "Bob", classId: 1, row: 1, column: 2, spokeUpCount: 0, disruptiveCount: 0 },
    { id: 3, name: "Charlie", classId: 1, row: 1, column: 3, spokeUpCount: 0, disruptiveCount: 0 },
  ]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(1);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutSettings>({
    rows: 5,
    columns: 5,
    teacher: ""
  });

  return (
    <>
    <div>
      <h1>{layout.teacher ? layout.teacher + "'s " : ""}Class Garden</h1>
      <LayoutSettingsPanel
        layout={layout}
        onUpdateLayout={setLayout}
      />

      <ClassSelector
        classes={classes}
        selectedClassId={selectedClassId}
        onSelectClass={(id) => {
          setSelectedStudentId(null);
          setSelectedClassId(id);
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
        students={students.filter((student) => selectedClassId === null || student.classId === selectedClassId)}
        selectedStudentId={selectedStudentId}
        layout={layout}
        onSelectStudent={setSelectedStudentId}
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
        onUpdateSeating={setStudents}
        onImportStudents={(names) => {
          if (!selectedClassId) return;

          const newStudents = names.map((name) => ({
            id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
            name,
            classId: selectedClassId,
            row: 0,
            column: 0,
            spokeUpCount: 0,
            disruptiveCount: 0
          }));
          // setStudents([...students, ...newStudents]);
        }
        }
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
      <ClassroomGrid
        layout={layout}
        students={students.filter((student) => selectedClassId === null || student.classId === selectedClassId)}
        onSelectStudent={setSelectedStudentId}
        onSeatChange={(id, row, column) => {
          setStudents(
            students.map((student) =>
              student.id === id ? { ...student, row, column } : student
            )
          )
        }}
      />
    </div>
    </>
  )
}

export default App
