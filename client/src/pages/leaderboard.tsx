import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { AchievementBadge } from '@/components/achievements/achievement-badge';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Clock, Award } from 'lucide-react';

// Mock data for leaderboard and time saved
// In a real implementation, this would come from the API
const mockLeaderboardData = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', minutes_saved: 387, achievements: ['Time Wizard', 'Loop Slayer', 'Automation Hero'] },
  { id: 2, name: 'Michael Chen', email: 'michael@example.com', avatar: '', minutes_saved: 284, achievements: ['Loop Slayer', 'Automation Hero'] },
  { id: 3, name: 'Emily Rodriguez', email: 'emily@example.com', avatar: '', minutes_saved: 256, achievements: ['Time Wizard'] },
  { id: 4, name: 'David Kim', email: 'david@example.com', avatar: '', minutes_saved: 192, achievements: ['Loop Slayer'] },
  { id: 5, name: 'Jessica Taylor', email: 'jessica@example.com', avatar: '', minutes_saved: 145, achievements: [] },
];

const mockTimeSavedByDay = [
  { day: 'Mon', minutes: 54 },
  { day: 'Tue', minutes: 67 },
  { day: 'Wed', minutes: 42 },
  { day: 'Thu', minutes: 88 },
  { day: 'Fri', minutes: 71 },
  { day: 'Sat', minutes: 18 },
  { day: 'Sun', minutes: 15 },
];

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState('week');
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  // Get user's achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
  });
  
  // Get time saved
  const { data: timeSaved } = useQuery({
    queryKey: ['/api/time-saved/total'],
  });

  // Calculate hours and minutes from total minutes
  const hours = timeSaved ? Math.floor(timeSaved.minutes / 60) : 0;
  const minutes = timeSaved ? timeSaved.minutes % 60 : 0;
  
  // Find current user in leaderboard
  const userRank = mockLeaderboardData.findIndex(user => 
    user.email === currentUser?.email
  ) + 1;

  // Different colors for different bars
  const barColors = ['#3B82F6', '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top Navigation Bar */}
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button 
              type="button" 
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => document.querySelector('.md\\:flex')?.classList.toggle('hidden')}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <div className="flex-1 px-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Leaderboard & Achievements</h1>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Time Saved Summary */}
                <div className="mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Time Saved */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <Clock className="h-10 w-10 text-blue-500 mb-2" />
                          <h2 className="text-2xl font-bold text-gray-900">
                            {hours}h {minutes}m
                          </h2>
                          <p className="text-sm text-gray-600">Total Time Saved</p>
                        </div>
                        
                        {/* Leaderboard Position */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-green-600">
                                {userRank || '?'}
                              </span>
                            </div>
                            <Award className="h-10 w-10 text-green-200" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mt-2">
                            {userRank === 1 ? '🏆 1st Place' : userRank === 2 ? '🥈 2nd Place' : userRank === 3 ? '🥉 3rd Place' : `${userRank}th Place`}
                          </h2>
                          <p className="text-sm text-gray-600">Your Leaderboard Rank</p>
                        </div>
                        
                        {/* Achievements Count */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="flex space-x-1 mb-2">
                            {achievements.length > 0 ? (
                              achievements.slice(0, 3).map((achievement, index) => (
                                <span key={index} className="text-2xl">
                                  {achievement.badge === 'Time Wizard' ? '⏱️' : 
                                  achievement.badge === 'Loop Slayer' ? '🔄' : 
                                  achievement.badge === 'Automation Hero' ? '🤖' : '🏆'}
                                </span>
                              ))
                            ) : (
                              <span className="text-2xl">🏅</span>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {achievements.length}
                          </h2>
                          <p className="text-sm text-gray-600">Achievements Earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Time Saved Chart */}
                <div className="mb-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Time Saved History</CardTitle>
                        <Tabs defaultValue="week" value={timeRange} onValueChange={setTimeRange}>
                          <TabsList>
                            <TabsTrigger value="week">This Week</TabsTrigger>
                            <TabsTrigger value="month">This Month</TabsTrigger>
                            <TabsTrigger value="year">This Year</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={mockTimeSavedByDay}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value} minutes`, 'Time Saved']} />
                            <Bar dataKey="minutes" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                              {mockTimeSavedByDay.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Team Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Leaderboard</CardTitle>
                    <CardDescription>See who's saving the most time in your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockLeaderboardData.map((user, index) => (
                        <div key={user.id} className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? 'bg-yellow-50 border border-yellow-100' :
                          index === 1 ? 'bg-gray-50 border border-gray-200' :
                          index === 2 ? 'bg-amber-50 border border-amber-100' : 'bg-white border border-gray-100'
                        }`}>
                          <div className="flex items-center">
                            <div className="w-8 text-center font-bold mr-3 text-gray-500">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {Math.floor(user.minutes_saved / 60)}h {user.minutes_saved % 60}m
                              </p>
                              <p className="text-xs text-gray-500">saved</p>
                            </div>
                            <div className="flex -space-x-2">
                              {user.achievements.slice(0, 3).map((badge, badgeIndex) => (
                                <div key={badgeIndex} className="h-8 w-8 rounded-full bg-white border border-white shadow-sm flex items-center justify-center">
                                  {badge === 'Time Wizard' ? '⏱️' : 
                                   badge === 'Loop Slayer' ? '🔄' : 
                                   badge === 'Automation Hero' ? '🤖' : '🏆'}
                                </div>
                              ))}
                              {user.achievements.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-gray-100 border border-white shadow-sm text-xs flex items-center justify-center">
                                  +{user.achievements.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <p className="text-xs text-gray-500">
                      Leaderboard updates daily. Keep using eXpieStack to climb the ranks!
                    </p>
                  </CardFooter>
                </Card>
                
                {/* Your Achievements */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Achievements</CardTitle>
                      <CardDescription>Badges you've earned through your productivity journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {achievements.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {achievements.map((achievement, index) => (
                            <AchievementBadge key={index} badge={achievement.badge} />
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          <p>No achievements yet</p>
                          <p className="text-sm mt-2">
                            Use canned responses, create automations, and complete tasks to earn badges!
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 px-6 py-3">
                      <div className="w-full">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Available Achievements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">Loop Slayer</p>
                              <p className="text-xs text-gray-500">Use 10+ canned responses</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">Automation Hero</p>
                              <p className="text-xs text-gray-500">Create 5+ automations</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">Time Wizard</p>
                              <p className="text-xs text-gray-500">Save 100+ minutes</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
