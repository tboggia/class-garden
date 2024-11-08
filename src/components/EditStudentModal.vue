<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    v-if="show"
  >
    <div class="bg-white rounded-lg p-6 w-[32rem]">
      <h3 class="text-lg font-bold mb-4">
        {{ isNew ? 'Add' : 'Edit' }} Student
      </h3>
      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            v-model="form.name"
            required
            class="w-full p-2 border rounded"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Photo</label>
          <input
            type="file"
            @change="onPhotoSelect"
            accept="image/*"
            class="w-full p-2 border rounded"
          />
          <img
            v-if="photoPreview"
            :src="photoPreview"
            class="mt-2 w-20 h-20 rounded-full object-cover"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1"
            >Participation Points</label
          >
          <input
            type="number"
            v-model.number="form.participationPoints"
            min="0"
            class="w-full p-2 border rounded"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Section</label>
          <select v-model="selectedSectionId" class="w-full p-2 border rounded">
            <option value="">Not Assigned</option>
            <option
              v-for="section in sections"
              :key="section.id"
              :value="section.id"
            >
              Period {{ section.periodNumber }}
            </option>
          </select>
        </div>

        <div class="mb-4" v-if="selectedSection">
          <label class="block text-sm font-medium mb-1">Seat Position</label>
          <div class="grid gap-2" :style="gridStyle">
            <button
              v-for="index in totalSeats"
              :key="index - 1"
              type="button"
              class="aspect-square border rounded p-1 hover:bg-gray-50"
              :class="{
                'bg-blue-100 border-blue-500': selectedSeat === index - 1,
                'cursor-not-allowed opacity-50':
                  isSeatOccupied(index - 1) && selectedSeat !== index - 1,
              }"
              :disabled="
                isSeatOccupied(index - 1) && selectedSeat !== index - 1
              "
              @click="selectSeat(index - 1)"
            >
              <template v-if="getStudentInSeat(index - 1)">
                <img
                  :src="getStudentInSeat(index - 1).photoUrl"
                  :alt="getStudentInSeat(index - 1).name"
                  class="w-full h-full object-cover rounded"
                />
              </template>
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                {{ index }}
              </div>
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Student, ClassSection } from '../types';
import { store } from '../store';

export default Vue.extend({
  props: {
    show: Boolean,
    student: {
      type: Object as () => Student | null,
      default: null,
    },
    sections: {
      type: Array as () => ClassSection[],
      required: true,
    },
    students: {
      type: Array as () => Student[],
      required: true,
    },
  },
  data() {
    return {
      form: {
        name: '',
        photoUrl: '',
        participationPoints: 0,
      },
      photoPreview: '',
      selectedSectionId: '',
      selectedSeat: null as number | null,
      store,
    };
  },
  computed: {
    isNew(): boolean {
      return !this.student;
    },
    selectedSection(): ClassSection | null {
      return this.sections.find((s) => s.id === this.selectedSectionId) || null;
    },
    totalSeats(): number {
      return this.store.state.gridRows * this.store.state.gridColumns;
    },
    gridStyle(): object {
      return {
        display: 'grid',
        gridTemplateRows: `repeat(${this.store.state.gridRows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${this.store.state.gridColumns}, minmax(0, 1fr))`,
      };
    },
  },
  watch: {
    show(newVal: boolean) {
      if (newVal) {
        if (this.student) {
          this.form.name = this.student.name;
          this.form.participationPoints = this.student.participationPoints;
          this.photoPreview = this.student.photoUrl;

          // Find section and seat for this student
          const section = this.sections.find((s) =>
            Object.keys(s.seatAssignments).includes(this.student.id)
          );

          if (section) {
            this.selectedSectionId = section.id;
            this.selectedSeat = section.seatAssignments[this.student.id];
          } else {
            this.selectedSectionId = '';
            this.selectedSeat = null;
          }
        } else {
          // Reset form for new student
          this.form.name = '';
          this.form.photoUrl = '';
          this.form.participationPoints = 0;
          this.photoPreview = '';
          this.selectedSectionId = '';
          this.selectedSeat = null;
        }
      }
    },
    selectedSectionId() {
      this.selectedSeat = null;
    },
  },
  methods: {
    onPhotoSelect(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.photoPreview = e.target?.result as string;
          this.form.photoUrl = this.photoPreview;
        };
        reader.readAsDataURL(file);
      }
    },
    getStudentInSeat(seatIndex: number): Student | null {
      if (!this.selectedSection) return null;
      const studentId = Object.entries(
        this.selectedSection.seatAssignments
      ).find(([_, seat]) => seat === seatIndex)?.[0];
      if (studentId === this.student?.id) return null;
      return studentId
        ? this.students.find((s) => s.id === studentId) || null
        : null;
    },
    isSeatOccupied(seatIndex: number): boolean {
      return this.getStudentInSeat(seatIndex) !== null;
    },
    selectSeat(seatIndex: number) {
      this.selectedSeat = this.selectedSeat === seatIndex ? null : seatIndex;
    },
    save() {
      const updatedStudent = {
        ...this.student,
        id: this.student?.id || Date.now().toString(),
        name: this.form.name,
        participationPoints: this.form.participationPoints,
        photoUrl:
          this.form.photoUrl ||
          this.photoPreview ||
          'https://via.placeholder.com/150',
      };

      // Create updated sections to handle seat assignments
      const updatedSections = this.sections.map((section) => {
        const updatedSection = { ...section };

        // Remove student from any existing seat assignments
        if (this.student) {
          delete updatedSection.seatAssignments[this.student.id];
        }

        // Add student to selected section and seat
        if (
          section.id === this.selectedSectionId &&
          this.selectedSeat !== null
        ) {
          updatedSection.seatAssignments[updatedStudent.id] = this.selectedSeat;
        }

        return updatedSection;
      });

      this.$emit('save', {
        student: updatedStudent,
        sections: updatedSections,
      });
    },
  },
});
</script>
