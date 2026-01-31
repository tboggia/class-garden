# Class Garden
The purpose of the app is to help a teacher keep track of how often students in each of the teacher's classes speak up or cause problems. The teacher has the ability to create classes, import student names, assign them to their class, move students from one class to another, and assign "seats" to each student. There is an option for the teacher to define how many rows and columns of desks there are in the classroom.

The UI includes a view of the classroom with the students for each class laid out by their seat assignment and allow the teacher to tap/click on a student and select whether the student spoke up or was disruptive.

This app lives at a fixed URL so the teacher can make a link on their iPad and access it easily.


## Classes
### Global Layout Settings
teacher String
rows Number
columns Number
() change

### Class
id Number
name String
() rename
() delete
() create
() select
<!-- students Array of Numbers -->

### Student
id Number
name String
classId Number
seatAssignment Object SeatAssignment
spokeUpCount Number
disruptiveCount Number
() import
() select
() add
() incrementValue
() assignSeat
() move


### Seat Assignment
row Number 
column Number

### App State
classes Array Number
students Array Number
selectedClass Number
selectedStudent Number
globalLayout ?
() load
() save

## Top-level state
* All classes
* All students
* The currently selected class
* The currently selected student (for the detail panel)

## Components
* **ClassSelector**: Shows a list of classes and lets the teacher switch between them.
  * State.classes
  * State.selectedClass
  * () change State.selectedClass
  * () add Class
  * () rename Class.name
  * () delete Class

* **StudentList**: Displays students in the selected class.
  * () filter State.students by State.selectedClass
    * Nice to Have
      * and by Student.name
  * () select State.selectedStudent
    * Nice to haves
      * () update Student.spokeUpCount
      * () update Student.disruptiveCount
  * () move
  * () import
  * () add

* **ClassroomGrid**: Renders the seating chart.
  * Global.rows Global.columns
  * () filter State.students by State.selectedClass
  * () select State.selectedStudent

* **LayoutSettingsPanel**: a simple UI where the teacher sets the number of rows and columns
  * Global.rows Global.columns
  * () update Global.rows Global.columns

* **StudentDetailPanel**
  * State.selectedStudent
  * () increase Student.spokeUpCount
  * () increase Student.disruptiveCount
