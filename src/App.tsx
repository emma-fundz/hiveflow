import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { lazy, Suspense } from "react";
import { PrefsProvider } from "./context/PrefsContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const Events = lazy(() => import("./pages/Events"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Files = lazy(() => import("./pages/Files"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const Features = lazy(() => import("./pages/Features"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const Splash = lazy(() => import("./pages/Splash"));
const JoinWorkspace = lazy(() => import("./pages/JoinWorkspace"));
const PublicAnnouncement = lazy(() => import("./pages/PublicAnnouncement"));

const queryClient = new QueryClient();

// Loading component for suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo animate-pulse"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PrefsProvider>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                  <Route path="/join/:token" element={<JoinWorkspace />} />
                  <Route path="/announcement/:token" element={<PublicAnnouncement />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/features" element={<Features />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/splash" element={<Splash />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/files" element={<Files />} />
                    <Route path="/stats" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* Catch-all 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </PrefsProvider>
  </QueryClientProvider>
);

export default App;
