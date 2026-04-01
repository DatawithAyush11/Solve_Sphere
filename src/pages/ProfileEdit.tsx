import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Camera, ArrowLeft, Save, User, Trash2 } from 'lucide-react';

export default function ProfileEdit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [contactVisible, setContactVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (prof) {
        setUsername(prof.username || '');
        setBio(prof.bio || '');
        setContactEmail(prof.contact_email || '');
        setLinkedinUrl(prof.linkedin_url || '');
        setGithubUrl(prof.github_url || '');
        setContactVisible((prof as any).contact_visible || false);
        setAvatarUrl((prof as any).avatar_url || '');
        if ((prof as any).avatar_url) setPreviewUrl((prof as any).avatar_url);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 2MB allowed', variant: 'destructive' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Only images allowed', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = urlData.publicUrl + '?t=' + Date.now();
    setAvatarUrl(url);
    setPreviewUrl(url);
    setUploading(false);
    toast({ title: 'Photo uploaded!' });
  };

  const removeAvatar = async () => {
    if (!user) return;
    setAvatarUrl('');
    setPreviewUrl('');
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      toast({ title: 'Username required', variant: 'destructive' });
      return;
    }
    if (linkedinUrl && !validateUrl(linkedinUrl)) {
      toast({ title: 'Invalid LinkedIn URL', variant: 'destructive' });
      return;
    }
    if (githubUrl && !validateUrl(githubUrl)) {
      toast({ title: 'Invalid GitHub URL', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      username: username.trim(),
      bio: bio.trim(),
      contact_email: contactEmail.trim(),
      linkedin_url: linkedinUrl.trim(),
      github_url: githubUrl.trim(),
      contact_visible: contactVisible,
      avatar_url: avatarUrl,
    } as any).eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated successfully!' });
      navigate('/portfolio');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container py-8 max-w-2xl space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Button>

      <div className="glass-card p-6 space-y-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 flex items-center justify-center bg-secondary">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="space-y-2">
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </Button>
            {previewUrl && (
              <Button variant="ghost" size="sm" onClick={removeAvatar} className="text-destructive gap-1">
                <Trash2 className="h-3 w-3" /> Remove
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground">JPG or PNG, max 2MB</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Username *</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={500} className="min-h-[80px]" />
            <p className="text-[11px] text-muted-foreground text-right">{bio.length}/500</p>
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <Label>GitHub URL</Label>
            <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
          </div>

          {/* Contact visibility toggle */}
          <div className="flex items-center justify-between glass-card p-4">
            <div>
              <p className="text-sm font-medium">Allow Contact for Opportunities</p>
              <p className="text-xs text-muted-foreground">When enabled, authenticated users can see your email</p>
            </div>
            <Switch checked={contactVisible} onCheckedChange={setContactVisible} />
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
