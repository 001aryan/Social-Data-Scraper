import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Shield, 
  Zap, 
  Play, 
  Layers, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Terminal, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ChevronRight,
  Sliders,
  TrendingUp,
  Info
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (viewDemo: boolean) => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  // Dark obsidian cosmic dashboard styling
  const pageContainerStyle = {
    minHeight: '100vh',
    backgroundColor: '#030303',
    color: '#e2e8f0',
  };

  return (
    <div id="landing-page" className="relative overflow-x-hidden font-sans select-none" style={pageContainerStyle}>
      
      {/* Dark background grids of telemetry console */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Persistent Navigation Bar - Cosmic Minimal */}
      <nav className="sticky top-0 z-50 border-b border-gray-900 bg-black/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onEnterApp(false)}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <Database className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm block">Social Scraper</span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-400 font-semibold block">v2.8 Active</span>
            </div>
          </div>

          {/* Links & Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#capabilities" className="px-3.5 py-1.5 text-xs text-gray-400 font-semibold hover:text-white transition-colors">Platform Capabilities</a>
            <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1 uppercase">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Network Operational
            </span>
          </div>

          {/* Action Callouts */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => onEnterApp(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 border border-gray-850 hover:border-gray-800 hover:text-white transition-all bg-gray-950/20"
            >
              Demo Walkthrough
            </button>
            <button 
              onClick={() => onEnterApp(false)}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 transform active:scale-95 shadow-lg shadow-indigo-950/20"
            >
              Enter Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header Space */}
      <section className="relative pt-20 pb-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
        
        {/* Floating Intro Pill */}
        <div 
          onClick={() => onEnterApp(false)} 
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-mono tracking-wide font-semibold text-indigo-400 mb-6 cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Active Stealth Proxy Scraper Network v2.8</span>
          <ChevronRight className="w-3 h-3 text-indigo-400" />
        </div>

        {/* Main Display Typography */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-5 max-w-4xl mx-auto font-display">
          Autonomous Social Intelligence <br />
          <span className="bg-gradient-to-r from-gray-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Scraper Engine & Analyzer
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Robust, high-capacity headless scrapers harvesting public sentiment records safely. Extract, compile, and stream target social metrics straight to local databases and synchronized dashboards.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-12">
          <button 
            onClick={() => onEnterApp(false)}
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:shadow-indigo-900/10 transition-all flex items-center justify-center gap-1.5 transform active:scale-98 cursor-pointer"
          >
            Launch Extraction Hub
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={() => onEnterApp(true)}
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-lg border border-gray-800 hover:border-gray-750 text-gray-300 hover:text-white hover:bg-gray-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gray-950/20"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            Walkthrough Guided Tour
          </button>
        </div>
      </section>

      {/* Platform Capabilities Grid */}
      <section id="capabilities" className="py-16 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative border-t border-gray-900/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/15">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-display">Supported Network Connectors</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
            Target specific public pipelines, setup search depth parameters, and schedule automatic execution cycles securely.
          </p>
        </div>

        {/* Four Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Twitter */}
          <div className="p-5 rounded-xl border border-gray-850 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between group transition-all duration-200 hover:border-gray-800 hover:translate-y-[-2px]">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5">
                <Twitter className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Twitter / X Scraper</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Extract posts, engagement counts, replies, profiles, and hashtag sentiment trends dynamically.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">120 records/min</span>
              <span className="text-[9px] font-bold font-mono text-sky-400 bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10">Active Node</span>
            </div>
          </div>

          {/* Card 2: Instagram */}
          <div className="p-5 rounded-xl border border-gray-850 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between group transition-all duration-200 hover:border-gray-800 hover:translate-y-[-2px]">
            <div>
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5">
                <Instagram className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Instagram Scraper</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Analyze media metadata, post captions, hashtag indexes, comments depth, and user engagement parameters.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">85 records/min</span>
              <span className="text-[9px] font-bold font-mono text-pink-400 bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10">Active Node</span>
            </div>
          </div>

          {/* Card 3: LinkedIn */}
          <div className="p-5 rounded-xl border border-gray-850 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between group transition-all duration-200 hover:border-gray-800 hover:translate-y-[-2px]">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <Linkedin className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">LinkedIn Scraper</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Gather public corporate portfolios, headcount benchmarks, open job listings, and published posts.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">45 entries/min</span>
              <span className="text-[9px] font-bold font-mono text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">Active Node</span>
            </div>
          </div>

          {/* Card 4: YouTube */}
          <div className="p-5 rounded-xl border border-gray-850 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between group transition-all duration-200 hover:border-gray-800 hover:translate-y-[-2px]">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">YouTube Scraper</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Index channel transcripts, video metadata descriptions, comment directories, and audience view velocity.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">150 videos/min</span>
              <span className="text-[9px] font-bold font-mono text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">Active Node</span>
            </div>
          </div>

        </div>
      </section>



      {/* Cosmic dark Footer */}
      <footer className="pt-16 pb-10 border-t border-gray-900 bg-black/60 text-gray-400 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Database className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm">Social Scraper</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Robust data collection structures, rotating residence IPs, and instant Google Spreadsheet sync pipelines.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 font-mono">Product</h4>
            <div className="space-y-2 text-xs">
              <span onClick={() => onEnterApp(false)} className="block hover:text-white cursor-pointer transition-colors">Workspace API</span>
              <span onClick={() => onEnterApp(true)} className="block hover:text-white cursor-pointer transition-colors">Client Tour Overview</span>
              <span className="block text-[10px] text-gray-600 font-mono">Applet Version 2.8</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 font-mono">Proxy Service</h4>
            <div className="space-y-2 text-xs">
              <span className="block">Rotating IP Network</span>
              <span className="block">Anti-Bot Residency IP</span>
              <span className="block">Dynamic Captcha Solver</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 font-mono">Legal & Core</h4>
            <div className="space-y-2 text-xs">
              <span className="block hover:text-white cursor-pointer transition-colors">Security Protocol</span>
              <span className="block hover:text-white cursor-pointer transition-colors">System Terms</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-gray-500">
          <span>&copy; {new Date().getFullYear()} Social Scraper Inc. Structured Telemetry Dashboard.</span>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer text-indigo-400">Gateway operational status OK</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
