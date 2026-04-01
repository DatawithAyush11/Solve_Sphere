import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Send, FileText, Paintbrush } from 'lucide-react';
import DocumentationMode, { type DocumentationData, emptyDoc } from '@/components/solution/DocumentationMode';
import BlueprintMode, { type BlueprintData, emptyBlueprint } from '@/components/solution/BlueprintMode';
import AIAssistantPanel from '@/components/solution/AIAssistantPanel';
import CommunitySection from '@/components/solution/CommunitySection';

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

interface SolutionEntry {
  id: string;
  content: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
  avg_rating?: number;
}

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; criteria?: { relevance: number; feasibility: number; technical: number; creativity: number; clarity: number } } | null>(null);
  const [solutions, setSolutions] = useState<SolutionEntry[]>([]);
  const [activeTab, setActiveTab] = useState('documentation');
  const [docData, setDocData] = useState<DocumentationData>(emptyDoc);
  const [blueprintData, setBlueprintData] = useState<BlueprintData>(emptyBlueprint);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: prob } = await supabase.from('problems').select('*').eq('id', id).single();
      setProblem(prob);
      await loadSolutions();
      setLoading(false);
    };
    load();
  }, [id]);

  const loadSolutions = async () => {
    const { data: sols } = await supabase.from('solutions').select('*, profiles(username)').eq('problem_id', id).order('ai_score', { ascending: false });
    if (sols) {
      const withRatings = await Promise.all(sols.map(async (s: any) => {
        const { data: ratings } = await supabase.from('ratings').select('score').eq('solution_id', s.id);
        const avg = ratings && ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length : 0;
        return { ...s, avg_rating: avg };
      }));
      setSolutions(withRatings);
    }
  };

  const buildSubmissionText = (): string => {
    if (activeTab === 'documentation') {
      return [
        `# ${docData.title}`,
        `## Summary\n${docData.summary}`,
        `## Problem Understanding\n${docData.problemUnderstanding}`,
        `## Proposed Solution\n${docData.proposedSolution}`,
        `## Technical Approach\n${docData.technicalApproach}`,
        `## Implementation Steps\n${docData.implementationSteps.filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        docData.toolsAndTech.length ? `## Tools & Technologies\n${docData.toolsAndTech.join(', ')}` : '',
        docData.expectedImpact ? `## Expected Impact\n${docData.expectedImpact}` : '',
        docData.challenges ? `## Challenges\n${docData.challenges}` : '',
      ].filter(Boolean).join('\n\n');
    } else {
      const shapeSummary = blueprintData.shapes.map(s =>
        s.type === 'text' ? `Text: "${s.text}"` : `${s.type} at (${Math.round(s.x)},${Math.round(s.y)})`
      ).join('; ');
      return `Visual Blueprint:\n${blueprintData.description}\n\nDiagram elements: ${shapeSummary || 'None'}`;
    }
  };

  const hasContent = () => {
    if (activeTab === 'documentation') return docData.title.trim() || docData.summary.trim() || docData.proposedSolution.trim();
    return blueprintData.description.trim() || blueprintData.shapes.length > 0;
  };

  const handleSubmit = async () => {
    if (!hasContent() || !user || !problem) return;
    setSubmitting(true);
    try {
      const text = buildSubmissionText();

      // First insert solution without score (client cannot set ai_score)
      const { data: inserted, error: insertErr } = await supabase.from('solutions').insert({
        user_id: user.id,
        problem_id: problem.id,
        content: text,
      }).select('id').single();
      if (insertErr) throw new Error(insertErr.message);

      // Now evaluate via backend which also saves score securely
      const res = await supabase.functions.invoke('ai-solve', {
        body: { action: 'evaluate', text, problemTitle: problem.title, problemDescription: problem.description, solutionId: inserted.id },
      });
      if (res.error) throw new Error(res.error.message);
      const { score, feedback, criteria } = res.data;
      setEvaluation({ score, feedback, criteria });

      toast({ title: `Solution submitted! Score: ${score}/100` });
      await loadSolutions();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!problem) return <div className="container py-20 text-center text-muted-foreground">Problem not found</div>;

  const currentText = buildSubmissionText();

  return (
    <div className="container py-6 max-w-7xl animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/problems')} className="gap-2 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Problems
      </Button>

      {/* Problem header */}
      <div className="glass-card p-5 mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{problem.title}</h1>
          <Badge variant="secondary">{problem.category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{problem.description}</p>
      </div>

      {/* Main layout: Editor + AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="documentation" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <FileText className="h-4 w-4" /> Documentation
              </TabsTrigger>
              <TabsTrigger value="blueprint" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Paintbrush className="h-4 w-4" /> Visual Blueprint
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documentation">
              <DocumentationMode data={docData} onChange={setDocData} />
            </TabsContent>
            <TabsContent value="blueprint">
              <BlueprintMode data={blueprintData} onChange={setBlueprintData} />
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !hasContent()}
              className="gradient-primary text-primary-foreground gap-2 ml-auto"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Solution for Evaluation
            </Button>
          </div>

          {/* Evaluation result */}
          {evaluation && (
            <div className="glass-card p-5 space-y-3 glow-accent">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">AI Evaluation</h3>
                <span className="text-2xl font-bold text-accent">{evaluation.score}/100</span>
              </div>
              {evaluation.criteria && (
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {(['relevance', 'feasibility', 'technical', 'creativity', 'clarity'] as const).map(key => (
                    <div key={key} className="glass-card p-2">
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-lg font-bold text-primary">{evaluation.criteria![key]}/20</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{evaluation.feedback}</p>
            </div>
          )}

          {/* Community */}
          <CommunitySection solutions={solutions} userId={user?.id} onRefresh={loadSolutions} />
        </div>

        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <AIAssistantPanel
            problemTitle={problem.title}
            problemDescription={problem.description}
            currentSolutionText={currentText}
            onApplySuggestion={(text) => {
              if (activeTab === 'documentation') {
                setDocData(prev => ({ ...prev, proposedSolution: prev.proposedSolution ? prev.proposedSolution + '\n\n' + text : text }));
              }
              toast({ title: 'Suggestion applied to your solution!' });
            }}
          />
        </div>
      </div>
    </div>
  );
}
