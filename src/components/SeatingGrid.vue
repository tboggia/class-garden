<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-lg font-bold mb-4">
      {{
        section ? `Period ${section.periodNumber} Seating` : 'Select a Period'
      }}
    </h2>

    <div v-if="section" class="mb-4">
      <div class="flex gap-2 mb-4">
        <div class="flex-1 p-4 border border-dashed border-gray-300 rounded">
          <h3 class="text-sm font-semibold mb-2">
            Students in Period {{ section.periodNumber }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="student in periodStudents"
              :key="student.id"
              class="relative z-0"
              draggable="true"
              @dragstart="dragStart($event, student)"
              @dragend="dragEnd"
            >
              <img
                :src="student.photoUrl"
                :alt="student.name"
                class="w-12 h-12 rounded-full object-cover cursor-move"
              />
              <span
                class="absolute -top-2 -right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
              >
                {{ student.participationPoints }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-2" :style="gridStyle">
        <div
          v-for="index in totalSeats"
          :key="index - 1"
          class="aspect-square border border-gray-200 rounded p-1 relative"
          @dragover.prevent
          @drop="dropStudent($event, index - 1)"
        >
          <template v-if="getStudentInSeat(index - 1)">
            <div
              draggable="true"
              @dragstart="dragStart($event, getStudentInSeat(index - 1))"
              @dragend="dragEnd"
            >
              <img
                :src="getStudentInSeat(index - 1).photoUrl"
                :alt="getStudentInSeat(index - 1).name"
                @click="$emit('add-point', getStudentInSeat(index - 1).id)"
                class="aspect-square w-full object-cover rounded cursor-move"
              />
              <span
                class="absolute top-0 right-0 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm -mt-2 -mr-2"
              >
                {{ getStudentInSeat(index - 1).participationPoints }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500 text-center py-8">
      Please select a class period to view the seating grid
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Student, ClassSection } from '../types';
import { store } from '../store';

export default Vue.extend({
  name: 'SeatingGrid',
  props: {
    section: {
      type: Object as () => ClassSection,
      default: null,
    },
    students: {
      type: Array as () => Student[],
      required: true,
    },
  },
  data() {
    return {
      draggedStudent: null as Student | null,
      store,
    };
  },
  computed: {
    totalSeats(): number {
      return this.store.state.gridRows * this.store.state.gridColumns;
    },
    gridStyle(): object {
      return {
        gridTemplateRows: `repeat(${this.store.state.gridRows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${this.store.state.gridColumns}, minmax(0, 1fr))`,
      };
    },
    periodStudents(): Student[] {
      if (!this.section) return [];
      const sectionStudentIds = Object.keys(this.section.seatAssignments);
      return this.students.filter((student) =>
        sectionStudentIds.includes(student.id)
      );
    },
  },
  methods: {
    getStudentInSeat(seatIndex: number): Student | null {
      if (!this.section) return null;
      const studentId = Object.entries(this.section.seatAssignments).find(
        ([_, seat]) => seat === seatIndex
      )?.[0];
      return studentId
        ? this.students.find((s) => s.id === studentId) || null
        : null;
    },
    dragStart(event: DragEvent, student: Student) {
      this.draggedStudent = student;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
    },
    dragEnd() {
      this.draggedStudent = null;
    },
    dropStudent(event: DragEvent, seatIndex: number) {
      if (!this.draggedStudent || !this.section) return;

      const updatedSection = { ...this.section };
      const currentOccupantId = Object.entries(
        updatedSection.seatAssignments
      ).find(([_, seat]) => seat === seatIndex)?.[0];

      // Find the current seat of the dragged student
      const draggedStudentCurrentSeat =
        updatedSection.seatAssignments[this.draggedStudent.id];

      // If there's a student in the target seat
      if (currentOccupantId) {
        // If dragged student was already seated, put the displaced student there
        if (draggedStudentCurrentSeat !== undefined) {
          updatedSection.seatAssignments[currentOccupantId] =
            draggedStudentCurrentSeat;
        } else {
          // Find the first empty seat
          const occupiedSeats = Object.values(updatedSection.seatAssignments);
          const firstEmptySeat = Array.from(Array(this.totalSeats).keys()).find(
            (i) => !occupiedSeats.includes(i)
          );

          if (firstEmptySeat !== undefined) {
            updatedSection.seatAssignments[currentOccupantId] = firstEmptySeat;
          }
        }
      }

      // Place dragged student in the target seat
      updatedSection.seatAssignments[this.draggedStudent.id] = seatIndex;

      this.$emit('update-section', updatedSection);
    },
  },
});
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
