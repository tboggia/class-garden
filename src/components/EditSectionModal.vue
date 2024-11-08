<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    v-if="show"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-bold mb-4">
        {{ isNew ? 'Add' : 'Edit' }} Period
      </h3>
      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Period Number</label>
          <input
            type="number"
            v-model="form.periodNumber"
            required
            min="1"
            class="w-full p-2 border rounded"
          />
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
import { ClassSection } from '../types';

export default Vue.extend({
  props: {
    show: Boolean,
    section: {
      type: Object as () => ClassSection | null,
      default: null,
    },
  },
  data() {
    return {
      form: {
        periodNumber: null as number | null,
      },
    };
  },
  computed: {
    isNew(): boolean {
      return !this.section;
    },
  },
  watch: {
    show(newVal: boolean) {
      if (newVal) {
        this.form.periodNumber = this.section
          ? this.section.periodNumber
          : null;
      }
    },
  },
  methods: {
    save() {
      if (!this.form.periodNumber) return;

      this.$emit('save', {
        ...this.section,
        periodNumber: this.form.periodNumber,
      });
    },
  },
});
</script>
