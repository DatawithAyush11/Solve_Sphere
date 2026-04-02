import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Send, FileText, Paintbrush, Globe, MapPin, Target } from 'lucide-react';
import DocumentationMode, { type DocumentationData, emptyDoc } from '@/components/solution/DocumentationMode';
import BlueprintMode, { type BlueprintData, emptyBlueprint } from '@/components/solution/BlueprintMode';
import AIAssistantPanel from '@/components/solution/AIAssistantPanel';
import CommunitySection from '@/components/solution/CommunitySection';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

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

      const { data: inserted, error: insertErr } = await supabase.from('solutions').insert({
        user_id: user.id,
        problem_id: problem.id,
        content: text,
      }).select('id').single();
      if (insertErr) throw new Error(insertErr.message);

      const res = await supabase.functions.invoke('ai-solve', {
        body: { action: 'evaluate', text, problemTitle: problem.title, problemDescription: problem.description, solutionId: inserted.id },
      });
      if (res.error) throw new Error(res.error.message);
      
      const { score, feedback, criteria } = res.data;
      setEvaluation({ score, feedback, criteria });

      toast({ title: `Solution Submitted!`, description: `You scored ${score} points.` });
      await loadSolutions();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="page-container">
       <SkeletonCard lines={2} hasHeader={true} className="h-32 mb-6" />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
             <SkeletonCard lines={10} hasHeader={false} className="h-[400px]" />
          </div>
          <SkeletonCard lines={8} hasHeader={false} className="h-[400px]" />
       </div>
    </div>
  );
  
  if (!problem) return <div className="page-container text-center text-muted-foreground py-20">Problem not found</div>;

  const currentText = buildSubmissionText();

  return (
    <div className="page-container animate-fade-in relative z-10 w-full">
      <Button variant="ghost" size="sm" onClick={() => navigate('/problems')} className="gap-2 mb-2 w-fit -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Problem Context Banner */}
      <div className="card-premium p-6 sm:p-8 mb-6 border-l-4 border-l-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge variant={problem.category === 'global' ? 'default' : 'secondary'} className={problem.category === 'global' ? 'gradient-primary text-primary-foreground' : ''}>
            {problem.category === 'global' ? <Globe className="h-3.5 w-3.5 mr-1.5" /> : <MapPin className="h-3.5 w-3.5 mr-1.5" />}
            {problem.category}
          </Badge>
          <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-bold px-2">{problem.difficulty}</Badge>
        </div>
        <h1 className="text-3xl font-black mb-3">{problem.title}</h1>
        <p className="text-muted-foreground leading-relaxed sm:text-lg max-w-4xl relative z-10">{problem.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-secondary/40 p-2 border-b border-border/30">
              <TabsList className="bg-transparent space-x-1 h-auto p-0">
                <TabsTrigger value="documentation" className="px-4 py-2 text-sm gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl transition-all">
                  <FileText className="h-4 w-4 text-primary" /> Documentation
                </TabsTrigger>
                <TabsTrigger value="blueprint" className="px-4 py-2 text-sm gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl transition-all">
                  <Paintbrush className="h-4 w-4 text-blue-400" /> Visual Blueprint
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-1">
              <TabsContent value="documentation" className="m-0 focus-visible:ring-0">
                <DocumentationMode data={docData} onChange={setDocData} />
              </TabsContent>
              <TabsContent value="blueprint" className="m-0 focus-visible:ring-0">
                <BlueprintMode data={blueprintData} onChange={setBlueprintData} />
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !hasContent()}
              size="lg"
              className="gradient-primary text-black font-bold h-14 px-8 text-lg rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all group"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Target className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />}
              {submitting ? 'Evaluating...' : 'Submit for AI Evaluation'}
            </Button>
          </div>

          {/* AI Evaluation Results */}
          {evaluation && (
            <div className="glass-card overflow-hidden animate-slide-up border-primary/40 glow-primary">
              <div className="gradient-primary p-6 text-black flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">AI Evaluation Report</h3>
                  <p className="text-black/70 font-medium">Auto-generated feedback</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black tracking-tighter leading-none">{evaluation.score}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">Total Score</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-sm font-medium leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/20 text-foreground">{evaluation.feedback}</p>
                
                {evaluation.criteria && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(['relevance', 'feasibility', 'technical', 'creativity', 'clarity'] as const).map((key, i) => {
                      const scoreValue = evaluation.criteria![key];
                      const pct = (scoreValue / 20) * 100;
                      return (
                        <div key={key} className="glass-card p-3 animate-scale-in" style={{ animationDelay: `${i * 100}ms`}}>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">{key}</p>
                          <div className="flex items-end gap-1 mb-2">
                            <span className="text-2xl font-black text-foreground">{scoreValue}</span>
                            <span className="text-xs text-muted-foreground pb-1">/20</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full gradient-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Community Section */}
          <CommunitySection solutions={solutions} userId={user?.id} onRefresh={loadSolutions} />
        </div>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1 h-[calc(100vh-140px)] sticky top-24">
          <AIAssistantPanel
            problemTitle={problem.title}
            problemDescription={problem.description}
            currentSolutionText={currentText}
            onApplySuggestion={(text) => {
              if (activeTab === 'documentation') {
                setDocData(prev => ({ ...prev, proposedSolution: prev.proposedSolution ? prev.proposedSolution + '\n\n' + text : text }));
              }
              toast({ title: 'Suggestion prepended to documentation' });
            }}
          />
        </div>
      </div>
    </div>
  );
}
