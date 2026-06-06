import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { Logo } from "./components/Logo";
import { getProfile } from "./services/api";
import { useAppStore } from "./store/useAppStore";

const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));
const Analytics = lazy(() => import("./pages/Analytics").then((module) => ({ default: module.Analytics })));
const Assistant = lazy(() => import("./pages/Assistant").then((module) => ({ default: module.Assistant })));
const Auth = lazy(() => import("./pages/Auth").then((module) => ({ default: module.Auth })));
const Contact = lazy(() => import("./pages/Contact").then((module) => ({ default: module.Contact })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Dataset = lazy(() => import("./pages/Dataset").then((module) => ({ default: module.Dataset })));
const DetectDisease = lazy(() => import("./pages/DetectDisease").then((module) => ({ default: module.DetectDisease })));
const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Model = lazy(() => import("./pages/Model").then((module) => ({ default: module.Model })));
const AssistantHistory = lazy(() => import("./pages/AssistantHistory").then((module) => ({ default: module.AssistantHistory })));
const MyAnalytics = lazy(() => import("./pages/MyAnalytics").then((module) => ({ default: module.MyAnalytics })));
const MyDiagnoses = lazy(() => import("./pages/MyDiagnoses").then((module) => ({ default: module.MyDiagnoses })));
const MyReports = lazy(() => import("./pages/MyReports").then((module) => ({ default: module.MyReports })));
const Profile = lazy(() => import("./pages/Profile").then((module) => ({ default: module.Profile })));
const Research = lazy(() => import("./pages/Research").then((module) => ({ default: module.Research })));
const Result = lazy(() => import("./pages/Result").then((module) => ({ default: module.Result })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));
const Team = lazy(() => import("./pages/Team").then((module) => ({ default: module.Team })));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const location = useLocation();
  const [checking, setChecking] = useState(Boolean(localStorage.getItem("leafsense-access-token")) && !user);

  useEffect(() => {
    const token = localStorage.getItem("leafsense-access-token");
    if (!token || user) {
      setChecking(false);
      return;
    }
    let active = true;
    getProfile()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem("leafsense-access-token");
        localStorage.removeItem("leafsense-refresh-token");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [setUser, user]);

  if (checking) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Logo className="animate-pulse" imageClassName="h-16 w-16 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center">
            <Logo className="animate-pulse" imageClassName="h-16 w-16 rounded-3xl" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<ProtectedRoute><DetectDisease /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dataset" element={<ProtectedRoute><Dataset /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/model" element={<ProtectedRoute><Model /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-diagnoses" element={<ProtectedRoute><MyDiagnoses /></ProtectedRoute>} />
          <Route path="/my-analytics" element={<ProtectedRoute><MyAnalytics /></ProtectedRoute>} />
          <Route path="/assistant-history" element={<ProtectedRoute><AssistantHistory /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/dataset" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/system" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </PageShell>
  );
}
