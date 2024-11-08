export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  participationPoints: number;
}

export interface ClassSection {
  id: string;
  periodNumber: number;
  seatAssignments: Record<string, number>;
}

export interface AppState {
  students: Student[];
  sections: ClassSection[];
  activeSectionId: string | null;
  gridRows: number;
  gridColumns: number;
}
