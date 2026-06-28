export interface RoundSummary {
  id: string;
  date: string;
  course: string;
  total: number;
  holeCount: number;
  front9: number;
  back9: number;
  holes: number[];
  complete: boolean;
}
