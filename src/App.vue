<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-600 text-white p-4">
      <h1 class="text-xl font-bold">Class Garden</h1>
    </nav>

    <div class="container mx-auto p-4">
      <div class="grid grid-cols-6 grid-auto-row gap-4">
        <div class="col-span-full w-full">
          <SectionPanel
            :sections="sections"
            :active-section-id="store.state.activeSectionId"
            @add-section="addSection"
            @update-section="updateSection"
            @delete-section="deleteSection"
            @select-section="setActiveSection"
            @update-grid="updateGrid"
          />
        </div>

        <div class="col-span-full md:col-span-2">
          <StudentPanel
            :students="students"
            :sections="sections"
            @add-student="addStudent"
            @update-student="updateStudent"
            @update-section="updateSection"
          />
        </div>

        <div class="col-span-full md:col-span-4">
          <SeatingGrid
            :section="activeSection"
            :students="students"
            @add-point="addPoint"
            @update-section="updateSection"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { store } from './store';
import { Student, ClassSection } from './types';
import SectionPanel from './components/SectionPanel.vue';
import StudentPanel from './components/StudentPanel.vue';
import SeatingGrid from './components/SeatingGrid.vue';

export default Vue.extend({
  name: 'App',

  components: {
    SectionPanel,
    StudentPanel,
    SeatingGrid,
  },

  data() {
    return {
      store,
    };
  },

  computed: {
    sections(): ClassSection[] {
      return this.store.state.sections;
    },

    students(): Student[] {
      return this.store.state.students;
    },

    activeSection(): ClassSection | undefined {
      return this.store.getActiveSection();
    },
  },

  methods: {
    addSection(section: ClassSection) {
      const newSection: ClassSection = {
        id: Date.now().toString(),
        periodNumber: section.periodNumber,
        seatAssignments: {},
      };
      this.store.addSection(newSection);
      // this.setActiveSection(newSection.id);
    },

    updateSection(section: ClassSection) {
      this.store.updateSection(section);
    },

    deleteSection(sectionId: string) {
      this.store.deleteSection(sectionId);
    },

    addStudent(student: Student) {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: student.name,
        photoUrl: student.photoUrl || 'https://via.placeholder.com/150',
        participationPoints: student.participationPoints || 0,
      };
      this.store.addStudent(newStudent);
    },

    updateStudent( student: Student ) {
      
      this.store.updateStudent(student);
      this.store.state.sections.forEach((section) => {
        this.store.updateSection(section);
      });
    },

    setActiveSection(sectionId: string) {
      this.store.setActiveSection(sectionId);
    },

    addPoint(studentId: string) {
      this.store.addParticipationPoint(studentId);
    },

    updateGrid({ rows, columns }: { rows: number; columns: number }) {
      this.store.updateGrid(rows, columns);
    },
  },
});
</script>
