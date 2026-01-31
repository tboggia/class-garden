
export interface Class {
  id: number;
  name: string;
}

export interface Student {
  id: number;
  name: string;
  classId: number;
  row: number;
  column: number;
  spokeUpCount: number;
  disruptiveCount: number;
}

export interface LayoutSettings {
  teacher: string;
  rows: number;
  columns: number;
}
