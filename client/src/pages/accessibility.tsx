import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Moon, 
  Sparkles, 
  BarChart3, 
  RefreshCw,
  Save
} from 'lucide-react';
import { AccessibilityPreference } from '@shared/schema';
import { ToastNotification } from '@/components/ui/toast-notification';

export default function Accessibility() {
  const [largeText, setLargeText] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [currentTab, setCurrentTab] = useState('accessibility');
  const [showToast, setShowToast] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();

  // Get user's accessibility preferences
  const { data: preferences, isLoading } = useQuery<AccessibilityPreference>({
    queryKey: ['/api/accessibility'],
  });

  // Save accessibility preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: {
      large_text: boolean;
      dark_mode: boolean;
      reduce_motion: boolean;
      high_contrast: boolean;
    }) => {
      return await apiRequest('POST', '/api/accessibility', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessibility'] });
      setShowToast(true);
      setHasChanges(false);
      
      // Apply settings to the document
      applySettings();
      
      toast({
        title: "Settings saved",
        description: "Your accessibility preferences have been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });

  // Initialize from user data when available
  useEffect(() => {
    if (preferences) {
      setLargeText(preferences.large_text);
      setDarkMode(preferences.dark_mode);
      setReduceMotion(preferences.reduce_motion);
      setHighContrast(preferences.high_contrast);
    }
  }, [preferences]);

  // Apply settings to document
  const applySettings = () => {
    // Apply dark mode
    document.documentElement.classList.toggle('dark', darkMode);
    
    // Apply large text
    if (largeText) {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
    
    // Apply reduced motion
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // Check for unsaved changes
  useEffect(() => {
    if (!preferences) return;
    
    const hasUnsavedChanges = 
      largeText !== preferences.large_text ||
      darkMode !== preferences.dark_mode ||
      reduceMotion !== preferences.reduce_motion ||
      highContrast !== preferences.high_contrast;
    
    setHasChanges(hasUnsavedChanges);
  }, [largeText, darkMode, reduceMotion, highContrast, preferences]);

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate({
      large_text: largeText,
      dark_mode: darkMode,
      reduce_motion: reduceMotion,
      high_contrast: highContrast
    });
  };

  const handleResetPreferences = () => {
    if (preferences) {
      setLargeText(preferences.large_text);
      setDarkMode(preferences.dark_mode);
      setReduceMotion(preferences.reduce_motion);
      setHighContrast(preferences.high_contrast);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

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
              <div className="flex-1 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                {hasChanges && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleResetPreferences}
                      disabled={savePreferencesMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={savePreferencesMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {currentTab === 'accessibility' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility Settings</CardTitle>
                      <CardDescription>
                        Customize your experience to make eXpieStack work better for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {isLoading ? (
                        <div className="py-4 text-center text-gray-500">Loading preferences...</div>
                      ) : (
                        <>
                          {/* Text Size */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-md text-blue-700">
                                  <Eye className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium">Text Size</h3>
                                  <p className="text-sm text-gray-500">
                                    Increase text size for better readability
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="large-text" 
                                  checked={largeText} 
                                  onCheckedChange={setLargeText}
                                />
                                <Label htmlFor="large-text" className="sr-only">Large Text</Label>
                              </div>
                            </div>
                            <div className="pl-10 ml-2">
                              <p className={`${largeText ? 'text-lg' : 'text-base'} border p-2 rounded-md bg-gray-50`}>
                                Preview text at {largeText ? 'larger' : 'normal'} size
                              </p>
                            </div>
                          </div>
                        
                          {/* Dark Mode */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-md text-indigo-700">
                                  <Moon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium">Dark Mode</h3>
                                  <p className="text-sm text-gray-500">
                                    Switch to dark theme to reduce eye strain
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="dark-mode" 
                                  checked={darkMode} 
                                  onCheckedChange={setDarkMode}
                                />
                                <Label htmlFor="dark-mode" className="sr-only">Dark Mode</Label>
                              </div>
                            </div>
                            <div className="pl-10 ml-2 flex space-x-4">
                              <div className={`w-24 h-16 rounded-md border ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className={`w-full h-4 mt-2 mx-auto rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ width: '80%' }}></div>
                                <div className={`w-full h-3 mt-2 mx-auto rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ width: '90%' }}></div>
                                <div className={`w-full h-3 mt-2 mx-auto rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ width: '60%' }}></div>
                              </div>
                              <div className="text-sm mt-4">
                                {darkMode ? 'Dark theme' : 'Light theme'}
                              </div>
                            </div>
                          </div>
                        
                          {/* Reduce Motion */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-md text-green-700">
                                  <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium">Reduce Motion</h3>
                                  <p className="text-sm text-gray-500">
                                    Minimize animated effects throughout the interface
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="reduce-motion" 
                                  checked={reduceMotion} 
                                  onCheckedChange={setReduceMotion}
                                />
                                <Label htmlFor="reduce-motion" className="sr-only">Reduce Motion</Label>
                              </div>
                            </div>
                            <div className="pl-10 ml-2">
                              <div className="flex space-x-4 items-center">
                                <div className={`w-8 h-8 bg-blue-500 rounded-full ${reduceMotion ? '' : 'animate-pulse'}`}></div>
                                <span className="text-sm">
                                  {reduceMotion ? 'Animations disabled' : 'Animations enabled'}
                                </span>
                              </div>
                            </div>
                          </div>
                        
                          {/* High Contrast */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-md text-yellow-700">
                                  <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium">High Contrast</h3>
                                  <p className="text-sm text-gray-500">
                                    Increase contrast for better readability
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="high-contrast" 
                                  checked={highContrast} 
                                  onCheckedChange={setHighContrast}
                                />
                                <Label htmlFor="high-contrast" className="sr-only">High Contrast</Label>
                              </div>
                            </div>
                            <div className="pl-10 ml-2">
                              <div className="flex space-x-4">
                                <div className={`p-2 rounded-md ${highContrast ? 'bg-black text-white border-2 border-white' : 'bg-gray-100 text-gray-700'}`}>
                                  High contrast example
                                </div>
                                <div className={`p-2 rounded-md ${highContrast ? 'bg-white text-black border-2 border-black' : 'bg-white text-gray-500 border border-gray-200'}`}>
                                  Normal contrast
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 px-6 py-3">
                      <p className="text-xs text-gray-500">
                        These settings will be saved to your profile and applied across all your devices.
                      </p>
                    </CardFooter>
                  </Card>
                )}
                
                {currentTab === 'account' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account information and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-6 text-center text-gray-500">
                      Account settings will be available in a future update.
                    </CardContent>
                  </Card>
                )}
                
                {currentTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Control when and how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-6 text-center text-gray-500">
                      Notification settings will be available in a future update.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notification Component */}
      {showToast && (
        <ToastNotification
          message="Accessibility settings saved successfully"
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}
