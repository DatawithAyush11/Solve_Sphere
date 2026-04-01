import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileText, Lightbulb, Wrench, Target, AlertTriangle, Plus, X, Layers } from 'lucide-react';

export interface DocumentationData {
  title: string;
  summary: string;
  problemUnderstanding: string;
  proposedSolution: string;
  technicalApproach: string;
  implementationSteps: string[];
  toolsAndTech: string[];
  expectedImpact: string;
  challenges: string;
}

const emptyDoc: DocumentationData = {
  title: '',
  summary: '',
  problemUnderstanding: '',
  proposedSolution: '',
  technicalApproach: '',
  implementationSteps: [''],
  toolsAndTech: [],
  expectedImpact: '',
  challenges: '',
};

interface Props {
  data: DocumentationData;
  onChange: (data: DocumentationData) => void;
}

function Section({ icon: Icon, title, children, defaultOpen = true }: { icon: any; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="glass-card overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function DocumentationMode({ data, onChange }: Props) {
  const update = <K extends keyof DocumentationData>(key: K, value: DocumentationData[K]) =>
    onChange({ ...data, [key]: value });

  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !data.toolsAndTech.includes(tag)) {
      update('toolsAndTech', [...data.toolsAndTech, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => update('toolsAndTech', data.toolsAndTech.filter(t => t !== tag));

  const addStep = () => update('implementationSteps', [...data.implementationSteps, '']);
  const updateStep = (i: number, val: string) => {
    const steps = [...data.implementationSteps];
    steps[i] = val;
    update('implementationSteps', steps);
  };
  const removeStep = (i: number) => update('implementationSteps', data.implementationSteps.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <Section icon={FileText} title="Solution Title & Summary">
        <Input placeholder="Solution title..." value={data.title} onChange={e => update('title', e.target.value)} className="bg-background/50 border-border/50" />
        <Textarea placeholder="Brief summary of your solution..." value={data.summary} onChange={e => update('summary', e.target.value)} className="min-h-[80px] bg-background/50 border-border/50" />
      </Section>

      <Section icon={Lightbulb} title="Problem Understanding">
        <Textarea placeholder="Describe your understanding of the problem..." value={data.problemUnderstanding} onChange={e => update('problemUnderstanding', e.target.value)} className="min-h-[100px] bg-background/50 border-border/50" />
      </Section>

      <Section icon={Target} title="Proposed Solution">
        <Textarea placeholder="Describe your proposed solution..." value={data.proposedSolution} onChange={e => update('proposedSolution', e.target.value)} className="min-h-[100px] bg-background/50 border-border/50" />
      </Section>

      <Section icon={Layers} title="Technical Approach">
        <Textarea placeholder="Explain the technical approach..." value={data.technicalApproach} onChange={e => update('technicalApproach', e.target.value)} className="min-h-[100px] bg-background/50 border-border/50" />
      </Section>

      <Section icon={Wrench} title="Implementation Steps">
        {data.implementationSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">{i + 1}.</span>
            <Input placeholder={`Step ${i + 1}...`} value={step} onChange={e => updateStep(i, e.target.value)} className="bg-background/50 border-border/50" />
            {data.implementationSteps.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeStep(i)} className="shrink-0 h-8 w-8"><X className="h-3 w-3" /></Button>
            )}
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addStep} className="gap-1"><Plus className="h-3 w-3" /> Add Step</Button>
      </Section>

      <Section icon={Wrench} title="Tools & Technologies" defaultOpen={false}>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.toolsAndTech.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add technology..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="bg-background/50 border-border/50" />
          <Button variant="secondary" size="sm" onClick={addTag}>Add</Button>
        </div>
      </Section>

      <Section icon={Target} title="Expected Impact" defaultOpen={false}>
        <Textarea placeholder="Describe the expected impact..." value={data.expectedImpact} onChange={e => update('expectedImpact', e.target.value)} className="min-h-[80px] bg-background/50 border-border/50" />
      </Section>

      <Section icon={AlertTriangle} title="Challenges & Limitations" defaultOpen={false}>
        <Textarea placeholder="Potential challenges and limitations..." value={data.challenges} onChange={e => update('challenges', e.target.value)} className="min-h-[80px] bg-background/50 border-border/50" />
      </Section>
    </div>
  );
}

export { emptyDoc };
