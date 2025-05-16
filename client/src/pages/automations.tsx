import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  GitBranch, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Mail, 
  Trash 
} from 'lucide-react';
import { ToastNotification } from '@/components/ui/toast-notification';
import { Automation } from '@shared/schema';
import { suggestAutomation } from '@/lib/openai';

export default function Automations() {
  const [isNewAutomationDialogOpen, setIsNewAutomationDialogOpen] = useState(false);
  const [triggerType, setTriggerType] = useState('schedule');
  const [action, setAction] = useState('send_message');
  const [tool, setTool] = useState('slack');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMinutes, setToastMinutes] = useState(0);
  const [filter, setFilter] = useState('all');
  const [isSuggestingAutomation, setIsSuggestingAutomation] = useState(false);

  const { toast } = useToast();

  // Get automations
  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['/api/automations'],
  });

  // Create new automation
  const createAutomationMutation = useMutation({
    mutationFn: async (data: { trigger_type: string; action: string; tool: string }) => {
      return await apiRequest('POST', '/api/automations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      setIsNewAutomationDialogOpen(false);
      
      // Show toast
      setToastMessage("Automation created!");
      setToastMinutes(3);
      setShowToast(true);
      
      // Reset form
      setTriggerType('schedule');
      setAction('send_message');
      setTool('slack');
    }
  });

  // Toggle automation status
  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      return await apiRequest('PATCH', `/api/automations/${id}`, { is_enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
    }
  });

  // Delete automation
  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      toast({
        title: "Automation deleted",
        description: "Your automation has been removed."
      });
    }
  });

  // Run automation
  const runAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/automations/${id}/run`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
      
      // Show toast
      setToastMessage("Automation executed successfully!");
      setToastMinutes(5);
      setShowToast(true);
    }
  });

  // Suggest an automation
  const suggestAutomationMutation = useMutation({
    mutationFn: async () => {
      // For a real implementation, we'd use actual user activity history
      const activityHistory = "User frequently sends follow-up messages to clients every Monday morning. They also regularly check for new properties in their CRM system and tag them.";
      return await suggestAutomation(activityHistory);
    },
    onSuccess: (suggestion) => {
      // Pre-fill the form with the suggestion
      setTriggerType(suggestion.trigger);
      setAction(suggestion.action);
      setTool(suggestion.tool);
      
      toast({
        title: "Automation suggested",
        description: suggestion.description
      });
      
      setIsSuggestingAutomation(false);
      setIsNewAutomationDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Suggestion failed",
        description: error instanceof Error ? error.message : "Failed to suggest automation",
        variant: "destructive"
      });
      setIsSuggestingAutomation(false);
    }
  });

  const handleCreateAutomation = () => {
    createAutomationMutation.mutate({
      trigger_type: triggerType,
      action: action,
      tool: tool
    });
  };

  const handleToggleAutomation = (id: string, currentStatus: boolean) => {
    toggleAutomationMutation.mutate({
      id,
      is_enabled: !currentStatus
    });
  };

  const handleRunAutomation = (id: string) => {
    runAutomationMutation.mutate(id);
  };

  const handleDeleteAutomation = (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      deleteAutomationMutation.mutate(id);
    }
  };

  const handleSuggestAutomation = () => {
    setIsSuggestingAutomation(true);
    suggestAutomationMutation.mutate();
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Pre-defined automation templates
  const automationTemplates = [
    {
      name: "Weekly follow-up via Slack",
      trigger_type: "schedule",
      action: "send_message",
      tool: "slack"
    },
    {
      name: "Auto-tag Fireflies tasks",
      trigger_type: "new_transcript",
      action: "tag_items",
      tool: "fireflies"
    },
    {
      name: "Property listing notifications",
      trigger_type: "new_listing",
      action: "send_notification",
      tool: "slack"
    }
  ];

  // Filter automations
  const filteredAutomations = (() => {
    switch (filter) {
      case 'active':
        return automations.filter((item: Automation) => item.is_enabled);
      case 'inactive':
        return automations.filter((item: Automation) => !item.is_enabled);
      default:
        return automations;
    }
  })();

  // Format trigger type for display
  const formatTriggerType = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'Scheduled';
      case 'new_transcript':
        return 'New Transcript';
      case 'new_listing':
        return 'New Listing';
      case 'client_response':
        return 'Client Response';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get icon for automation
  const getAutomationIcon = (automation: Automation) => {
    if (automation.trigger_type === 'schedule') {
      return <Calendar className="h-5 w-5 text-indigo-500" />;
    } else if (automation.tool === 'slack') {
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    } else if (automation.tool === 'gmail') {
      return <Mail className="h-5 w-5 text-red-500" />;
    } else {
      return <GitBranch className="h-5 w-5 text-gray-500" />;
    }
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
              <div className="flex-1 flex">
                <div className="w-full flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">Automations</h1>
                </div>
              </div>
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleSuggestAutomation}
                  disabled={isSuggestingAutomation}
                >
                  {isSuggestingAutomation ? 'Suggesting...' : 'Suggest Automation'}
                </Button>
                
                <Dialog open={isNewAutomationDialogOpen} onOpenChange={setIsNewAutomationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Automation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Automation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">When this happens (Trigger)</label>
                        <Select 
                          value={triggerType} 
                          onValueChange={setTriggerType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="schedule">On a schedule</SelectItem>
                            <SelectItem value="new_transcript">New meeting transcript</SelectItem>
                            <SelectItem value="client_response">Client responds</SelectItem>
                            <SelectItem value="new_listing">New property listing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Do this (Action)</label>
                        <Select 
                          value={action} 
                          onValueChange={setAction}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="send_message">Send a message</SelectItem>
                            <SelectItem value="create_task">Create a task</SelectItem>
                            <SelectItem value="tag_items">Tag items</SelectItem>
                            <SelectItem value="send_notification">Send notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Using this tool</label>
                        <Select 
                          value={tool} 
                          onValueChange={setTool}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tool" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slack">Slack</SelectItem>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="calendar">Google Calendar</SelectItem>
                            <SelectItem value="fireflies">Fireflies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {triggerType === 'schedule' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Schedule details</label>
                          <div className="grid grid-cols-2 gap-2">
                            <Select defaultValue="weekly">
                              <SelectTrigger>
                                <SelectValue placeholder="Frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="time" defaultValue="09:00" />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateAutomation} 
                        disabled={createAutomationMutation.isPending}
                      >
                        {createAutomationMutation.isPending ? 'Creating...' : 'Create Automation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Automation Templates */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Automation Templates</CardTitle>
                    <CardDescription>
                      Quick-start with these pre-configured automations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {automationTemplates.map((template, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
                          onClick={() => {
                            setTriggerType(template.trigger_type);
                            setAction(template.action);
                            setTool(template.tool);
                            setIsNewAutomationDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center mb-3">
                            <GitBranch className="h-5 w-5 text-indigo-500 mr-2" />
                            <h3 className="font-medium">{template.name}</h3>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>Trigger: {formatTriggerType(template.trigger_type)}</p>
                            <p>Tool: {template.tool}</p>
                          </div>
                          <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600">
                            Use Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Your Automations */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Your Automations</CardTitle>
                      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                        <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="inactive">Inactive</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="py-6 text-center text-gray-500">Loading automations...</div>
                    ) : filteredAutomations.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredAutomations.map((automation: Automation) => (
                          <div key={automation.id} className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getAutomationIcon(automation)}
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatTriggerType(automation.trigger_type)} → {automation.action.replace('_', ' ')}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Using {automation.tool}
                                    {automation.last_run && 
                                      ` • Last run: ${new Date(automation.last_run).toLocaleString()}`
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Switch 
                                  checked={automation.is_enabled}
                                  onCheckedChange={() => handleToggleAutomation(automation.id, automation.is_enabled)}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRunAutomation(automation.id)}
                                  disabled={!automation.is_enabled || runAutomationMutation.isPending}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteAutomation(automation.id)}
                                  disabled={deleteAutomationMutation.isPending}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        {filter !== 'all' 
                          ? `No ${filter} automations found`
                          : "No automations yet. Create one to get started!"}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
