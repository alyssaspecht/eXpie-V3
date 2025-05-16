import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Send, Trash } from 'lucide-react';
import { CannedResponse } from '@shared/schema';
import { sendCannedResponseToSlack } from '@/lib/slack';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { ToastNotification } from '@/components/ui/toast-notification';
import { useExpieCharacter } from '@/components/ExpieCharacter';

interface CannedResponseCardProps {
  response: CannedResponse;
}

export function CannedResponseCard({ response }: CannedResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const [slackChannel, setSlackChannel] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSlackDialogOpen, setIsSlackDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMinutes, setToastMinutes] = useState(0);
  const { animateExpie } = useExpieCharacter();

  const { toast } = useToast();

  // Delete canned response
  const deleteCannedResponseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/canned-responses/${response.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canned-responses'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Canned response deleted",
        description: "Your canned response has been deleted"
      });
    }
  });

  // Increment usage count
  const incrementUsageMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/canned-responses/${response.id}/use`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canned-responses'] });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    incrementUsageMutation.mutate();
    
    // Animate the character
    animateExpie();
    
    // Log time saved
    logTimeSavedMutation.mutate({ 
      action_type: 'canned_response', 
      minutes_saved: 3
    });
    
    // Show toast
    setToastMessage("Response copied to clipboard!");
    setToastMinutes(3);
    setShowToast(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSendToSlack = async () => {
    if (!slackChannel) return;
    
    try {
      await sendCannedResponseToSlack(slackChannel, response.id);
      incrementUsageMutation.mutate();
      
      // Animate the character
      animateExpie();
      
      // Log time saved
      logTimeSavedMutation.mutate({ 
        action_type: 'slack_message', 
        minutes_saved: 2
      });
      
      toast({
        title: "Message sent",
        description: `Your response was sent to ${slackChannel}`
      });
      
      // Show toast
      setToastMessage("Response sent to Slack!");
      setToastMinutes(2);
      setShowToast(true);
      
      setIsSlackDialogOpen(false);
      setSlackChannel('');
    } catch (error) {
      toast({
        title: "Send failed",
        description: error instanceof Error ? error.message : "Could not send to Slack",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    deleteCannedResponseMutation.mutate();
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <div className="py-4 px-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{response.title}</h3>
          <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{response.content}</p>
          
          {response.tags && response.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {response.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-row sm:flex-col gap-2 self-start">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only sm:not-sr-only">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          
          <Dialog open={isSlackDialogOpen} onOpenChange={setIsSlackDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Send className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Send</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send to Slack</DialogTitle>
                <DialogDescription>
                  Enter the Slack channel where you want to send this canned response.
                </DialogDescription>
              </DialogHeader>
              <div className="my-4">
                <label className="text-sm font-medium">Channel</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  type="text"
                  placeholder="#general"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSendToSlack} disabled={!slackChannel}>
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Canned Response</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this canned response? This action cannot be undone.
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
      
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-end">
        <span>Used {response.usage_count} times</span>
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