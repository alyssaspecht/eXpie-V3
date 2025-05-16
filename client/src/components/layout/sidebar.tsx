import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ModeSelector } from '@/components/ui/mode-selector';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  GitBranch,
  Award,
  Settings,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get current user's data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  // Get connected tools
  const { data: connectedTools = [] } = useQuery({
    queryKey: ['/api/tools'],
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Navigation items
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Action Items', href: '/action-items', icon: <CheckSquare className="h-5 w-5" /> },
    { label: 'Canned Responses', href: '/canned-responses', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Automations', href: '/automations', icon: <GitBranch className="h-5 w-5" /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <Award className="h-5 w-5" /> },
    { label: 'Settings', href: '/accessibility', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-2xl font-extrabold text-indigo-900 tracking-tight">
              eXpie
            </span>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              >
                <a
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`mr-3 ${
                    location === item.href
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          
          {/* Connected Tools Section */}
          <div className="border-t border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Connected Tools
            </h2>
            <div className="mt-3 space-y-2">
              {connectedTools.length > 0 ? (
                connectedTools.map((tool) => (
                  <div key={tool.id} className="flex items-center">
                    <div className={`flex-shrink-0 h-6 w-6 ${
                      tool.tool_name === 'Slack' ? 'text-blue-500' :
                      tool.tool_name === 'Gmail' ? 'text-red-500' :
                      tool.tool_name === 'OpenAI' ? 'text-blue-500' :
                      'text-gray-500'
                    }`}>
                      {tool.tool_name === 'Slack' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                        </svg>
                      ) : tool.tool_name === 'OpenAI' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 5.4021a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
                        </svg>
                      ) : tool.tool_name === 'Gmail' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{tool.tool_name}</p>
                    </div>
                    <div className="ml-auto">
                      <span 
                        className={`flex-shrink-0 inline-block h-2 w-2 rounded-full ${
                          tool.status === 'connected' ? 'bg-green-400' : 'bg-gray-300'
                        }`} 
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No tools connected yet</div>
              )}

              <Link href="/onboarding">
                <a className="text-sm text-indigo-600 hover:text-indigo-900 font-medium mt-2 flex items-center">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add more tools
                </a>
              </Link>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="border-t border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Current Mode
            </h2>
            <ModeSelector />
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile"
                />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  Agent, eXp Realty
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
