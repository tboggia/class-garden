import { useState, useEffect, useRef } from 'react';
import type { Class, Student, LayoutSettings } from './types/models';
import ClassSelector from './components/ClassSelector';
import StudentList from './components/StudentList';
import ClassroomGrid from './components/ClassroomGrid';
import StudentDetailPanel from './components/StudentDetailPanel';
import './App.css'
import LayoutSettingsPanel from './components/LayoutSettingsPanel';

function App() {
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
    localStorage.setItem("class-garden-data", JSON.stringify(data));
  }, [classes, students, layout]);

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
        students={students.filter((student) => selectedClassId === 0 || student.classId === selectedClassId)}
        selectedStudentId={selectedStudentId}
        classes={classes}
        selectedClassId={selectedClassId}
        layout={layout}
        onSelectStudent={setSelectedStudentId}
        onUpdateSeating={setStudents}
        onImportStudents={(importedStudents, importedClasses) => {
          setStudents([...students, ...importedStudents]);
          setClasses([...classes, ...importedClasses]);
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
