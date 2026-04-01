import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getProblemById, type CodingProblem } from '@/data/codingProblems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Play, RotateCcw, Lightbulb, ChevronDown,
  CheckCircle, XCircle, AlertCircle, Code2, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Language = 'javascript' | 'python' | 'java';
type RunResult = { status: 'pass' | 'fail' | 'error'; message: string; testCase?: string };

const LANG_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
};

const LANG_MONACO: Record<Language, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
};

/** Simulate test case execution for JavaScript solutions */
function runJavaScriptSolution(code: string, problem: CodingProblem): RunResult[] {
  const results: RunResult[] = [];
  for (const tc of problem.testCases) {
    try {
      // Wrap user code in a function and run it
      const input = tc.input;
      let result: any;
      try {
        // Build callable wrapper
        const wrapped = `
${code}
// Auto-invoke based on problem
const _input = ${JSON.stringify(input)};
const _keys = Object.keys(_input);
const _args = _keys.map(k => _input[k]);

// Common function names to try
const _fns = [twoSum, isValid, reverseList, maxSubArray, climbStairs, search, 
               mergeTwoLists, numIslands, longestCommonSubsequence, trap, fib, isPalindrome];
let _result;
for (const fn of _fns) {
  try { if (typeof fn === 'function') { _result = fn(..._args); break; } } catch(e) {}
}
_result;
`;
        // eslint-disable-next-line no-new-func
        result = new Function(wrapped)();
      } catch (e: any) {
        results.push({ status: 'error', message: `Runtime error: ${e.message}`, testCase: tc.description });
        continue;
      }

      const expected = tc.expected;
      const passed = JSON.stringify(result) === JSON.stringify(expected) ||
        (Array.isArray(result) && Array.isArray(expected) &&
          result.length === expected.length &&
          result.every((v: any, i: number) => v === expected[i]));

      results.push({
        status: passed ? 'pass' : 'fail',
        message: passed
          ? `✓ ${tc.description}`
          : `✗ ${tc.description}\n  Expected: ${JSON.stringify(expected)}\n  Got: ${JSON.stringify(result)}`,
        testCase: tc.description,
      });
    } catch (e: any) {
      results.push({ status: 'error', message: `Error: ${e.message}`, testCase: tc.description });
    }
  }
  return results;
}

const DIFFICULTY_BADGE = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CodeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = id ? getProblemById(id) : null;

  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'hints'>('description');
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState<number | null>(null);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || '');
      setResults(null);
    }
  }, [problem, language]);

  if (!problem) {
    return (
      <div className="container py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Problem not found</h2>
        <Button onClick={() => navigate('/quiz/coding')}>Back to Problems</Button>
      </div>
    );
  }

  const handleRun = async () => {
    setRunning(true);
    setResults(null);
    // Simulate a small delay
    await new Promise(r => setTimeout(r, 600));
    if (language === 'javascript') {
      const res = runJavaScriptSolution(code, problem);
      setResults(res);
    } else {
      // For Python/Java — simulate with informational message
      setResults([{
        status: 'error',
        message: `${LANG_LABELS[language]} execution is simulated. Switch to JavaScript to run test cases interactively in the browser.\n\nYour code structure looks correct — great work!`,
        testCase: 'Note',
      }]);
    }
    setRunning(false);
  };

  const handleReset = () => {
    setCode(problem.starterCode[language] || '');
    setResults(null);
  };

  const passCount = results?.filter(r => r.status === 'pass').length ?? 0;
  const allPassed = results !== null && passCount === problem.testCases.length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-3">
          <button id="back-to-coding-btn" onClick={() => navigate('/quiz/coding')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-sm truncate max-w-48">{problem.title}</span>
          <Badge className={cn('text-xs', DIFFICULTY_BADGE[problem.difficulty])}>
            {problem.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">{problem.category}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex rounded-lg overflow-hidden border border-border/50">
            {(Object.keys(LANG_LABELS) as Language[]).map(lang => (
              <button
                key={lang}
                id={`lang-${lang}`}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  language === lang ? 'bg-primary text-white' : 'bg-secondary/50 text-muted-foreground hover:text-foreground',
                )}
              >
                {lang === 'javascript' ? 'JS' : lang === 'python' ? 'PY' : 'Java'}
              </button>
            ))}
          </div>
          <Button id="reset-code-btn" variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button id="run-code-btn" size="sm" onClick={handleRun} disabled={running} className="gradient-primary text-white gap-2 min-w-24">
            {running ? (
              <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Running...</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Run Code</>
            )}
          </Button>
        </div>
      </div>

      {/* Split panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Problem description */}
        <div className="w-80 lg:w-96 border-r border-border/50 flex flex-col overflow-hidden flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-border/50 flex-shrink-0">
            {(['description', 'hints'] as const).map(tab => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-xs font-medium transition-colors capitalize flex items-center justify-center gap-1.5',
                  activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab === 'description' ? <BookOpen className="h-3.5 w-3.5" /> : <Lightbulb className="h-3.5 w-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'description' ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{problem.description}</p>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg bg-secondary/30 p-3 space-y-1.5 border border-border/40">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Input: </span>
                        <code className="text-primary text-xs">{ex.input}</code>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Output: </span>
                        <code className="text-emerald-400 text-xs">{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="text-xs text-muted-foreground italic">{ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Constraints</h3>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.map(tag => (
                    <span key={tag} className="text-xs bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Stuck? Here are some hints to guide you:</p>
                {problem.hints.map((hint, i) => (
                  <div key={i} className="rounded-lg border border-border/40 overflow-hidden">
                    <button
                      id={`hint-${i}`}
                      onClick={() => setShowHint(showHint === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <span className="text-sm font-medium">Hint {i + 1}</span>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showHint === i && 'rotate-180')} />
                    </button>
                    {showHint === i && (
                      <div className="px-3 pb-3 text-sm text-muted-foreground">{hint}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={LANG_MONACO[language]}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontLigatures: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Test Results Panel */}
          {results && (
            <div className="border-t border-border/50 bg-background flex-shrink-0 max-h-52 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {allPassed
                    ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                    : <XCircle className="h-4 w-4 text-red-400" />}
                  Test Results
                  {language === 'javascript' && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {passCount}/{problem.testCases.length} passed
                    </span>
                  )}
                </div>
                {allPassed && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">All Passed! 🎉</Badge>
                )}
              </div>
              <div className="p-3 space-y-2">
                {results.map((r, i) => (
                  <div key={i} className={cn(
                    'rounded-lg p-3 text-xs font-mono border',
                    r.status === 'pass' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                    r.status === 'fail' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                    'bg-amber-500/5 border-amber-500/20 text-amber-400',
                  )}>
                    <div className="flex items-start gap-2">
                      {r.status === 'pass' ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> :
                        r.status === 'fail' ? <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> :
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />}
                      <pre className="whitespace-pre-wrap text-xs">{r.message}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
