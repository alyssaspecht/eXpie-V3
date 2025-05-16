export type PersonalityMode = 'hype' | 'zen' | 'chaos' | 'focus';

interface ThemeConfig {
  name: string;
  label: string;
  description: string;
  bgGradient: string;
  primaryColor: string;
  textColor: string;
  borderColor: string;
  buttonStyle: string;
  animationClass: string;
  emoji: string[];
}

export const themes: Record<PersonalityMode, ThemeConfig> = {
  hype: {
    name: 'hype',
    label: 'Hype Mode',
    description: 'Energetic, enthusiastic, and motivational. Perfect for when you need a boost!',
    bgGradient: 'bg-gradient-to-br from-purple-100 to-pink-100',
    primaryColor: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    buttonStyle: 'font-bold uppercase tracking-wide',
    animationClass: 'animate-pulse',
    emoji: ['🔥', '⚡', '🚀']
  },
  zen: {
    name: 'zen',
    label: 'Zen Mode',
    description: 'Calm, mindful, and focused. Helps maintain balance during busy days.',
    bgGradient: 'bg-gradient-to-br from-green-50 to-blue-50',
    primaryColor: 'bg-teal-500 hover:bg-teal-600',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    buttonStyle: 'font-normal',
    animationClass: '',
    emoji: ['🧘', '🌿', '✨']
  },
  chaos: {
    name: 'chaos',
    label: 'Chaos Mode',
    description: 'Spontaneous, creative, and unpredictable. Sparks innovation and new ideas.',
    bgGradient: 'bg-gradient-to-br from-yellow-100 to-red-100',
    primaryColor: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    buttonStyle: 'font-black italic',
    animationClass: 'animate-bounce',
    emoji: ['🎭', '🎨', '💥']
  },
  focus: {
    name: 'focus',
    label: 'Focus Mode',
    description: 'Direct, efficient, and distraction-free. Optimized for deep work.',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    primaryColor: 'bg-indigo-600 hover:bg-indigo-700',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    buttonStyle: 'font-medium',
    animationClass: '',
    emoji: ['🎯', '⏱️', '📊']
  }
};

export const toolsList = [
  {
    name: 'Slack',
    icon: 'slack',
    description: 'Connect your Slack workspace',
    color: 'text-blue-500'
  },
  {
    name: 'Gmail',
    icon: 'gmail',
    description: 'Connect your Gmail account',
    color: 'text-red-500'
  },
  {
    name: 'Fireflies',
    icon: 'fireflies',
    description: 'Connect for meeting transcripts',
    color: 'text-blue-500'
  },
  {
    name: 'Google Calendar',
    icon: 'calendar',
    description: 'Sync your calendar events',
    color: 'text-blue-400'
  },
  {
    name: 'OpenAI',
    icon: 'openai',
    description: 'Connect your API key',
    color: 'text-blue-500'
  },
  {
    name: 'Coda',
    icon: 'coda',
    description: 'Connect your Coda docs',
    color: 'text-pink-600'
  },
  {
    name: 'LearnWorlds',
    icon: 'learning',
    description: 'Connect your learning platform',
    color: 'text-green-500'
  }
];

export const getThemeButtonClasses = (mode: PersonalityMode) => {
  const theme = themes[mode];
  const baseClasses = "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  switch (mode) {
    case 'hype':
      return `${baseClasses} ${theme.primaryColor} focus:ring-purple-500 ${theme.buttonStyle}`;
    case 'zen':
      return `${baseClasses} ${theme.primaryColor} focus:ring-teal-500 ${theme.buttonStyle}`;
    case 'chaos':
      return `${baseClasses} ${theme.primaryColor} focus:ring-orange-500 ${theme.buttonStyle}`;
    case 'focus':
      return `${baseClasses} ${theme.primaryColor} focus:ring-indigo-500 ${theme.buttonStyle}`;
    default:
      return `${baseClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
  }
};

export const getThemeClasses = (mode: PersonalityMode) => {
  return themes[mode];
};

export function setCurrentTheme(mode: PersonalityMode) {
  localStorage.setItem('theme-mode', mode);
}

export function getCurrentTheme(): PersonalityMode {
  const savedTheme = localStorage.getItem('theme-mode') as PersonalityMode;
  return savedTheme && Object.keys(themes).includes(savedTheme) 
    ? savedTheme 
    : 'zen';
}
