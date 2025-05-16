import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalityMode, themes, toolsList } from '@/lib/theme';
import { ToolConnector } from '@/components/tools/tool-connector';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<string[]>(['Slack', 'OpenAI']);
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>('zen');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get current user's data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Update user settings when onboarding is complete
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/user/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Connect a tool
  const connectToolMutation = useMutation({
    mutationFn: async (toolName: string) => {
      return await apiRequest('POST', '/api/tools', { tool_name: toolName, status: 'connected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    }
  });

  const handleToolSelect = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter(t => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  };

  const handleModeSelect = (mode: PersonalityMode) => {
    setSelectedMode(mode);
  };

  const goToNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      setIsLoading(true);
      try {
        // Connect selected tools
        const toolPromises = selectedTools.map(tool => 
          connectToolMutation.mutateAsync(tool)
        );
        await Promise.all(toolPromises);
        
        // Update user preferences
        await updateUserMutation.mutateAsync({
          mode: selectedMode,
          onboarding_complete: true
        });
        
        toast({
          title: "Setup complete!",
          description: `Welcome to ${themes[selectedMode].label}, your personalized workspace.`,
        });
        
        // Navigate to dashboard
        setLocation('/dashboard');
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast({
          title: "Error completing setup",
          description: "There was a problem saving your preferences. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goToPreviousStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to eXpieStack</h1>
          <p className="mt-2 text-lg text-gray-600">Let's set up your productivity tools</p>
        </div>

        {/* Onboarding Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-600">
              {step === 1 ? "Step 1 of 2: Connect your tools" : "Step 2 of 2: Choose your mode"}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {step === 1 ? "50% complete" : "100% complete"}
            </span>
          </div>
          <Progress className="mt-2 h-2.5" value={step === 1 ? 50 : 100} />
        </div>

        {/* Step 1: Connect Tools */}
        {step === 1 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connect Your Tools</h2>
            <p className="text-sm text-gray-500 mb-6">Connect the tools you use daily to maximize productivity</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {toolsList.map((tool) => (
                <ToolConnector
                  key={tool.name}
                  name={tool.name}
                  icon={tool.icon}
                  description={tool.description}
                  isConnected={selectedTools.includes(tool.name)}
                  onToggle={() => handleToolSelect(tool.name)}
                  iconColor={tool.color}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={goToNextStep} 
                className="inline-flex items-center px-4 py-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Personality Mode */}
        {step === 2 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Choose Your Mode</h2>
            <p className="text-sm text-gray-500 mb-6">Select your preferred personality mode to customize your experience</p>
            
            <RadioGroup value={selectedMode} onValueChange={(value) => handleModeSelect(value as PersonalityMode)}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Object.entries(themes).map(([key, theme]) => (
                  <div key={key} className={`relative ${theme.bgGradient} rounded-lg border ${theme.borderColor} p-5 hover:shadow-md cursor-pointer`}>
                    <div className="absolute top-3 right-3">
                      <RadioGroupItem value={key} id={`mode-${key}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.textColor} mb-2`}>{theme.label}</h3>
                    <p className={`${theme.textColor.replace('800', '700')} text-sm`}>{theme.description}</p>
                    
                    <div className="mt-4 flex items-center space-x-1">
                      {theme.emoji.map((emoji, index) => (
                        <span 
                          key={index} 
                          className={`inline-flex items-center justify-center w-8 h-8 ${theme.primaryColor} rounded-md`}
                        >
                          <span className="text-white font-bold">{emoji}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep} 
                className="border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </Button>
              <Button 
                onClick={goToNextStep} 
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2"
              >
                {isLoading ? "Completing setup..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
