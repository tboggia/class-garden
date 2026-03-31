import type { Student, LayoutSettings } from '../types/models';

export function findEmptyCell(students: Student[], classId: number, layout: LayoutSettings): { row: number; column: number } | null {
  const rows = Number(layout.rows);
  const cols = Number(layout.columns);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const occupied = students.some((s) => {
        const a = s.classAssignments[classId];
        return a && Number(a.row) === row && Number(a.column) === col;
      });
      if (!occupied) return { row, column: col };
    }
  }
  return null;
}

/**
 * Find the first empty cell in the grid, expanding rows if the grid is full.
 * Returns the assigned cell and the (possibly expanded) layout.
 */
export function assignSeatInGrid(
  students: Student[],
  classId: number,
  layout: LayoutSettings,
): { cell: { row: number; column: number }; layout: LayoutSettings } {
  const cell = findEmptyCell(students, classId, layout);
  if (cell) return { cell, layout };

  const newRowIndex = Number(layout.rows);
  const expandedLayout = { ...layout, rows: newRowIndex + 1 };
  return { cell: { row: newRowIndex, column: 0 }, layout: expandedLayout };
}
