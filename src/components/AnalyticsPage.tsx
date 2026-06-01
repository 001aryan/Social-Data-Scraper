import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  X, 
  HelpCircle, 
  Cpu, 
  Sparkles, 
  Globe, 
  Zap,
  ArrowRight,
  Database,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function AnalyticsPage() {
  const [activeMetricTab, setActiveMetricTab] = useState<'volume' | 'speed' | 'success'>('volume');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [dashRes, metricsRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/telemetry')
      ]);
      if (dashRes.ok) {
        setDashboardData(await dashRes.json());
      }
      if (metricsRes.ok) {
        setMetricsData(await metricsRes.json());
      }
    } catch (err) {
      console.error('Failed to load real telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Synchronizing telemetry parameters...</span>
      </div>
    );
  }

  // Set real variables fetched from backend DB stats
  const summary = dashboardData?.summary || {
    totalJobs: 0,
    activeJobs: 0,
    successJobs: 0,
    failedJobs: 0,
    successRate: '100%',
    dataScraped: '0 MB',
    totalScrapedCount: 0
  };

  const rawTimeline = metricsData?.timeline || [];
  
  // Real coordinates from timeline
  const realVolumePoints = rawTimeline.map((item: any) => item.scrapedCount || 0);
  const realDays = rawTimeline.map((item: any) => {
    try {
      const d = new Date(item.day);
      return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    } catch {
      return item.day;
    }
  });

  // Latency points calculation: sum of durations divided by completed jobs.
  const realLatencyPoints = rawTimeline.map((item: any) => {
    if (item.completed === 0) return 0;
    return Math.round((item.durationSum / item.completed) * 100); // normalized value
  });

  // Success rate points: finished / total or 100%
  const realSuccessPoints = rawTimeline.map((item: any) => {
    if (item.total === 0) return 100;
    return parseFloat(((item.completed / item.total) * 100).toFixed(1));
  });

  // Fallbacks: If no real timeline is loaded yet, return arrays of zeros
  const timelineVolume = realVolumePoints.length > 0 ? realVolumePoints : [0, 0, 0, 0, 0, 0, 0];
  const timelineLatency = realLatencyPoints.length > 0 ? realLatencyPoints : [0, 0, 0, 0, 0, 0, 0];
  const timelineSuccess = realSuccessPoints.length > 0 ? realSuccessPoints : [100, 100, 100, 100, 100, 100, 100];
  const daysLabels = realDays.length > 0 ? realDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const analyticsDataMap = {
    volume: {
      title: 'Scraped Data Volume Timeline',
      desc: 'Sum of compiled posts extracted daily from active jobs',
      yLabel: 'Records',
      points: timelineVolume,
      days: daysLabels,
      color: 'rgb(99, 102, 241)',
      gradientGlow: 'yieldGlowVol',
      maxVal: Math.max(...timelineVolume, 10)
    },
    speed: {
      title: 'Headless Crawler Response Speed',
      desc: 'Average execution parser duration of completed scrapes',
      yLabel: 'Latency (duration units)',
      points: timelineLatency,
      days: daysLabels,
      color: 'rgb(56, 189, 248)',
      gradientGlow: 'yieldGlowSpd',
      maxVal: Math.max(...timelineLatency, 10)
    },
    success: {
      title: 'SLA Proxy Success Ratios',
      desc: 'Successful thread handshakes without blocked WAF or captcha events',
      yLabel: 'Success Rate (%)',
      points: timelineSuccess,
      days: daysLabels,
      color: 'rgb(52, 211, 153)',
      gradientGlow: 'yieldGlowSucc',
      maxVal: Math.max(...timelineSuccess, 100)
    }
  };

  const selectedData = analyticsDataMap[activeMetricTab];

  // Map coordinates to SVG dimensions dynamically
  const svgWidth = 500;
  const svgHeight = 220;
  const graphPoints = selectedData.points.map((val, idx) => {
    const x = (idx * (svgWidth / (selectedData.points.length - 1))).toFixed(1);
    const y = (svgHeight - (val / selectedData.maxVal) * (svgHeight - 40)).toFixed(1);
    return `${x},${y}`;
  });

  const pathDef = `M 0,${svgHeight} L ${graphPoints.join(' L ')} L ${svgWidth},${svgHeight} Z`;
  const lineDef = `M ${graphPoints.join(' L ')}`;

  // Real connection keys detection
  const connectionKeys = dashboardData?.apiConnections || {
    youtube: false,
    twitter: false,
    scrapingbee: false
  };

  const isScrapingBeeConnected = connectionKeys.scrapingbee;
  const isYouTubeConnected = connectionKeys.youtube;
  const isTwitterConnected = connectionKeys.twitter;

  // Platform performance comparison lists
  const platformComparisons = [
    { 
      name: 'Twitter / X API Engine', 
      capacity: 'Dynamic User Profiles, Keywords Scraper', 
      status: isTwitterConnected ? 'Connected' : 'Local Sandbox Mode (No Key)', 
      connected: isTwitterConnected, 
      color: 'bg-sky-400' 
    },
    { 
      name: 'YouTube Search Crawler', 
      capacity: 'Direct channel list, playlists, keyword threads', 
      status: isYouTubeConnected ? 'Connected' : 'Local Sandbox Mode (No Key)', 
      connected: isYouTubeConnected, 
      color: 'bg-red-500' 
    },
    { 
      name: 'Instagram Proxy Scraper', 
      capacity: 'ScrapingBee premium residential proxies pool', 
      status: isScrapingBeeConnected ? 'Connected' : 'Local Sandbox Mode (No Key)', 
      connected: isScrapingBeeConnected, 
      color: 'bg-pink-500' 
    },
    { 
      name: 'LinkedIn Profile Scraper', 
      capacity: 'ScrapingBee headless cookie pools scraper', 
      status: isScrapingBeeConnected ? 'Connected' : 'Local Sandbox Mode (No Key)', 
      connected: isScrapingBeeConnected, 
      color: 'bg-blue-500' 
    }
  ];

  const totalConnections = Object.values(connectionKeys).filter(Boolean).length;

  return (
    <div className="space-y-6">
      
      {/* Upper informational summary header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Database & Telemetry Analytics Suite</h1>
          <p className="text-xs text-gray-400">Deep telemetry and SLA reporting metrics derived from live SQLite collections.</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] px-3.5 py-1 text-gray-400 bg-gray-950 border border-gray-800 rounded-xl">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          Active Extractor Status: <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      {/* KPI Selection Metric Modules based entirely on real data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 - Real DB scraped count */}
        <button 
          onClick={() => setActiveMetricTab('volume')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${activeMetricTab === 'volume' ? 'border-indigo-500 bg-indigo-500/5 shadow-md' : 'border-gray-800 bg-gray-950/20 hover:border-gray-700'}`}
        >
          <div className="flex justify-between items-center text-gray-500 text-xs font-mono font-bold uppercase tracking-wider">
            Total Scraped Volume
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white">
              {summary.totalScrapedCount.toLocaleString()} {summary.totalScrapedCount === 1 ? 'doc' : 'docs'}
            </h4>
            <span className="block text-[11px] text-indigo-300 mt-1">Authentic cached records in database</span>
          </div>
        </button>

        {/* KPI 2 - Real API configuration list */}
        <button 
          onClick={() => setActiveMetricTab('speed')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${activeMetricTab === 'speed' ? 'border-sky-500 bg-sky-500/5 shadow-md' : 'border-gray-800 bg-gray-950/20 hover:border-gray-700'}`}
        >
          <div className="flex justify-between items-center text-gray-500 text-xs font-mono font-bold uppercase tracking-wider">
            Integration Credentials
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white">
              {totalConnections} / 3 Connected
            </h4>
            <span className="block text-[11px] text-sky-300 mt-1">Live external social network keys</span>
          </div>
        </button>

        {/* KPI 3 - Real Database Jobs Success rate */}
        <button 
          onClick={() => setActiveMetricTab('success')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${activeMetricTab === 'success' ? 'border-emerald-500 bg-emerald-500/5 shadow-md' : 'border-gray-800 bg-gray-950/20 hover:border-gray-700'}`}
        >
          <div className="flex justify-between items-center text-gray-500 text-xs font-mono font-bold uppercase tracking-wider">
            SLA Success Ratio
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white">
              {summary.successRate}
            </h4>
            <span className="block text-[11px] text-emerald-300 mt-1">Completed without network failures</span>
          </div>
        </button>
      </div>

      {/* Main active telemetry Area Timeline */}
      <div className="p-6 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">{selectedData.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{selectedData.desc}</p>
          </div>

          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 bg-gray-900 text-gray-400 rounded border border-gray-800">
            {selectedData.yLabel} Axis
          </span>
        </div>

        {/* Dynamic Glowing Vector graphics */}
        <div className="relative w-full bg-slate-950/65 rounded-xl p-3 border border-gray-900 h-[240px] flex flex-col justify-between">
          
          <div className="w-full h-[190px] relative">
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="yieldGlowVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="yieldGlowSpd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="yieldGlowSucc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Horizontal guidelines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#161e2e" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#161e2e" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#161e2e" strokeWidth="1" strokeDasharray="4 4" />

              {/* The area slice block */}
              <path d={pathDef} fill={`url(#${selectedData.gradientGlow})`} />

              {/* Glowing outline path */}
              <path d={lineDef} fill="none" stroke={selectedData.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Bottom timeline days */}
          <div className="flex justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-gray-900 px-1.5 font-semibold">
            {selectedData.days.map((day, dIdx) => (
              <div key={dIdx} className="flex flex-col items-center">
                <span>{day}</span>
                <span className="text-[10px] mt-0.5 text-gray-400 font-mono font-normal">
                  {activeMetricTab === 'volume' && `${Number(selectedData.points[dIdx]).toLocaleString()}`}
                  {activeMetricTab === 'speed' && `${selectedData.points[dIdx]} units`}
                  {activeMetricTab === 'success' && `${selectedData.points[dIdx]}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Platform Comparative stats and Node health gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* comparative bar lists */}
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-950/40">
          <h3 className="text-sm font-semibold text-white mb-2">Social Network Integrations status</h3>
          <p className="text-xs text-gray-400 mb-6">Configure keys inside the environment variables settings to activate live streams.</p>
          
          <div className="space-y-4">
            {platformComparisons.map((plat, pIdx) => (
              <div key={pIdx} className="space-y-2 p-3 bg-black/30 border border-gray-900 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-300 font-semibold">{plat.name}</span>
                    <span className="text-gray-500 text-[10px]">{plat.capacity}</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${plat.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                    {plat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Diagnostics Summary with real statuses */}
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-950/40 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Proxy Pool Diagnostics</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time gateway connectivity status.</p>
          </div>

          <div className="my-5 grid grid-cols-1 gap-3">
            <div className={`p-4 rounded-xl border font-mono flex items-center justify-between ${isScrapingBeeConnected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <div className="flex items-center gap-2.5">
                <Globe className={`w-4 h-4 ${isScrapingBeeConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Residential Exit IPs</span>
                  <span className="text-sm text-white font-bold block">
                    {isScrapingBeeConnected ? 'ScrapingBee Smart Proxy Cluster' : 'Cloud Sandbox Fallback'}
                  </span>
                </div>
              </div>
              
              {isScrapingBeeConnected ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="w-4 h-4" />
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Sandbox
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-gray-900 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase block">Local Queue Worker</span>
                <span className="text-sm text-indigo-400 font-bold block mt-1">Hot Standby Daemon</span>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-semibold">Active</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#090d16]/30 border border-gray-800/80 rounded-xl text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-450 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Smart Proxy Fallback:</strong> If keys are missing, the sandbox runs locally on our cloud sandbox simulator. Connect a <code>SCRAPINGBEE_API_KEY</code> to enable real bypass logic.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
