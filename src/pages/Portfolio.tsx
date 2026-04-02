import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, Trophy, Award, Zap, Flame, Lightbulb, User, Mail, Share2, Copy, ExternalLink, Pencil, Hexagon, Code2, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { ScoreRing } from '@/components/ui/ScoreBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface SolutionEntry {
  id: string;
  content: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  problems: { title: string; category: string; difficulty: string } | null;
}

interface Endorsement {
  id: string;
  type: string;
  message: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

const badges = [
  { icon: Trophy, title: 'Top Contributor', desc: 'Submitted 10+ solutions', minSolutions: 10, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
  { icon: Lightbulb, title: 'Innovator', desc: 'Scored 80+ on a solution', minScore: 80, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { icon: Zap, title: 'Rising Star', desc: 'Submitted first 3 solutions', minSolutions: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Flame, title: 'High Impact', desc: 'Average score above 70', minAvg: 70, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: Hexagon, title: 'Specialist', desc: 'Focus on global challenges', minSolutions: 5, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Code2, title: 'Code Ninja', desc: 'Submitted 5+ pure coding solutions', minScore: 90, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<SolutionEntry[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'solutions' | 'achievements'>('solutions');
  const [profile, setProfile] = useState<any>(null);

  const [endorseType, setEndorseType] = useState('collaboration');
  const [endorseMsg, setEndorseMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: sols }, { data: endorse }, { data: prof }] = await Promise.all([
         supabase.from('solutions').select('*, problems(title, category, difficulty)').eq('user_id', user.id).order('created_at', { ascending: false }),
         supabase.from('endorsements').select('*, profiles:endorser_id(username)').eq('user_id', user.id).order('created_at', { ascending: false }),
         supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      ]);
      setSolutions(sols || []);
      setEndorsements((endorse as any[]) || []);
      setProfile(prof);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalScore = solutions.reduce((sum, s) => sum + (s.ai_score || 0), 0);
  const avgScore = solutions.length > 0 ? Math.round(totalScore / solutions.length) : 0;
  const highestScore = solutions.length > 0 ? Math.max(...solutions.map(s => s.ai_score || 0)) : 0;

  const earnedBadges = badges.filter(b => {
    if (b.minSolutions && solutions.length >= b.minSolutions) return true;
    if (b.minScore && highestScore >= b.minScore) return true;
    if (b.minAvg && avgScore >= b.minAvg) return true;
    return false;
  });

  const handleEndorse = async () => {
    if (!user) return;
    const { error } = await supabase.from('endorsements').insert({
      user_id: user.id,
      endorser_id: user.id,
      type: endorseType,
      message: endorseMsg.trim() || null,
    });
    if (!error) {
      toast({ title: 'Endorsement submitted!' });
      setEndorseMsg('');
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Profile link copied!' });
  };
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20my%20SolveSphere%20portfolio!&url=${encodeURIComponent(window.location.href)}`, '_blank');

  if (loading) return (
     <div className="page-container py-20 flex justify-center items-center opacity-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
     </div>
  );

  const displayUsername = profile?.username || user?.user_metadata?.username || 'Solver';

  return (
    <div className="page-container animate-fade-in relative z-10 w-full max-w-6xl space-y-8">
       
      {/* Banner & Profile Hero */}
      <div className="card-premium rounded-3xl overflow-hidden relative shadow-lg">
         <div className="h-48 w-full bg-gradient-to-r from-primary/30 via-violet-500/20 to-blue-500/30 relative">
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -bottom-8 left-10 w-32 h-32 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden shadow-xl z-20">
               {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center text-4xl font-black text-white">
                     {displayUsername.charAt(0).toUpperCase()}
                  </div>
               )}
            </div>
         </div>
         
         <div className="pt-12 pb-8 px-10 relative">
            <div className="absolute right-8 top-6 flex items-center gap-3">
               <Button size="sm" variant="outline" className="h-9 px-4 gap-2 hover:bg-secondary rounded-full" onClick={() => navigate('/profile/edit')}>
                 <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Edit Profile</span>
               </Button>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button size="sm" className="h-9 px-4 gap-2 rounded-full gradient-primary text-black font-semibold shadow-md inline-flex">
                      <Share2 className="h-3.5 w-3.5" /> Share
                   </Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader><DialogTitle>Share Profile</DialogTitle></DialogHeader>
                   <div className="space-y-3 pt-2">
                     <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={copyProfileLink}><Copy className="h-4 w-4" /> Copy Link</Button>
                     <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={shareLinkedIn}><ExternalLink className="h-4 w-4" /> Share on LinkedIn</Button>
                     <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={shareTwitter}><ExternalLink className="h-4 w-4" /> Share on Twitter</Button>
                   </div>
                 </DialogContent>
               </Dialog>
            </div>

            <div className="max-w-2xl mt-4 sm:mt-0">
               <h1 className="text-4xl font-black mb-1">{displayUsername}</h1>
               <p className="text-lg text-muted-foreground font-medium mb-4">{profile?.bio || 'Passionate about solving real-world computing problems.'}</p>
               
               <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold text-xs rounded-full">
                     <Star className="h-3.5 w-3.5 mr-1.5 fill-primary" /> Level {Math.floor(totalScore / 100) + 1} Solver
                  </Badge>
                  {earnedBadges.slice(0, 2).map((b,i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1 font-medium text-xs rounded-full">
                       <b.icon className={cn("h-3.5 w-3.5 mr-1.5", b.color)} /> {b.title}
                    </Badge>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatCard title="Total XP Earned" value={totalScore.toLocaleString()} icon={<Star className="h-5 w-5" />} className="border-accent/20" glow />
         <StatCard title="Problems Solved" value={solutions.length} icon={<Zap className="h-5 w-5" />} />
         <StatCard title="Average AI Score" value={avgScore} icon={<Presentation className="h-5 w-5" />} />
         <StatCard title="Endorsements" value={endorsements.length} icon={<Award className="h-5 w-5" />} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
         {/* Left Side: Solutions & Tabs */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 border-b border-border/30 pb-2">
               {(['solutions', 'achievements'] as const).map(t => (
                 <button key={t} onClick={() => setTab(t)}
                   className={cn(
                     "px-6 py-2 text-sm font-bold capitalize rounded-full transition-all", 
                     tab === t ? "bg-primary text-black shadow-md" : "text-muted-foreground hover:bg-secondary/50"
                   )}>
                   {t}
                 </button>
               ))}
            </div>

            {tab === 'solutions' && (
               solutions.length === 0 ? (
                  <EmptyState 
                     icon={<Code2 className="h-10 w-10" />}
                     title="No Portfolio Items"
                     description="You haven't solved any challenges yet. Solve problems to build your portfolio."
                     action={<Button onClick={() => navigate('/problems')} className="gradient-primary text-black">Find a Problem</Button>}
                     className="mt-8"
                  />
               ) : (
                  <div className="space-y-4">
                     {solutions.map((sol, idx) => (
                        <div key={sol.id} className="glass-card flex flex-col sm:flex-row gap-5 p-5 animate-slide-up hover-lift" style={{ animationDelay: `${idx * 40}ms` }}>
                           <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                 <div>
                                    <h3 className="font-bold text-lg leading-tight mb-1">{sol.problems?.title || 'Unknown Problem'}</h3>
                                    <div className="flex gap-2">
                                       <Badge variant="secondary" className="text-[10px]">{sol.problems?.category}</Badge>
                                       {sol.problems?.difficulty && <Badge variant="outline" className="text-[10px] uppercase border-border/50 text-muted-foreground">{sol.problems.difficulty}</Badge>}
                                    </div>
                                 </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3 bg-secondary/20 p-3 rounded-lg border border-border/50">
                                 {sol.content}
                              </p>
                              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-1">
                                 <span>{new Date(sol.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                 <Button variant="link" className="text-primary h-auto p-0 text-xs">Read Full Submittion</Button>
                              </div>
                           </div>
                           
                           {sol.ai_score !== null && (
                              <div className="shrink-0 flex sm:flex-col items-center justify-center gap-3 sm:gap-2 sm:border-l sm:border-border/50 sm:pl-5">
                                 <ScoreRing score={sol.ai_score} size={80} strokeWidth={6} />
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:block">AI Score</span>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               )
            )}

            {tab === 'achievements' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {badges.map((b, i) => {
                    const earned = earnedBadges.includes(b);
                    return (
                       <div key={b.title} className={cn("glass-card p-5 border relative overflow-hidden group transition-all", earned ? `border-primary/30 glow-primary` : 'opacity-60 grayscale border-border/20')} style={{ animationDelay: `${i * 30}ms`}}>
                          <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", earned ? b.bg : 'bg-secondary')}>
                             <b.icon className={cn("h-7 w-7", earned ? b.color : 'text-muted-foreground')} />
                          </div>
                          <h3 className="font-bold text-lg mb-1">{b.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                          
                          {earned && (
                             <div className="absolute top-4 right-4 animate-bounce-slow">
                                <Trophy className="h-5 w-5 text-accent opacity-30" />
                             </div>
                          )}
                       </div>
                    );
                  })}
               </div>
            )}
         </div>

         {/* Right Side: Endorsements Widget */}
         <div className="space-y-6">
            <div className="glass-card p-6">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                     <Award className="h-5 w-5 text-accent" /> Peer Endorsements
                  </h2>
               </div>
               
               {endorsements.length === 0 ? (
                  <div className="text-center py-6 bg-secondary/30 rounded-xl border border-dashed border-border/50">
                     <p className="text-sm text-muted-foreground">No endorsements received yet. Share your profile to get endorsed!</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {endorsements.slice(0,4).map(e => (
                        <div key={e.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">@{e.profiles?.username || 'Peer'}</span>
                              <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{e.type}</Badge>
                           </div>
                           <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/40 pl-3">"{e.message || 'Highly recommended!'}"</p>
                        </div>
                     ))}
                  </div>
               )}
               
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="w-full mt-4 gap-2 border-dashed border-border/60 hover:bg-secondary">
                      <Award className="h-4 w-4" /> Request Endorsement
                   </Button>
                 </DialogTrigger>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Request an Endorsement</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Share your profile link with peers or mentors so they can vouch for your work here.</p>
                    <div className="flex items-center gap-2 mt-4">
                       <Input value={window.location.href} readOnly className="bg-secondary" />
                       <Button onClick={copyProfileLink} className="shrink-0 px-3"><Copy className="h-4 w-4" /></Button>
                    </div>
                 </DialogContent>
               </Dialog>
            </div>
         </div>
      </div>
    </div>
  );
}
