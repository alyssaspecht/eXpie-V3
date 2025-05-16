import { useEffect, useState } from 'react';
import { PersonalityMode, getThemeClasses } from '@/lib/theme';

interface WelcomeBannerProps {
  mode: PersonalityMode;
}

export function WelcomeBanner({ mode }: WelcomeBannerProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const theme = getThemeClasses(mode);
  
  return (
    <div className={`${theme.bgGradient} border ${theme.borderColor} rounded-lg shadow-sm p-6 mb-6 ${theme.animationClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-medium ${theme.textColor}`}>
            Welcome to {theme.label}
          </h2>
          <p className={`mt-1 text-sm ${theme.textColor.replace('800', '700')}`}>
            {theme.description}
          </p>
        </div>
        <span className={`h-12 w-12 rounded-full flex items-center justify-center ${theme.primaryColor} text-white text-2xl`}>
          {theme.emoji[0]}
        </span>
      </div>
    </div>
  );
}
