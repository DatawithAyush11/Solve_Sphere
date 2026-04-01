import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Leaderboard from "./pages/Leaderboard";
import Portfolio from "./pages/Portfolio";
import ProfileEdit from "./pages/ProfileEdit";
import NotFound from "./pages/NotFound";
import Quiz from "./pages/Quiz";
import MCQQuiz from "./pages/quiz/MCQQuiz";
import QuizResults from "./pages/quiz/QuizResults";
import CodingProblems from "./pages/quiz/CodingProblems";
import CodeEditor from "./pages/quiz/CodeEditor";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Landing />;
  return <><Navbar /><Index /></>;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}

function AppRoutes() {
  return (
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
