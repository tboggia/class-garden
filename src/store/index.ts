import Vue from 'vue';
import { AppState, Student, ClassSection } from '../types';
import { dbService, initDatabase } from '../database/db';

// Initialize empty state
const state: AppState = Vue.observable({
  students: [],
  sections: [],
  activeSectionId: null,
  gridRows: 3,
  gridColumns: 8,
});

// Initialize database and load data
initDatabase().then(async () => {
  state.students = await dbService.getAllStudents();
  state.sections = await dbService.getAllSections();
});

export const store = {
  state,

  async addStudent(student: Student) {
    await dbService.createStudent(student);
    state.students.push(student);
  },

  async updateStudent(updatedStudent: Student) {
    await dbService.updateStudent(updatedStudent);
    const index = state.students.findIndex((s) => s.id === updatedStudent.id);
    if (index !== -1) {
      state.students[index] = updatedStudent;
    }
  },

  async addSection(section: ClassSection) {
    await dbService.createSection(section);
    state.sections.push(section);
  },

  async updateSection(updatedSection: ClassSection) {
    await dbService.updateSection(updatedSection);
    const index = state.sections.findIndex((s) => s.id === updatedSection.id);
    if (index !== -1) {
      state.sections[index] = updatedSection;
    }
  },

  async deleteSection(sectionId: string) {
    await dbService.deleteSection(sectionId);
    const index = state.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) {
      state.sections.splice(index, 1);
      if (state.activeSectionId === sectionId) {
        state.activeSectionId = state.sections[0]?.id || null;
      }
    }
  },

  setActiveSection(sectionId: string) {
    state.activeSectionId = sectionId;
  },

  async addParticipationPoint(studentId: string) {
    const student = state.students.find((s) => s.id === studentId);
    if (student) {
      student.participationPoints++;
      await dbService.updateStudent(student);
    }
  },

  getActiveSection() {
    return state.sections.find((s) => s.id === state.activeSectionId);
  },

  async updateGrid(rows: number, columns: number) {
    state.gridRows = rows;
    state.gridColumns = columns;
    await dbService.updateGrid(rows, columns);
  },

  getStudentsForSection(sectionId: string) {
    const section = state.sections.find((s) => s.id === sectionId);
    if (!section) return [];

    return state.students.filter((student) =>
      Object.keys(section.seatAssignments).includes(student.id)
    );
  },
};
