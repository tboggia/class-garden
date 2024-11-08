<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex flex-wrap justify-between items-center mb-4">
      <h2 class="text-lg font-bold">Class Periods</h2>
      <div class="flex gap-2">
        <button
          @click="showGridModal = true"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Edit Grid
        </button>
        <button
          @click="openAddSection()"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Period
        </button>
      </div>
      <div class="text-sm text-gray-600 mb-4 w-full">
        Grid: {{ store.state.gridRows || 4 }} x
        {{ store.state.gridColumns || 8 }}
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="section in sections"
        :key="section.id"
        class="flex items-center gap-2 p-3 rounded border"
        :class="[
          section.id === activeSectionId
            ? 'bg-blue-50 border-blue-500'
            : 'border-gray-200 hover:bg-gray-50',
        ]"
      >
        <div
          class="flex-grow cursor-pointer"
          @click="$emit('select-section', section.id)"
        >
          <div class="font-semibold">Period {{ section.periodNumber }}</div>
        </div>
        <button
          @click="openEditSection(section)"
          class="text-gray-500 hover:text-blue-500"
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
        <button
          @click="confirmDeleteSection(section)"
          class="text-gray-500 hover:text-red-500"
          :class="[
            section.periodNumber === sections.length
              ? 'show'
              : 'hidden'
          ]"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <EditSectionModal
      :show="showSectionModal"
      :section="selectedSection"
      @close="showSectionModal = false"
      @save="saveSection"
    />

    <EditGridModal
      :show="showGridModal"
      :initial-rows="Number(store.state.gridRows || 5)"
      :initial-columns="Number(store.state.gridColumns || 6)"
      @close="showGridModal = false"
      @save="saveGrid"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">Delete Period</h3>
        <p class="mb-4">
          Are you sure you want to delete Period
          {{ sectionToDelete?.periodNumber }}? This will remove all student
          assignments for this period.
        </p>
        <div class="flex justify-end gap-2">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            @click="deleteSection"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ClassSection } from '../types';
import EditSectionModal from './EditSectionModal.vue';
import EditGridModal from './EditGridModal.vue';
import { store } from '../store';

export default Vue.extend({
  name: 'SectionPanel',
  components: {
    EditSectionModal,
    EditGridModal,
  },
  props: {
    sections: {
      type: Array as () => ClassSection[],
      required: true,
    },
    activeSectionId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      showSectionModal: false,
      showGridModal: false,
      showDeleteModal: false,
      selectedSection: null as ClassSection | null,
      sectionToDelete: null as ClassSection | null,
      store,
    };
  },
  methods: {
    openAddSection() {
      this.$emit('add-section', {periodNumber: this.sections.length + 1});
    },
    openEditSection(section: ClassSection) {
      this.selectedSection = section;
      this.showSectionModal = true;
    },
    confirmDeleteSection(section: ClassSection) {
      this.sectionToDelete = section;
      this.showDeleteModal = true;
    },
    deleteSection() {
      if (this.sectionToDelete) {
        this.$emit('delete-section', this.sectionToDelete.id);
        this.showDeleteModal = false;
        this.sectionToDelete = null;
      }
    },
    saveSection(section: ClassSection) {
      this.$emit(
        this.selectedSection ? 'update-section' : 'add-section',
        section
      );
      this.showSectionModal = false;
    },
    saveGrid({ rows, columns }: { rows: number; columns: number }) {
      this.$emit('update-grid', {
        rows: Number(rows),
        columns: Number(columns),
      });
      this.showGridModal = false;
    },
  },
});
</script>
