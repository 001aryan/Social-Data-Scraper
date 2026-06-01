import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Plus, 
  Activity, 
  Terminal, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  Grid,
  ChevronDown,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

import { TourStep, ScraperJob, ToastMessage } from './types';
import { INITIAL_JOBS } from './utils/mockData';

// Subcomponents
import LandingPage from './components/LandingPage';
import DashboardHome from './components/DashboardHome';
import NewJobScreen from './components/NewJobScreen';
import JobManagement from './components/JobManagement';
import AnalyticsPage from './components/AnalyticsPage';
import ResultsViewerTab from './components/ResultsViewerTab';
import SettingsPage from './components/SettingsPage';
import TourOverlay from './components/TourOverlay';

const TOUR_STEPS: TourStep[] = [
  {
    tab: 'dashboard',
    title: '1. Dashboard Home',
    badge: 'Main Control Room',
    description: 'This is the main dashboard of the site. It offers quick visual statistics, active proxy monitors, and action shortcuts to get rolling.',
    features: [
      'Overview indicators: matched target endpoints, filtered captions, total collected records',
      'Continuous stream from active proxy feeds showing simulated output data on-screen',
      'Instant templates launcher buttons'
    ]
  },
  {
    tab: 'new',
    title: '2. Launch Spider Job',
    badge: 'Campaign Builder',
    description: 'Establish search depth, targeting configurations, proxy limits, and recurring execution schedules.',
    features: [
      'Target any major social network: Twitter, Instagram, LinkedIn, YouTube',
      'Target type options: search keywords, target user profiles, post urls, sub-comments',
      'Stealth anti-bot residency rotation toggles & scheduled Cron setup fields'
    ]
  },
  {
    tab: 'jobs',
    title: '3. Job Directory',
    badge: 'Operations Console',
    description: 'Command and manage active crawler processes. Pause, resume, or destroy running spiders, and trace operational logs.',
    features: [
      'Interactive control switches: pause, resume, recreate, or purge scraper jobs',
      'Live node console lines streaming active crawler handshake feedback',
      'Filterable list showing individual proxy exit headers, speed metrics, and failures'
    ]
  },
  {
    tab: 'analytics',
    title: '4. Telemetry Analytics',
    badge: 'Network Diagnostics',
    description: 'A dedicated diagnostics workspace highlighting the speed, network efficiency, and health status of rotating crawlers.',
    features: [
      'High-resolution charts plotting response speeds and proxy latencies over time',
      'Crawlers speed velocity indicator (scraped records count per minute)',
      'A responsive geographic world map showing active proxy routing locations'
    ]
  },
  {
    tab: 'exports',
    title: '5. Results Hub',
    badge: 'Data Exporters',
    description: 'Inspect captured JSON lines, search for keyword occurrences, and compile clean CSV spreadsheets.',
    features: [
      'Tabular dataset previews listing usernames, matching texts, dates, and likes',
      'Downloadable results containing compiled CSV spreadsheets or nested raw JSON scripts',
      'Google Sheets synchronization toggle and Webhook transmission indicators'
    ]
  },
  {
    tab: 'settings',
    title: '6. System Settings & Sinks',
    badge: 'Integrations Panel',
    description: 'Configure automated background pipelines. Toggle audio alarms, Slack notification cards, and third-party API keys.',
    features: [
      'Automated Slack channels webhook messages and browser sound triggers',
      'Google Sheets Automatic Sink synchronization hook',
      'External API platform connector fields (Notion database integrations, Webhawks core)'
    ]
  }
];

export default function App() {
  const [onLanding, setOnLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new' | 'jobs' | 'analytics' | 'exports' | 'settings'>('dashboard');
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScraperJob | null>(null);

  // Synchronise actual jobs catalog from database
  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to query catalog index:', err);
    }
  };

  useEffect(() => {
    if (!onLanding) {
      loadJobs();
    }
  }, [onLanding]);

  // Handle live status changes via periodic polling when there are active/pending scans
  useEffect(() => {
    if (onLanding) return;
    const activeRunning = jobs.some(j => j.status === 'running' || j.status === 'queued');
    
    // Check every 3 seconds for fast update responsive feel
    const interval = setInterval(loadJobs, 2500);
    return () => clearInterval(interval);
  }, [jobs, onLanding]);

  // Guided demo tour states
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Sidebar state responsive mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Notification toggle
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', text: 'AI Hashtag scrape completed successfully', read: false },
    { id: 'n2', text: 'SLA Proxy handshake rotated: USA -> DEU', read: true }
  ]);

  // User profile dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Dynamic state list toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const nextToast: ToastMessage = {
      id: `toast-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      type
    };

    setToasts(prev => [...prev, nextToast]);

    // Cleanup self after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== nextToast.id));
    }, 4500);
  };

  const handleAddJob = (newJob: ScraperJob) => {
    // Already submitted to database. Pull latest to synchronize nicely.
    loadJobs();
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        showToast('Wipe Completed', 'Scraper metadata and caches deleted from storage.', 'success');
        if (selectedJob?.id === id) {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      console.error('Failed to perform REST DELETE:', err);
    }
  };

  const handleDeleteMultipleJobs = async (ids: string[]) => {
    try {
      const promises = ids.map(id => fetch(`/api/jobs/${id}`, { method: 'DELETE' }));
      await Promise.all(promises);
      setJobs(prev => prev.filter(j => !ids.includes(j.id)));
      showToast('Wipe Completed', 'Batch files deleted from DB storage successfully.', 'success');
      if (selectedJob && ids.includes(selectedJob.id)) {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Failed to bulk delete jobs:', err);
    }
  };

  const handleSelectJob = (job: ScraperJob) => {
    setSelectedJob(job);
    setActiveTab('jobs'); // Inspect switches tab smoothly
  };

  const handleEnterApp = (viewDemo: boolean) => {
    setOnLanding(false);
    if (viewDemo) {
      setActiveTab('dashboard'); // Start on dashboard for general walkthrough
      setShowDemoTour(true);
      setTourStep(0);
      showToast(
        'Interactive Demo Tour Activated',
        'Learn what each function of the site is by navigating the floating tour card below.',
        'info'
      );
    } else {
      setActiveTab('dashboard');
      setShowDemoTour(false);
      showToast(
        'System Initialized',
        'Headless crawling proxy nodes initialized.',
        'success'
      );
    }
  };

  const handleTourNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      const nextTab = TOUR_STEPS[nextStep].tab;
      if (nextTab) {
        setActiveTab(nextTab);
      }
    } else {
      setShowDemoTour(false);
      showToast(
        'Tour Completed!',
        'You have successfully completed the overview of all SaaS functions.',
        'success'
      );
    }
  };

  const handleTourBack = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      const prevTab = TOUR_STEPS[prevStep].tab;
      if (prevTab) {
        setActiveTab(prevTab);
      }
    }
  };

  const handleTourSkip = () => {
    setShowDemoTour(false);
    showToast(
      'Demo Guide Dismissed',
      'You are now free to explore the full dashboard on your own.',
      'info'
    );
  };

  const handleTabSelect = (tab: 'dashboard' | 'new' | 'jobs' | 'analytics' | 'exports' | 'settings') => {
    setActiveTab(tab);
    if (showDemoTour) {
      const idx = TOUR_STEPS.findIndex(step => step.tab === tab);
      if (idx !== -1) {
        setTourStep(idx);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans text-gray-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Toast Portal */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="p-4 bg-gray-950 border border-gray-850 rounded-xl shadow-2xl flex items-start gap-3 relative overflow-hidden"
            >
              {/* Left indicator glow */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-500" />

              <div className="mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex-1">
                <span className="block text-xs font-bold text-white font-sans">{t.title}</span>
                {t.description && (
                  <span className="block text-[10px] text-gray-400 mt-1 font-mono tracking-tight leading-snug">{t.description}</span>
                )}
              </div>

              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {onLanding ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onEnterApp={handleEnterApp} />
          </motion.div>
        ) : (
          /* Logged-In Full Dashboard UI Layout */
          <motion.div 
            key="dashboard-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen relative"
          >
            {/* Desktop persistent custom Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#09090b] justify-between z-40 relative">
              <div className="p-6">
                
                {/* Brand Header */}
                <div 
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => setOnLanding(true)}
                  title="View Landing Page"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white tracking-tight text-sm">Social Scraper</span>
                    <span className="block text-[9px] font-mono tracking-wider font-semibold uppercase text-indigo-400">v2.8 Active</span>
                  </div>
                </div>

                {/* Sidebar main navigation routes list */}
                <nav className="mt-8 space-y-1 text-xs">
                  <button 
                    onClick={() => handleTabSelect('dashboard')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'dashboard' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Grid className="w-4 h-4 text-indigo-400" />
                    Dashboard Home
                  </button>

                  <button 
                    onClick={() => handleTabSelect('new')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'new' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'new' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Plus className="w-4 h-4 text-sky-400" />
                    Launch Spider Job
                  </button>

                  <button 
                    onClick={() => handleTabSelect('jobs')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'jobs' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'jobs' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Job Directory
                  </button>

                  <button 
                    onClick={() => handleTabSelect('analytics')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'analytics' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'analytics' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Activity className="w-4 h-4 text-purple-400" />
                    Telemetry Analytics
                  </button>

                  <button 
                    onClick={() => handleTabSelect('exports')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'exports' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'exports' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Layers className="w-4 h-4 text-pink-400" />
                    Results Hub
                  </button>

                  <button 
                    onClick={() => handleTabSelect('settings')}
                    className={`nav-link w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'settings' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    System Settings
                  </button>
                </nav>
              </div>

              {/* Sidebar bottom Exit/Back button */}
              <div className="p-4 border-t border-white/5 bg-[#09090b]/80">
                <button
                  onClick={() => setOnLanding(true)}
                  className="w-full font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Exit to Main Page
                </button>
              </div>
            </aside>

            {/* Mobile Sidebar panel overlay content */}
            <AnimatePresence>
              {mobileSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <motion.aside 
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="w-64 border-r border-white/5 bg-[#09090b] flex flex-col justify-between h-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-indigo-500" />
                          <span className="font-bold text-white text-sm">Social Scraper</span>
                        </div>
                        <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded text-gray-500 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <nav className="mt-8 space-y-1.5 text-xs">
                        <button 
                          onClick={() => { handleTabSelect('dashboard'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'dashboard' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'dashboard' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Grid className="w-4 h-4 text-indigo-400" /> Dashboard Home
                        </button>
                        <button 
                          onClick={() => { handleTabSelect('new'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'new' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'new' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Plus className="w-4 h-4 text-sky-400" /> Launch Spider Job
                        </button>
                        <button 
                          onClick={() => { handleTabSelect('jobs'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'jobs' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'jobs' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Terminal className="w-4 h-4 text-emerald-400" /> Job Directory
                        </button>
                        <button 
                          onClick={() => { handleTabSelect('analytics'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'analytics' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'analytics' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Activity className="w-4 h-4 text-purple-400" /> Telemetry Analytics
                        </button>
                        <button 
                          onClick={() => { handleTabSelect('exports'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'exports' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'exports' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Layers className="w-4 h-4 text-pink-400" /> Results Hub
                        </button>
                        <button 
                          onClick={() => { handleTabSelect('settings'); setMobileSidebarOpen(false); }}
                          className={`w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 ${activeTab === 'settings' ? 'bg-gray-900 border border-gray-800 text-white' : 'text-gray-400'} ${showDemoTour && TOUR_STEPS[tourStep]?.tab === 'settings' ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500 bg-gray-900' : ''}`}
                        >
                          <Settings className="w-4 h-4 text-amber-400" /> System Settings
                        </button>
                      </nav>
                    </div>

                    {/* Mobile bottom Exit/Back button */}
                    <div className="p-4 border-t border-white/5 bg-[#09090b]">
                      <button
                        onClick={() => { setOnLanding(true); setMobileSidebarOpen(false); }}
                        className="w-full font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Exit to Main Page
                      </button>
                    </div>
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Central app viewport contents wrapper block */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              
              {/* Dynamic top responsive navigation bar header */}
              <header className="sticky top-0 z-35 backdrop-blur-md bg-[#030303]/80 h-16 border-b border-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  {/* Burger toggle */}
                  <button 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-1 px-2 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="hidden sm:block relative">
                    <span className="text-[10px] font-semibold text-gray-500 font-mono uppercase tracking-widest leading-none">Gateway thread</span>
                    <span className="block text-xs font-bold text-indigo-400 leading-tight">ACTIVE PROXY HUB</span>
                  </div>
                </div>

                {/* Right side interactions triggers settings */}
                <div className="flex items-center gap-3.5">
                  
                  {/* Locked mode banner */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold font-mono border border-gray-800 text-gray-400 bg-[#080d15]/50 rounded-lg">
                    <Sun className="w-3.5 h-3.5 text-indigo-400" />
                    Locked: Telemetry Dark Mode
                  </div>

                  {/* Notification toggle widget */}
                  <div className="relative">
                    <button 
                      onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); setUserDropdownOpen(false); }}
                      className={`p-2 border rounded-xl relative transition-all ${notifDropdownOpen ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-850 text-gray-400 hover:text-white hover:bg-gray-900/40'}`}
                    >
                      <Bell className="w-4 h-4" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>

                    {/* dropdown notification card */}
                    <AnimatePresence>
                      {notifDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-72 bg-gray-950 border border-gray-850 rounded-xl p-4 shadow-2xl space-y-3 z-50 text-xs"
                        >
                          <div className="flex justify-between items-center border-b border-gray-900 pb-1.5 font-mono text-[10px]">
                            <span className="text-gray-500 font-bold uppercase">System Alerts</span>
                            <button 
                              onClick={() => {
                                setNotifications(prev => prev.map(n => ({...n, read: true})));
                                showToast('Cleaned Alerts', 'All active alerts marked read successfully.', 'success');
                              }}
                              className="text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                              Clear
                            </button>
                          </div>
                          
                          <div className="space-y-2 max-h-40 overflow-y-auto font-sans text-gray-300">
                            {notifications.map(n => (
                              <div key={n.id} className={`p-2 rounded border border-transparent ${n.read ? 'text-gray-500' : 'bg-indigo-500/5 text-white border-indigo-500/10'}`}>
                                {n.text}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Profile trigger and menu completely removed */}

                </div>
              </header>

              {/* Central screen workspace fluid margins */}
              <main className="flex-grow p-6 max-w-7xl w-full mx-auto pb-16">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    {activeTab === 'dashboard' && (
                      <DashboardHome 
                        jobs={jobs} 
                        onNavigateToTab={(tab: string) => setActiveTab(tab as any)} 
                        onSelectJob={handleSelectJob}
                      />
                    )}

                    {activeTab === 'new' && (
                      <NewJobScreen 
                        onAddJob={handleAddJob}
                        onNavigateToTab={(tab: string) => setActiveTab(tab as any)}
                        showToast={showToast}
                      />
                    )}

                    {activeTab === 'jobs' && (
                      <JobManagement 
                        jobs={jobs}
                        selectedJob={selectedJob}
                        onSelectJob={(job) => setSelectedJob(job)}
                        onCloseDrawer={() => setSelectedJob(null)}
                        onDeleteJob={handleDeleteJob}
                        onDeleteMultipleJobs={handleDeleteMultipleJobs}
                        showToast={showToast}
                      />
                    )}

                    {activeTab === 'analytics' && (
                      <AnalyticsPage />
                    )}

                    {activeTab === 'exports' && (
                      <ResultsViewerTab 
                        jobs={jobs}
                        selectedJobId={selectedJob?.id || (jobs[0]?.id || null)}
                        onSelectJob={(job) => setSelectedJob(job)}
                        showToast={showToast}
                      />
                    )}

                    {activeTab === 'settings' && (
                      <SettingsPage showToast={showToast} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {showDemoTour && TOUR_STEPS[tourStep] && (
        <TourOverlay 
          currentStep={tourStep}
          totalSteps={TOUR_STEPS.length}
          stepData={TOUR_STEPS[tourStep]}
          onNext={handleTourNext}
          onBack={handleTourBack}
          onSkip={handleTourSkip}
        />
      )}

    </div>
  );
}
