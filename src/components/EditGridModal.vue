<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    v-if="show"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-bold mb-4">Edit Seating Grid</h3>
      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Number of Rows</label>
          <input
            type="number"
            v-model.number="form.rows"
            required
            min="1"
            max="10"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1"
            >Number of Columns</label
          >
          <input
            type="number"
            v-model.number="form.columns"
            required
            min="1"
            max="10"
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

export default Vue.extend({
  props: {
    show: Boolean,
    initialRows: {
      type: Number,
      default: 3,
    },
    initialColumns: {
      type: Number,
      default: 8,
    },
  },
  data() {
    return {
      form: {
        rows: 0,
        columns: 0,
      },
    };
  },
  watch: {
    initialRows: {
      immediate: true,
      handler(value: number) {
        this.form.rows = Number(value);
      },
    },
    initialColumns: {
      immediate: true,
      handler(value: number) {
        this.form.columns = Number(value);
      },
    },
  },
  methods: {
    save() {
      this.$emit('save', {
        rows: Number(this.form.rows),
        columns: Number(this.form.columns),
      });
    },
  },
});
</script>
