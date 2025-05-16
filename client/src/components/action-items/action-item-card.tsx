import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { CalendarIcon, Trash, MessageSquareText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@shared/schema';
import { generateActionItemDraft } from '@/lib/openai';
import { useExpieCharacter } from '@/components/ExpieCharacter';

interface ActionItemCardProps {
  actionItem: ActionItem;
}

export function ActionItemCard({ actionItem }: ActionItemCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();
  const { animateExpie } = useExpieCharacter();

  // Update action item status
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      return await apiRequest('PATCH', `/api/action-items/${actionItem.id}`, data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/action-items'] });
      
      // If marking as completed, log time saved
      if (data?.status === 'completed') {
        logTimeSavedMutation.mutate({ 
          action_type: 'action_item_completed', 
          minutes_saved: 1
        });
        
        // Animate the character
        animateExpie();
      }
    }
  });

  // Delete action item
  const deleteActionItemMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/action-items/${actionItem.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/action-items'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Action item deleted",
        description: "Your action item has been deleted"
      });
    }
  });

  // GPT Draft generation
  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await generateActionItemDraft(actionItem.text, actionItem.context || undefined);
      // Save the output
      await apiRequest('POST', `/api/action-items/${actionItem.id}/gpt`, {
        output_text: response,
        output_type: 'draft'
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      
      // Log time saved (10 minutes for a draft)
      logTimeSavedMutation.mutate({ 
        action_type: 'gpt_draft', 
        minutes_saved: 10
      });
      
      // Animate the character
      animateExpie();
      
      toast({
        title: "Draft generated",
        description: "AI has drafted content for your action item"
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate draft",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsGenerating(false);
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

  const handleStatusChange = () => {
    const newStatus = actionItem.status === 'completed' ? 'pending' : 'completed';
    updateStatusMutation.mutate({ status: newStatus });
  };

  const handleDelete = () => {
    deleteActionItemMutation.mutate();
  };

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    generateDraftMutation.mutate();
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied to clipboard",
      description: "The generated content has been copied"
    });
  };

  return (
    <li className="relative py-4 px-4">
      <div className="flex items-start space-x-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id={`ai-${actionItem.id}`}
              checked={actionItem.status === 'completed'}
              onCheckedChange={handleStatusChange}
            />
            <div className={`text-sm font-medium ${actionItem.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {actionItem.text}
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            {actionItem.due_date && (
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>Due: {format(new Date(actionItem.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {actionItem.source && (
              <Badge variant="outline" className="text-xs">
                {actionItem.source === 'transcript' ? 'From transcript' : 'Manual'}
              </Badge>
            )}
            
            <span className="ml-auto">
              Created: {format(new Date(actionItem.created_at), 'MMM d')}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center space-x-1">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1 px-2">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-xs">Generate with ChatGPT</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>AI Draft Generator</DialogTitle>
                <DialogDescription>
                  Generate an AI-powered draft based on this action item
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Action Item:</h4>
                  <p className="text-gray-800">{actionItem.text}</p>
                </div>
                
                {isGenerating ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-600">Generating draft content...</p>
                  </div>
                ) : generatedContent ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-md p-3 min-h-[150px] whitespace-pre-wrap relative">
                      {generatedContent}
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-gray-100 text-xs">
                          Powered by ChatGPT
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Save approximately 10 minutes with AI
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyContent}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          Send via Gmail
                        </Button>
                        <Button size="sm" onClick={() => setIsGenerateDialogOpen(false)}>Close</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Generate a draft for this action item using AI. This can save you time by creating a first
                      version that you can then modify as needed.
                    </p>
                    <Button 
                      onClick={handleGenerateDraft} 
                      className="w-full"
                    >
                      Generate Draft <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Action Item</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this action item? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </li>
  );
}