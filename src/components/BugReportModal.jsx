import React, { useState } from 'react';
import { Bug, X, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

const ISSUE_TYPES = [
  { value: 'bug', label: '🐛 Bug — something is broken' },
  { value: 'flight_search', label: '✈️ Flight search not working' },
  { value: 'visa_info', label: '🛂 Incorrect visa information' },
  { value: 'profile', label: '👤 Profile / passport issue' },
  { value: 'performance', label: '⚡ App is slow or crashes' },
  { value: 'suggestion', label: '💡 Feature suggestion' },
  { value: 'other', label: '❓ Other' },
];

export default function BugReportModal({ open, onClose }) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!type || !description.trim()) {
      toast.error('Please select an issue type and describe the problem.');
      return;
    }
    setIsSending(true);
    try {
      const user = null;
      const subject = `[GoThru Report] ${ISSUE_TYPES.find(i => i.value === type)?.label || type}`;
      const body = `
<b>Issue type:</b> ${type}<br/>
<b>Reported by:</b> ${user?.email || 'Unknown'}<br/>
<b>Description:</b><br/>${description.replace(/\n/g, '<br/>')}
      `.trim();

      await null;

      toast.success('Report sent! Thank you for your feedback.');
      setType('');
      setDescription('');
      onClose();
    } catch (e) {
      toast.error('Failed to send report. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Bug className="w-5 h-5 text-amber-600" />
            Report a Bug or Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-slate-700">Issue type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type…" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-slate-700">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened, what you expected, and any steps to reproduce…"
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSubmit}
              disabled={isSending}
            >
              {isSending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Report</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}