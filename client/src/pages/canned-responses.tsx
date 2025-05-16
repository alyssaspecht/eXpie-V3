import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/sidebar';
import { CannedResponseCard } from '@/components/canned-responses/canned-response-card';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Plus, Search, Sparkles } from 'lucide-react';
import { ToastNotification } from '@/components/ui/toast-notification';
import { CannedResponse } from '@shared/schema';
import { generateCannedResponseSuggestion } from '@/lib/openai';

export default function CannedResponses() {
  const [isNewResponseDialogOpen, setIsNewResponseDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMinutes, setToastMinutes] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  // Get canned responses
  const { data: cannedResponses = [], isLoading } = useQuery({
    queryKey: ['/api/canned-responses'],
  });

  // Create new canned response
  const createCannedResponseMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; tags: string[] }) => {
      return await apiRequest('POST', '/api/canned-responses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canned-responses'] });
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setIsNewResponseDialogOpen(false);
      
      // Show toast
      setToastMessage("Canned response created!");
      setToastMinutes(1);
      setShowToast(true);
      
      // Log time saved
      logTimeSavedMutation.mutate({ action_type: 'canned_response_created', minutes_saved: 1 });
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

  const handleCreateCannedResponse = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    createCannedResponseMutation.mutate({
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
  };

  const handleGenerateContent = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title before generating content",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const tagArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const generatedContent = await generateCannedResponseSuggestion(newTitle, tagArray);
      
      setNewContent(generatedContent);
      
      toast({
        title: "Content generated",
        description: "AI has created content for your canned response."
      });
      
      // Log time saved
      logTimeSavedMutation.mutate({ action_type: 'gpt_canned_response', minutes_saved: 2 });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Extract unique tags from all responses
  const allTags = cannedResponses.reduce((tags: string[], response: CannedResponse) => {
    if (response.tags && response.tags.length > 0) {
      response.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);

  // Filter responses
  const filteredResponses = cannedResponses.filter((response: CannedResponse) => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      response.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      response.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected tag
    const matchesTag = !selectedTag || 
      (response.tags && response.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

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
                  <h1 className="text-xl font-semibold text-gray-900">Canned Responses</h1>
                </div>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <Dialog open={isNewResponseDialogOpen} onOpenChange={setIsNewResponseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Canned Response
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Canned Response</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                          placeholder="e.g., Weekly Check-In Format"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Content</label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleGenerateContent}
                            disabled={isGenerating || !newTitle.trim()}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </div>
                        <Textarea 
                          placeholder="Type your canned response content here..."
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags (comma separated)</label>
                        <Input 
                          placeholder="e.g., client, follow-up, weekly"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateCannedResponse} 
                        disabled={!newTitle.trim() || !newContent.trim() || isGenerating}
                      >
                        Create Canned Response
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
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Your Canned Responses</CardTitle>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="search"
                          placeholder="Search responses..."
                          className="pl-8 w-[300px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    {allTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge 
                          variant={selectedTag === null ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedTag(null)}
                        >
                          All
                        </Badge>
                        {allTags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant={selectedTag === tag ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="py-6 text-center text-gray-500">Loading canned responses...</div>
                    ) : filteredResponses.length > 0 ? (
                      <div className="border-t border-gray-200 divide-y divide-gray-200">
                        {filteredResponses.map((response: CannedResponse) => (
                          <CannedResponseCard key={response.id} response={response} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        {searchTerm || selectedTag 
                          ? "No responses match your filters"
                          : "No canned responses yet. Create one to get started!"}
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
