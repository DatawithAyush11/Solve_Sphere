import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Lazy load pages
const Auth = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Problems = lazy(() => import("./pages/Problems"));
const ProblemDetail = lazy(() => import("./pages/ProblemDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MCQQuiz = lazy(() => import("./pages/quiz/MCQQuiz"));
const QuizResults = lazy(() => import("./pages/quiz/QuizResults"));
const CodingProblems = lazy(() => import("./pages/quiz/CodingProblems"));
const CodeEditor = lazy(() => import("./pages/quiz/CodeEditor"));

const queryClient = new QueryClient();

// Page loader for Suspense fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading experience...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Landing />;
  return (
    <AppShell userXp={0}>
      <Index />
    </AppShell>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/problems" element={<ProtectedRoute><AuthenticatedLayout><Problems /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/problems/:id" element={<ProtectedRoute><AuthenticatedLayout><ProblemDetail /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><AuthenticatedLayout><Leaderboard /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><AuthenticatedLayout><Portfolio /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><AuthenticatedLayout><ProfileEdit /></AuthenticatedLayout></ProtectedRoute>} />
        {/* Quiz routes */}
        <Route path="/quiz" element={<ProtectedRoute><AuthenticatedLayout><Quiz /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/quiz/mcq" element={<ProtectedRoute><AuthenticatedLayout><MCQQuiz /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/quiz/results" element={<ProtectedRoute><AuthenticatedLayout><QuizResults /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/quiz/coding" element={<ProtectedRoute><AuthenticatedLayout><CodingProblems /></AuthenticatedLayout></ProtectedRoute>} />
        <Route path="/quiz/coding/:id" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
