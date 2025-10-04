'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { localStorageService } from '@/lib/localStorage';
import { Achievement, AchievementType } from '@/types/achievement';
import { User } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target, Calendar, Award } from 'lucide-react';

type UpcomingAchievement = {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: React.ReactNode;
};

const upcomingAchievements: UpcomingAchievement[] = [
  {
    id: 'upcoming-1',
    name: '7-Day Streak',
    description: 'Log transactions for 7 consecutive days',
    points: 150,
    icon: <Zap className="h-6 w-6 text-yellow-600" />
  },
  {
    id: 'upcoming-2',
    name: 'Budget Master',
    description: 'Stay within budget for 30 days',
    points: 300,
    icon: <Trophy className="h-6 w-6 text-purple-600" />
  },
  {
    id: 'upcoming-3',
    name: 'Goal Crusher',
    description: 'Complete 5 financial goals',
    points: 250,
    icon: <Target className="h-6 w-6 text-blue-600" />
  },
  {
    id: 'upcoming-4',
    name: 'Early Bird',
    description: 'Log transactions before noon for 14 days',
    points: 200,
    icon: <Star className="h-6 w-6 text-green-600" />
  }
];

export default function AchievementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    initializeAchievements(currentUser.id);
  }, [router]);

  const initializeAchievements = (userId: string): void => {
    setIsLoading(true);
    try {
      const existingAchievements = localStorageService.getAchievementsByUserId?.(userId) || [];
      
      if (existingAchievements.length > 0) {
        setAchievements(existingAchievements);
        updateStats(existingAchievements);
      } else {
        const defaultAchievements: Achievement[] = [
          {
            id: '1',
            userId: userId,
            type: 'Badge',
            name: 'First Transaction',
            description: 'Logged your first transaction',
            points: 50,
            achievedAt: new Date().toISOString()
          },
          {
            id: '2',
            userId: userId,
            type: 'Streak',
            name: '3-Day Streak',
            description: 'Logged transactions for 3 consecutive days',
            points: 100,
            achievedAt: new Date().toISOString()
          },
          {
            id: '3',
            userId: userId,
            type: 'Badge',
            name: 'Goal Setter',
            description: 'Set your first financial goal',
            points: 75,
            achievedAt: new Date().toISOString()
          }
        ];

        defaultAchievements.forEach(achievement => {
          localStorageService.addAchievement?.(achievement);
        });

        setAchievements(defaultAchievements);
        updateStats(defaultAchievements);
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (achievementsList: Achievement[]): void => {
    const points = achievementsList.reduce((sum, achievement) => sum + achievement.points, 0);
    const streakDays = achievementsList.some(a => a.name.includes('3-Day Streak')) ? 3 : 0;
    setTotalPoints(points);
    setStreak(streakDays);
  };

  const getAchievementIcon = (type: AchievementType, name: string): React.ReactElement => {
    if (name.toLowerCase().includes('streak')) return <Zap className="h-6 w-6 text-yellow-600" />;
    if (name.toLowerCase().includes('goal')) return <Target className="h-6 w-6 text-purple-600" />;
    if (type === 'Badge') return <Award className="h-6 w-6 text-blue-600" />;
    return <Trophy className="h-6 w-6 text-green-600" />;
  };

  const getNextMilestone = (currentPoints: number): { nextMilestone: number; progress: number } => {
    const milestones = [100, 250, 500, 1000, 2500];
    const nextMilestone = milestones.find(milestone => milestone > currentPoints) || 2500;
    const progress = Math.min(100, (currentPoints / nextMilestone) * 100);
    
    return { nextMilestone, progress };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading achievements...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { nextMilestone, progress } = getNextMilestone(totalPoints);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Track your progress and earn rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime points earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} days</div>
              <p className="text-xs text-muted-foreground">
                Consistent logging streak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                Badges unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Milestone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{totalPoints} points</span>
                <span>{nextMilestone} points</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600 text-center">
                {nextMilestone - totalPoints} points until next milestone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-500">
                  Start using BudgetBuddy to unlock achievements and earn points!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full">
                          {getAchievementIcon(achievement.type, achievement.name)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(achievement.achievedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 ml-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          +{achievement.points}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="p-3 bg-gray-100 rounded-full">
                    {achievement.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-blue-600">{achievement.points} points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}