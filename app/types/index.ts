export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  participationPoints: number;
}

export interface ClassSection {
  id: string;
  periodNumber: number;
  gridRows: number;
  gridColumns: number;
  seatAssignments: Record<string, number>; // studentId -> seatNumber
}

export interface AppState {
  students: Student[];
  sections: ClassSection[];
  activeSectionId: string | null;
}