import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Sparkles, Wrench, Cpu, AlertCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props {
  problemTitle: string;
  problemDescription: string;
  currentSolutionText: string;
  onApplySuggestion?: (text: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: 'Improve code', icon: Sparkles, prompt: 'How can I optimize the current solution drafted?' },
  { label: 'Suggest stack', icon: Cpu, prompt: 'Suggest the technical stack for this problem based on my solution.' },
];

export default function AIAssistantPanel({ problemTitle, problemDescription, currentSolutionText, onApplySuggestion }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Keep internal chat scrolled to bottom safely without moving the whole page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const savedScrollY = window.scrollY;

    try {
      const promptText = `You are a highly intelligent AI assistant like Gemini or ChatGPT.

User Question:
${text}

Problem Context (ONLY if relevant):
Title: ${problemTitle}
Description: ${problemDescription}
${currentSolutionText?.trim() ? `\nUser's Current Solution Draft:\n${currentSolutionText}\n` : ''}
Instructions:
- Understand user intent carefully
- If the question is GENERAL → answer directly (no problem context)
- If the question is PROBLEM-RELATED → include relevant context
- Do NOT force solution improvement
- Do NOT assume every question is about the problem
- Avoid repetition
- Give accurate, clear, and structured answers`;

      let res = await supabase.functions.invoke('ai-solve', {
        body: { prompt: promptText }
      });
        
        if (res.error) throw new Error(res.error.message || "Failed to call backend");
        if (res.data?.error) throw new Error(res.data.error);
        
        let aiResult = res.data?.text;

        if (!aiResult) {
          aiResult = "No response from AI";
        }

        if (lastResponse && aiResult.trim() === lastResponse.trim()) {
          console.log("Regenerating due to similarity...");
          const regenPrompt = promptText + "\n\nGive a different and more specific answer.";
          const regenRes = await supabase.functions.invoke('ai-solve', {
            body: { prompt: regenPrompt }
          });
          
          if (!regenRes.error && regenRes.data?.text) {
            aiResult = regenRes.data.text;
          }
        }

        setLastResponse(aiResult);
        const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResult };
        setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error("Gemini Backend Error:", e);
      toast({ title: 'Error', description: e.message || 'Unable to generate response. Try again.', variant: 'destructive' });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Unable to generate response. Try again." }]);
    }

    setLoading(false);
    setTimeout(() => {
      window.scrollTo({
        top: savedScrollY,
        behavior: "auto"
      });
    }, 10);
  };

  return (
    <div className="glass-card flex flex-col h-full bg-card/60 relative overflow-hidden" style={{ minHeight: 600 }}>
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">SolveAI Assistant</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Context: {problemTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-gradient-to-b from-transparent to-primary/5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 animate-fade-in p-4">
            <Bot className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">How can I help you solve this?</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Ask for hints, code improvements, or structural reviews.</p>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {quickActions.map(a => (
                <Button key={a.label} variant="outline" size="sm" className="bg-card w-full text-xs justify-start px-3" onClick={() => sendMessage(a.prompt)} disabled={loading}>
                  <a.icon className="h-3.5 w-3.5 mr-2 text-primary" />
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn("flex flex-col max-w-[85%] animate-scale-in origin-bottom", m.role === 'user' ? "ml-auto" : "mr-auto")}>
            <div className={cn(
              "px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
              m.role === 'user' ? "chat-bubble-user" : "chat-bubble-ai"
            )}>
              {m.content}
            </div>

            {m.role === 'assistant' && onApplySuggestion && (
              <div className="mt-1 flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 rounded" onClick={() => onApplySuggestion(m.content)}>
                  <Wrench className="h-3 w-3" /> Append to solution
                </Button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="mr-auto flex gap-1 items-center bg-secondary px-3 py-2 rounded-2xl rounded-tl-sm border border-border/50">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-1" />
            <span className="text-xs font-medium text-muted-foreground">Generating...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border/50 bg-card">
        {(!currentSolutionText || currentSolutionText.trim().length < 20) && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-500/80 mb-2 px-1">
            <AlertCircle className="h-3 w-3" /> Write more in the editor for better context
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            className="flex-1 bg-secondary/30 border-border focus-visible:ring-primary h-11"
          />
          <Button
            className="h-11 w-11 shrink-0 rounded-xl gradient-primary text-black group transition-all"
            onClick={() => sendMessage(input)}
            disabled={loading || input.trim().length === 0}
          >
            <Send className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
