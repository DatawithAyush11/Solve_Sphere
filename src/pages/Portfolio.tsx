import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, Trophy, Award, Zap, Flame, Lightbulb, User, Mail, Share2, Copy, ExternalLink, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SolutionEntry {
  id: string;
  content: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  problems: { title: string; category: string } | null;
}

interface Endorsement {
  id: string;
  type: string;
  message: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

const badges = [
  { icon: Trophy, title: 'Top Contributor', desc: 'Submitted 10+ solutions', minSolutions: 10, color: 'text-accent' },
  { icon: Lightbulb, title: 'Innovator', desc: 'Scored 80+ on a solution', minScore: 80, color: 'text-primary' },
  { icon: Zap, title: 'Rising Star', desc: 'Submitted first 3 solutions', minSolutions: 3, color: 'text-[hsl(var(--success))]' },
  { icon: Flame, title: 'High Impact', desc: 'Average score above 70', minAvg: 70, color: 'text-[hsl(var(--warning))]' },
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

  // Endorse modal state
  const [endorseType, setEndorseType] = useState('collaboration');
  const [endorseMsg, setEndorseMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: sols }, { data: endorse }, { data: prof }] = await Promise.all([
        supabase.from('solutions').select('*, problems(title, category)').eq('user_id', user.id).order('created_at', { ascending: false }),
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

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check%20out%20my%20SolveSphere%20portfolio!&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container py-8 space-y-8 max-w-4xl animate-fade-in">
      {/* Profile Header */}
      <div className="glass-card p-8 glow-primary">
         <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 flex items-center justify-center bg-secondary">
              {(profile as any)?.avatar_url ? (
                <img src={(profile as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-bold">{profile?.username || user?.user_metadata?.username || 'Solver'}</h1>
            <p className="text-muted-foreground">{profile?.bio || 'Solving real-world problems'}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {earnedBadges.length > 0 ? earnedBadges.map(b => (
                <Badge key={b.title} variant="secondary" className="text-xs">{b.title}</Badge>
              )) : (
                <Badge variant="secondary" className="text-xs">Problem Solver</Badge>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button size="sm" variant="secondary" className="gap-1" onClick={() => navigate('/profile/edit')}>
              <Pencil className="h-3 w-3" /> Edit Profile
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-1"><Mail className="h-3 w-3" /> Contact</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Contact</DialogTitle></DialogHeader>
                <p className="text-muted-foreground text-sm">
                  Email: {(() => {
                    const email = profile?.contact_email || user?.email || '';
                    const [local, domain] = email.split('@');
                    if (!domain) return email;
                    return `${local.slice(0, 2)}***@${domain}`;
                  })()}
                </p>
                {profile?.linkedin_url && <p className="text-sm"><a href={profile.linkedin_url} target="_blank" className="text-primary hover:underline">LinkedIn</a></p>}
                {profile?.github_url && <p className="text-sm"><a href={profile.github_url} target="_blank" className="text-primary hover:underline">GitHub</a></p>}
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-1"><Award className="h-3 w-3" /> Endorse</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Endorse This User</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Select value={endorseType} onValueChange={setEndorseType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="job">Job Offer</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Add a message…" value={endorseMsg} onChange={e => setEndorseMsg(e.target.value)} />
                  <Button onClick={handleEndorse} className="gradient-primary text-primary-foreground w-full">Submit Endorsement</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-1"><Share2 className="h-3 w-3" /> Share</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Share Profile</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={copyProfileLink}><Copy className="h-4 w-4" /> Copy Link</Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={shareLinkedIn}><ExternalLink className="h-4 w-4" /> Share on LinkedIn</Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={shareTwitter}><ExternalLink className="h-4 w-4" /> Share on Twitter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Score', value: totalScore, icon: Star, glow: true },
          { label: 'Solutions', value: solutions.length, icon: Zap },
          { label: 'Avg Score', value: avgScore, icon: Trophy },
          { label: 'Endorsements', value: endorsements.length, icon: Award },
        ].map(s => (
          <div key={s.label} className={`glass-card p-4 text-center ${s.glow ? 'glow-accent' : ''}`}>
            <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/30 pb-0">
        {(['solutions', 'achievements'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'solutions' && (
        solutions.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted-foreground">No solutions yet. Start solving problems!</div>
        ) : (
          <div className="space-y-4">
            {solutions.map(sol => (
              <div key={sol.id} className="glass-card p-5 space-y-3 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{sol.problems?.title || 'Unknown'}</h3>
                    <Badge variant="secondary" className="text-xs">{sol.problems?.category}</Badge>
                  </div>
                  {sol.ai_score !== null && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="font-bold text-accent">{sol.ai_score}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{sol.content}</p>
                {sol.ai_feedback && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary hover:underline">View AI Feedback</summary>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap bg-background/50 rounded-lg p-3">{sol.ai_feedback}</p>
                  </details>
                )}
                <p className="text-xs text-muted-foreground">{new Date(sol.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map(b => {
            const earned = earnedBadges.includes(b);
            return (
              <div key={b.title} className={`glass-card p-5 space-y-2 ${earned ? 'glow-accent' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <b.icon className={`h-8 w-8 ${earned ? b.color : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
                {earned && (
                  <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=I earned the ${b.title} badge on SolveSphere!`, '_blank');
                  }}>
                    <Share2 className="h-3 w-3" /> Share Badge
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Endorsements */}
      {endorsements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Endorsements</h2>
          {endorsements.map(e => (
            <div key={e.id} className="glass-card p-4 flex items-start gap-3">
              <Badge variant="secondary" className="text-xs capitalize">{e.type}</Badge>
              <div className="flex-1">
                {e.message && <p className="text-sm text-muted-foreground">{e.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(e.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
