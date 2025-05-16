import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActionItemCard } from '@/components/action-items/action-item-card';
import { CannedResponseCard } from '@/components/canned-responses/canned-response-card';
import { AchievementBadge } from '@/components/achievements/achievement-badge';
import { ModeSelector } from '@/components/ui/mode-selector';
import { ToastNotification } from '@/components/ui/toast-notification';
import { Clock, CheckCircle, Award } from 'lucide-react';
import { getCurrentTheme } from '@/lib/theme';

export default function Dashboard() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMinutes, setToastMinutes] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get current user's data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Get connected tools
  const { data: connectedTools = [] } = useQuery({
    queryKey: ['/api/tools'],
  });

  // Get action items
  const { data: actionItems = [] } = useQuery({
    queryKey: ['/api/action-items'],
  });

  // Get canned responses
  const { data: cannedResponses = [] } = useQuery({
    queryKey: ['/api/canned-responses'],
  });

  // Get user achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/achievements'],
  });

  // Get total time saved
  const { data: timeSaved } = useQuery({
    queryKey: ['/api/time-saved/total'],
  });

  useEffect(() => {
    // Show a welcome toast when the dashboard loads
    const timer = setTimeout(() => {
      setToastMessage("Welcome to your productivity hub!");
      setToastMinutes(0);
      setShowToast(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const recentActionItems = actionItems.slice(0, 3);
  const recentCannedResponses = cannedResponses.slice(0, 2);

  const totalTimeSavedHours = timeSaved ? (timeSaved.minutes / 60).toFixed(1) : '0';
  const totalCompletedTasks = actionItems.filter(item => item.status === 'completed').length;
  const totalAchievements = achievements.length;

  const userMode = user?.mode || getCurrentTheme();

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
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <form className="w-full flex md:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">Search</label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input 
                      id="search-field" 
                      className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm" 
                      placeholder="Search across your tools" 
                      type="search" 
                      name="search"
                      onClick={() => setIsSearchOpen(true)}
                      onBlur={() => setIsSearchOpen(false)}
                    />
                  </div>
                </form>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notification Button */}
                <button type="button" className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Time Saved Badge */}
                <div className="ml-3 bg-indigo-50 p-1 px-3 rounded-full flex items-center">
                  <svg className="h-5 w-5 text-indigo-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-indigo-700">
                    {timeSaved ? `${timeSaved.minutes} minutes saved today` : 'Start saving time!'}
                  </span>
                </div>

                {/* Accessibility Menu */}
                <div className="ml-3 relative">
                  <a href="/accessibility">
                    <button type="button" className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Accessibility options</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Welcome Banner Component */}
                <WelcomeBanner mode={userMode} />

                {/* Stats Grid */}
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Your Productivity Stats</h2>
                  <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatsCard
                      title="Total Time Saved"
                      value={`${totalTimeSavedHours} hours`}
                      icon={<Clock className="h-6 w-6 text-white" />}
                      bgColor="bg-indigo-500"
                      linkText="View time report"
                      linkHref="/time-saved"
                    />
                    <StatsCard
                      title="Completed Action Items"
                      value={`${totalCompletedTasks} tasks`}
                      icon={<CheckCircle className="h-6 w-6 text-white" />}
                      bgColor="bg-green-500"
                      linkText="View all tasks"
                      linkHref="/action-items"
                    />
                    <StatsCard
                      title="Earned Achievements"
                      value={`${totalAchievements} badges`}
                      icon={<Award className="h-6 w-6 text-white" />}
                      bgColor="bg-yellow-500"
                      linkText="View achievements"
                      linkHref="/leaderboard"
                    />
                  </div>
                </div>

                {/* Action Items Section */}
                <div className="mt-8">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Recent Action Items</h2>
                    <a href="/action-items" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</a>
                  </div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                      {recentActionItems.length > 0 ? (
                        recentActionItems.map((item) => (
                          <ActionItemCard key={item.id} actionItem={item} />
                        ))
                      ) : (
                        <li className="px-4 py-6 sm:px-6 text-center text-gray-500">
                          No action items yet. Create one to get started!
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Canned Responses Section */}
                <div className="mt-8">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Your Canned Responses</h2>
                    <a href="/canned-responses">
                      <button type="button" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New
                      </button>
                    </a>
                  </div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="border-t border-gray-200 divide-y divide-gray-200">
                      {recentCannedResponses.length > 0 ? (
                        recentCannedResponses.map((response) => (
                          <CannedResponseCard key={response.id} response={response} />
                        ))
                      ) : (
                        <div className="px-4 py-6 sm:px-6 text-center text-gray-500">
                          No canned responses yet. Create one to save time!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Achievements Section */}
                <div className="mt-8 mb-10">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Your Achievements</h2>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    {achievements.length > 0 ? (
                      <div className="flex space-x-4 justify-center sm:justify-start">
                        {achievements.map((achievement) => (
                          <AchievementBadge key={achievement.id} badge={achievement.badge} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        Complete actions to earn achievement badges!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notification Component */}
      {showToast && (
        <ToastNotification
          message={toastMessage}
          minutes={toastMinutes}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}
