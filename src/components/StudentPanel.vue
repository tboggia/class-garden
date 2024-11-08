<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex flex-wrap justify-between items-center mb-4">
      <h2 class="w-full md:w-auto text-lg font-bold">Students</h2>
      <button
        @click="openAddStudent()"
        class="bg-blue-500 text-white px-2 lg:px-4 py-1 lg:py-2 rounded hover:bg-blue-600"
      >
        Add Student
      </button>
    </div>
    <div class="space-y-2">
      <div
        v-for="student in students"
        :key="student.id"
        class="flex items-center gap-3 p-3 border border-gray-200 rounded"
      >
        <img
          :src="student.photoUrl"
          :alt="student.name"
          class="flex-shrink aspect-square max-w-10 max-h-10 rounded-full object-cover"
        />
        <div class="flex-grow">
          <div>{{ student.name }}</div>
          <div class="text-sm text-gray-500">
            {{ getStudentSection(student) }}
          </div>
        </div>
        <span
          class="bg-blue-500 text-white w-8 h-8 rounded-full aspect-square flex items-center justify-center"
        >
          {{ student.participationPoints }}
        </span>
        <button
          @click="openEditStudent(student)"
          class="aspect-square text-gray-500 hover:text-blue-500"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    </div>

    <EditStudentModal
      :show="showStudentModal"
      :student="selectedStudent"
      :sections="sections"
      :students="students"
      @close="showStudentModal = false"
      @save="saveStudent"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Student, ClassSection } from '../types';
import EditStudentModal from './EditStudentModal.vue';

export default Vue.extend({
  name: 'StudentPanel',
  components: {
    EditStudentModal,
  },
  props: {
    students: {
      type: Array as () => Student[],
      required: true,
    },
    sections: {
      type: Array as () => ClassSection[],
      required: true,
    },
  },
  data() {
    return {
      showStudentModal: false,
      selectedStudent: null as Student | null,
    };
  },
  methods: {
    openAddStudent() {
      this.selectedStudent = null;
      this.showStudentModal = true;
    },
    openEditStudent(student: Student) {
      this.selectedStudent = student;
      this.showStudentModal = true;
    },
    saveStudent({
      student,
      sections,
    }: {
      student: Student;
      sections: ClassSection[];
    }) {
      this.$emit(
        this.selectedStudent ? 'update-student' : 'add-student',
        student,
      );
      sections.forEach((section) => {
        this.$emit('update-section', section);
      });
      this.showStudentModal = false;
    },
    getStudentSection(student: Student): string {
      const section = this.sections.find((s) =>
        Object.keys(s.seatAssignments).includes(student.id)
      );
      return section ? `Period ${section.periodNumber}` : 'Not Assigned';
    },
  },
});
</script>
