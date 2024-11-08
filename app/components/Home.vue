<template>
  <Page>
    <ActionBar>
      <Label text="Class Garden" class="font-bold text-lg" />
    </ActionBar>

    <TabView selectedIndex="0" androidTabsPosition="bottom">
      <TabViewItem title="Classes">
        <GridLayout rows="auto, *">
          <StackLayout row="0" class="p-4">
            <Button
              text="Add New Section"
              @tap="showAddSectionModal"
              class="bg-blue-500 text-white p-2 rounded"
            />
          </StackLayout>
          <ListView row="1" :items="sections" @itemTap="onSectionTap">
            <template #default="{ item }">
              <StackLayout class="p-4 border-b border-gray-200">
                <Label
                  :text="'Period ' + item.periodNumber"
                  class="text-lg font-bold"
                />
                <Label
                  :text="'Grid: ' + item.gridRows + ' x ' + item.gridColumns"
                  class="text-gray-600"
                />
              </StackLayout>
            </template>
          </ListView>
        </GridLayout>
      </TabViewItem>

      <TabViewItem title="Students">
        <GridLayout rows="auto, *">
          <StackLayout row="0" class="p-4">
            <Button
              text="Add New Student"
              @tap="showAddStudentModal"
              class="bg-blue-500 text-white p-2 rounded"
            />
          </StackLayout>
          <ListView row="1" :items="students">
            <template #default="{ item }">
              <GridLayout
                columns="auto, *, auto"
                class="p-4 border-b border-gray-200"
              >
                <Image
                  :src="item.photoUrl"
                  width="40"
                  height="40"
                  class="rounded-full"
                  col="0"
                />
                <Label :text="item.name" col="1" class="text-lg ml-4" />
                <Label
                  :text="item.participationPoints"
                  col="2"
                  class="bg-blue-500 text-white rounded-full w-8 h-8 text-center"
                />
              </GridLayout>
            </template>
          </ListView>
        </GridLayout>
      </TabViewItem>

      <TabViewItem title="Seating">
        <GridLayout rows="auto, *" v-if="activeSection">
          <StackLayout row="0" class="p-4">
            <Label
              :text="'Period ' + activeSection.periodNumber"
              class="text-xl font-bold"
            />
          </StackLayout>
          <GridLayout row="1" :rows="gridRows" :columns="gridColumns">
            <StackLayout
              v-for="(seat, index) in totalSeats"
              :key="index"
              :row="getRowForSeat(index)"
              :col="getColForSeat(index)"
              class="border border-gray-300 p-2"
            >
              <template v-if="getStudentInSeat(index)">
                <Image
                  :src="getStudentInSeat(index).photoUrl"
                  stretch="aspectFill"
                  class="rounded-lg"
                  @tap="addPoint(getStudentInSeat(index).id)"
                />
                <Label
                  :text="getStudentInSeat(index).participationPoints"
                  class="bg-blue-500 text-white rounded-full w-6 h-6 text-center absolute top-1 right-1"
                />
              </template>
            </StackLayout>
          </GridLayout>
        </GridLayout>
        <StackLayout v-else class="p-4">
          <Label
            text="Please select a class section"
            class="text-lg text-gray-500 text-center"
          />
        </StackLayout>
      </TabViewItem>
    </TabView>
  </Page>
</template>

<script lang="ts">
import Vue from 'nativescript-vue';
import { store } from '../store';
import { Student, ClassSection } from '../types';

export default Vue.extend({
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

    gridRows(): string {
      if (!this.activeSection) return '';
      return Array(this.activeSection.gridRows).fill('*').join(', ');
    },

    gridColumns(): string {
      if (!this.activeSection) return '';
      return Array(this.activeSection.gridColumns).fill('*').join(', ');
    },

    totalSeats(): number {
      if (!this.activeSection) return 0;
      return this.activeSection.gridRows * this.activeSection.gridColumns;
    },
  },

  methods: {
    showAddSectionModal() {
      // Demo data for now
      const newSection: ClassSection = {
        id: Date.now().toString(),
        periodNumber: this.sections.length + 1,
        seatAssignments: {},
      };
      this.store.addSection(newSection);
    },

    showAddStudentModal() {
      // Demo data for now
      const newStudent: Student = {
        id: Date.now().toString(),
        name: `Student ${this.students.length + 1}`,
        photoUrl: 'https://via.placeholder.com/100',
        participationPoints: 0,
      };
      this.store.addStudent(newStudent);
    },

    onSectionTap(event: { index: number; item: ClassSection }) {
      this.store.setActiveSection(event.item.id);
    },

    getRowForSeat(seatIndex: number): number {
      if (!this.activeSection) return 0;
      return Math.floor(seatIndex / this.activeSection.gridColumns);
    },

    getColForSeat(seatIndex: number): number {
      if (!this.activeSection) return 0;
      return seatIndex % this.activeSection.gridColumns;
    },

    getStudentInSeat(seatIndex: number): Student | null {
      if (!this.activeSection) return null;
      const studentId = Object.entries(this.activeSection.seatAssignments).find(
        ([_, seat]) => seat === seatIndex
      )?.[0];
      return studentId
        ? this.students.find((s) => s.id === studentId) || null
        : null;
    },

    addPoint(studentId: string) {
      this.store.addParticipationPoint(studentId);
    },
  },
});
</script>

<style scoped>
.rounded-full {
  border-radius: 9999px;
}
</style>
