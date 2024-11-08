import Vue from 'nativescript-vue';
import { AppState, Student, ClassSection } from '../types';

const state: AppState = Vue.observable({
  students: [],
  sections: [],
  activeSectionId: null
});

export const store = {
  state,
  
  addStudent(student: Student) {
    state.students.push(student);
  },
  
  addSection(section: ClassSection) {
    state.sections.push(section);
  },
  
  setActiveSection(sectionId: string) {
    state.activeSectionId = sectionId;
  },
  
  addParticipationPoint(studentId: string) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      student.participationPoints++;
    }
  },
  
  getActiveSection() {
    return state.sections.find(s => s.id === state.activeSectionId);
  },
  
  getStudentsForSection(sectionId: string) {
    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return [];
    
    return state.students.filter(student => 
      section.seatAssignments.hasOwnProperty(student.id)
    );
  }
};