import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PersonalityMode, themes, setCurrentTheme, getCurrentTheme } from '@/lib/theme';

export function ModeSelector() {
  const [currentMode, setCurrentMode] = useState<PersonalityMode>(getCurrentTheme());
  const { toast } = useToast();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Update user mode
  const updateModeMutation = useMutation({
    mutationFn: async (mode: PersonalityMode) => {
      return await apiRequest('PATCH', '/api/user/settings', { mode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Initialize from user data when available
  useEffect(() => {
    if (user?.mode) {
      setCurrentMode(user.mode as PersonalityMode);
      setCurrentTheme(user.mode as PersonalityMode);
    }
  }, [user]);

  const handleModeChange = (newMode: string) => {
    const mode = newMode as PersonalityMode;
    setCurrentMode(mode);
    setCurrentTheme(mode);
    
    // Update in database
    updateModeMutation.mutate(mode);
    
    // Show toast notification
    toast({
      title: `Mode changed to ${themes[mode].label}`,
      description: themes[mode].description,
    });
  };

  return (
    <Select value={currentMode} onValueChange={handleModeChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([key, theme]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center">
              <span className="mr-2">{theme.emoji[0]}</span>
              <span>{theme.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
