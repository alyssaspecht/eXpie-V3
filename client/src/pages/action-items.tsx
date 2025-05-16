import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/sidebar';
import { ActionItemCard } from '@/components/action-items/action-item-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, AlarmClock, Upload } from 'lucide-react';
import { ToastNotification } from '@/components/ui/toast-notification';
import { ActionItem } from '@shared/schema';
import { format } from 'date-fns';
import { extractActionItemsFromTranscript } from '@/lib/openai';

export default function ActionItems() {
  const [newActionText, setNewActionText] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [isNewActionDialogOpen, setIsNewActionDialogOpen] = useState(false);
  const [isImportTranscriptDialogOpen, setIsImportTranscriptDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMinutes, setToastMinutes] = useState(0);
  const [filter, setFilter] = useState('all');

  // Get action items
  const { data: actionItems = [], isLoading } = useQuery({
    queryKey: ['/api/action-items'],
  });

  const { toast } = useToast();

  // Create new action item
  const createActionItemMutation = useMutation({
    mutationFn: async (data: { text: string; due_date?: Date; source?: string }) => {
      return await apiRequest('POST', '/api/action-items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/action-items'] });
      setNewActionText('');
      setSelectedDate(undefined);
      setIsNewActionDialogOpen(false);
      
      // Show toast
      setToastMessage("Action item created!");
      setToastMinutes(1);
      setShowToast(true);
      
      // Log time saved
      logTimeSavedMutation.mutate({ action_type: 'action_item', minutes_saved: 1 });
    }
  });

  // Log time saved
  const logTimeSavedMutation = useMutation({
    mutationFn: async (data: { action_type: string; minutes_saved: number }) => {
      return await apiRequest('POST', '/api/time-saved', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-saved/total'] });
    }
  });

  // Extract action items from transcript
  const extractActionItemsMutation = useMutation({
    mutationFn: async (transcript: string) => {
      return await extractActionItemsFromTranscript(transcript);
    },
    onSuccess: (extractedItems) => {
      setIsImportTranscriptDialogOpen(false);
      setTranscriptText('');
      
      // Create each extracted action item
      extractedItems.forEach((item) => {
        createActionItemMutation.mutate({ 
          text: item, 
          source: 'transcript'
        });
      });
      
      toast({
        title: "Action items extracted!",
        description: `${extractedItems.length} action items extracted from transcript.`
      });
      
      // Log time saved (2 minutes per action item)
      if (extractedItems.length > 0) {
        logTimeSavedMutation.mutate({ 
          action_type: 'action_items_extracted', 
          minutes_saved: extractedItems.length * 2 
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Extraction failed",
        description: `Could not extract action items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateActionItem = () => {
    if (!newActionText.trim()) return;
    
    createActionItemMutation.mutate({
      text: newActionText,
      due_date: selectedDate,
      source: 'manual'
    });
  };

  const handleExtractActionItems = () => {
    if (!transcriptText.trim()) return;
    
    extractActionItemsMutation.mutate(transcriptText);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Filter action items
  const filteredActionItems = (() => {
    switch (filter) {
      case 'pending':
        return actionItems.filter(item => item.status === 'pending');
      case 'completed':
        return actionItems.filter(item => item.status === 'completed');
      default:
        return actionItems;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top Navigation Bar (similar to dashboard) */}
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
                  <h1 className="text-xl font-semibold text-gray-900">Action Items</h1>
                </div>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <Dialog open={isNewActionDialogOpen} onOpenChange={setIsNewActionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mr-3">
                      <Plus className="h-4 w-4 mr-2" />
                      New Action Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Action Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Task Description</label>
                        <Textarea 
                          placeholder="What needs to be done?"
                          value={newActionText}
                          onChange={(e) => setNewActionText(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date (optional)</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button 
                        onClick={handleCreateActionItem} 
                        disabled={!newActionText.trim() || createActionItemMutation.isPending}
                        className="w-full"
                      >
                        Create Action Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isImportTranscriptDialogOpen} onOpenChange={setIsImportTranscriptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Transcript
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Extract Action Items from Transcript</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Paste Meeting Transcript</label>
                        <Textarea 
                          placeholder="Paste your meeting transcript here..."
                          value={transcriptText}
                          onChange={(e) => setTranscriptText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                      <Button 
                        onClick={handleExtractActionItems} 
                        disabled={!transcriptText.trim() || extractActionItemsMutation.isPending}
                        className="w-full"
                      >
                        {extractActionItemsMutation.isPending ? 'Extracting...' : 'Extract Action Items'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Your Action Items</CardTitle>
                      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                        <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="py-6 text-center text-gray-500">Loading action items...</div>
                    ) : filteredActionItems.length > 0 ? (
                      <ul role="list" className="divide-y divide-gray-200">
                        {filteredActionItems.map((item) => (
                          <ActionItemCard key={item.id} actionItem={item} />
                        ))}
                      </ul>
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        No action items found. Create one to get started!
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
