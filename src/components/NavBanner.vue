<template>
  <nav class="bg-blue-600 p-4 flex justify-between items-center w-full">
    <h1 class="text-xl text-white font-bold">Class Garden</h1>
    <div class="text-center">
      <button
        @click="showGridModal = true"
        class="bg-white text-black px-4 py-2 rounded hover:bg-gray-600 hover:text-white"
      >
        Edit Grid
      </button>
      <div class="text-sm text-white w-full">
        Grid: {{ store.state.gridRows || 4 }} x
        {{ store.state.gridColumns || 8 }}
      </div>
    </div>
    <EditGridModal
      :show="showGridModal"
      :initial-rows="Number(store.state.gridRows || 5)"
      :initial-columns="Number(store.state.gridColumns || 6)"
      @close="showGridModal = false"
      @save="saveGrid"
    />
  </nav>
</template>
  
<script lang="ts">
  import Vue from 'vue';
  import EditGridModal from './EditGridModal.vue';
  import { store } from '../store';
  
  export default Vue.extend({
    name: 'NavBanner',
    components: {
      EditGridModal,
    },
    props: {
    
    },
    data() {
      return {
        showGridModal: false,
        store,
      };
    },
    methods: {
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
  