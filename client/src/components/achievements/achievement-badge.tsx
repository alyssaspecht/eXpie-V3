import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type BadgeType = 'Loop Slayer' | 'Automation Hero' | 'Time Wizard' | string;

interface AchievementBadgeProps {
  badge: BadgeType;
}

export function AchievementBadge({ badge }: AchievementBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const getBadgeConfig = (badgeType: BadgeType) => {
    switch (badgeType) {
      case 'Loop Slayer':
        return {
          icon: (
            <svg className="h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: 'bg-indigo-100',
          textColor: 'text-indigo-700',
          description: 'Used 10+ canned responses to save time',
        };
      case 'Automation Hero':
        return {
          icon: (
            <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          color: 'bg-green-100',
          textColor: 'text-green-700',
          description: 'Created 5+ automations',
        };
      case 'Time Wizard':
        return {
          icon: (
            <svg className="h-10 w-10 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          description: 'Saved 100+ minutes with eXpieStack',
        };
      default:
        return {
          icon: (
            <svg className="h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          description: 'Earned a special achievement',
        };
    }
  };

  const badgeConfig = getBadgeConfig(badge);

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-full ${badgeConfig.color} mb-2`}>
              {badgeConfig.icon}
            </div>
            <span className={`text-xs font-medium ${badgeConfig.textColor}`}>{badge}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{badgeConfig.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
