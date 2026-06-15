import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Droplet } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import ChatPage from "@/pages/Chat";
import ArenaPage from "@/pages/Arena";
import LeaderboardPage from "@/pages/Leaderboard";
import AdminPage from "@/pages/Admin";
import ApiDocsPage from "@/pages/ApiDocs";
import { useLocale } from "@/hooks/useLocale";

function AuthGate({ children }: { children: JSX.Element }) {
  const status = useAuthStore((s) => s.status);
  if (status === "idle" || status === "loading") {
    return <SessionLoader />;
  }
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => Boolean(s.user?.is_staff));
  const location = useLocation();
  if (status === "idle" || status === "loading") return <SessionLoader />;
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isStaff) return <Navigate to="/chat" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const status = useAuthStore((s) => s.status);
  if (status === "idle" || status === "loading") {
    return <SessionLoader />;
  }
  if (status === "authenticated") {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function SessionLoader() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-brand-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex flex-col items-center gap-3 text-zinc-600 dark:text-zinc-300">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
          <Droplet size={22} fill="currentColor" className="animate-pulse" />
        </div>
        <div className="text-sm font-medium">{t("app.sessionLoading")}</div>
      </div>
    </div>
  );
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const status = useAuthStore((s) => s.status);
  const resetChat = useChatStore((s) => s.reset);
  const lastStatus = useRef(status);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (
      lastStatus.current === "authenticated" &&
      status === "guest"
    ) {
      resetChat();
    }
    lastStatus.current = status;
  }, [status, resetChat]);

  return (
    <div className="min-h-full h-full">
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <AuthGate>
            <ChatPage />
          </AuthGate>
        }
      />
      <Route
        path="/c/:id"
        element={
          <AuthGate>
            <ChatPage />
          </AuthGate>
        }
      />
      <Route
        path="/arena"
        element={
          <AuthGate>
            <ArenaPage />
          </AuthGate>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <AuthGate>
            <LeaderboardPage />
          </AuthGate>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/api-docs"
        element={
          <Navigate to="/api-docs" replace />
        }
      />
      <Route
        path="/api-docs"
        element={
          <ApiDocsPage />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
