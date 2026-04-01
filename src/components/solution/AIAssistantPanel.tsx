import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Sparkles, Wrench, ListChecks, Cpu } from 'lucide-react';

interface Props {
  problemTitle: string;
  problemDescription: string;
  currentSolutionText: string;
  onApplySuggestion?: (text: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: 'Improve solution', icon: Sparkles, prompt: 'Improve my current solution and make it more comprehensive.' },
  { label: 'Suggest technologies', icon: Cpu, prompt: 'Suggest the best tools and technologies for this solution.' },
  { label: 'Break into steps', icon: ListChecks, prompt: 'Break my solution into clear, actionable implementation steps.' },
];

export default function AIAssistantPanel({ problemTitle, problemDescription, currentSolutionText, onApplySuggestion }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await supabase.functions.invoke('ai-solve', {
        body: {
          action: 'suggest',
          text: `User question: ${text}\n\nCurrent solution draft:\n${currentSolutionText}`,
          problemTitle,
          problemDescription,
        },
      });
      if (res.error) throw new Error(res.error.message);
      const assistantMsg: Message = { role: 'assistant', content: res.data.result };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card flex flex-col h-full" style={{ minHeight: 500 }}>
      <div className="p-3 border-b border-border/50 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">AI Assistant</span>
      </div>

      {/* Quick actions */}
      <div className="p-2 flex flex-wrap gap-1.5 border-b border-border/30">
        {quickActions.map(a => (
          <Button key={a.label} variant="secondary" size="sm" className="text-xs gap-1 h-7" onClick={() => sendMessage(a.prompt)} disabled={loading}>
            <a.icon className="h-3 w-3" /> {a.label}
          </Button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-xs text-center mt-8">Ask the AI assistant for help with your solution.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === 'user' ? 'ml-6 bg-primary/10 border-primary/20' : 'mr-2 bg-secondary/50 border-border/30'} rounded-lg p-3 border`}>
            <p className="whitespace-pre-wrap text-xs leading-relaxed">{m.content}</p>
            {m.role === 'assistant' && onApplySuggestion && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs h-6 gap-1 text-primary" onClick={() => onApplySuggestion(m.content)}>
                <Wrench className="h-3 w-3" /> Apply to solution
              </Button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 flex gap-2">
        <Input
          placeholder="Ask AI for help..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          className="bg-background/50 border-border/50 text-sm h-9"
        />
        <Button size="icon" className="h-9 w-9 gradient-primary text-primary-foreground shrink-0" onClick={() => sendMessage(input)} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
