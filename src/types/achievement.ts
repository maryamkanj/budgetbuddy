export type AchievementType = 'Badge' | 'Streak';

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  name: string;
  description?: string;
  points: number;
  achievedAt: string;
}