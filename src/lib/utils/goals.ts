import { Database } from '@/types/database';

type Goal = Database['public']['Tables']['goals']['Row'];

/**
 * Check if a goal is overdue based on its deadline and current status
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (goal.status === 'Completed' || goal.status === 'Failed') {
    return false;
  }
  
  if (!goal.deadline) {
    return false;
  }
  
  const deadline = new Date(goal.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  deadline.setHours(0, 0, 0, 0);
  
  return deadline < today;
}

/**
 * Get the effective status of a goal, including overdue detection
 */
export function getGoalEffectiveStatus(goal: Goal): 'Active' | 'Completed' | 'Failed' | 'Overdue' {
  // If already completed or failed, return that status
  if (goal.status === 'Completed' || goal.status === 'Failed') {
    return goal.status;
  }
  
  // Check if goal is overdue
  if (isGoalOverdue(goal)) {
    return 'Overdue';
  }
  
  // Check if goal is completed by amount
  if (goal.current_amount >= goal.target_amount) {
    return 'Completed';
  }
  
  return 'Active';
}

/**
 * Get days remaining until deadline (negative if overdue)
 */
export function getDaysRemaining(goal: Goal): number | null {
  if (!goal.deadline) return null;
  
  const deadline = new Date(goal.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get a human-readable deadline status
 */
export function getDeadlineStatus(goal: Goal): string {
  const daysRemaining = getDaysRemaining(goal);
  
  if (daysRemaining === null) {
    return 'No deadline';
  }
  
  if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)} days overdue`;
  }
  
  if (daysRemaining === 0) {
    return 'Due today';
  }
  
  if (daysRemaining === 1) {
    return 'Due tomorrow';
  }
  
  if (daysRemaining <= 7) {
    return `${daysRemaining} days left`;
  }
  
  if (daysRemaining <= 30) {
    return `${daysRemaining} days left`;
  }
  
  return `${daysRemaining} days left`;
}

/**
 * Get urgency level for styling purposes
 */
export function getGoalUrgency(goal: Goal): 'low' | 'medium' | 'high' | 'critical' {
  const daysRemaining = getDaysRemaining(goal);
  
  if (daysRemaining === null) {
    return 'low';
  }
  
  if (daysRemaining < 0) {
    return 'critical';
  }
  
  if (daysRemaining <= 3) {
    return 'critical';
  }
  
  if (daysRemaining <= 7) {
    return 'high';
  }
  
  if (daysRemaining <= 30) {
    return 'medium';
  }
  
  return 'low';
}
