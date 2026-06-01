import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Plus,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ScraperJob } from '../types';

interface DashboardHomeProps {
  jobs: ScraperJob[];
  onNavigateToTab: (tab: string) => void;
  onSelectJob: (job: ScraperJob) => void;
}

export default function DashboardHome({ jobs, onNavigateToTab, onSelectJob }: DashboardHomeProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch from live API backend!
  const fetchDashboardAndMetrics = async () => {
    try {
      const [dashRes, metricsRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/telemetry')
      ]);
      if (dashRes.ok) {
        const dData = await dashRes.json();
        setDashboardData(dData);
      }
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetricsData(mData);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardAndMetrics();
    // Poll every 5 seconds to keep counters, recent list, and logs fully synchronised in real-time!
    const interval = setInterval(fetchDashboardAndMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const summary = dashboardData?.summary || {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'running' || j.status === 'queued').length,
    successJobs: jobs.filter(j => j.status === 'completed').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    successRate: jobs.filter(j => j.status === 'completed').length > 0 
      ? ((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(1)
      : '0.0',
    totalScrapedCount: jobs.reduce((sum, j) => sum + (j.resultsCount || 0), 0)
  };

  const platformsData = dashboardData?.platforms || {
    twitter: jobs.filter(j => j.platform === 'twitter').length,
    instagram: jobs.filter(j => j.platform === 'instagram').length,
    linkedin: jobs.filter(j => j.platform === 'linkedin').length,
    youtube: jobs.filter(j => j.platform === 'youtube').length
  };

  const recentPipelines = dashboardData?.recentJobs || jobs;
  const activities = dashboardData?.activities || [];

  const totalPlatCount = Object.values(platformsData).reduce((a: any, b: any) => a + Number(b), 0) as number;
  const getPercentage = (p: string) => {
    if (totalPlatCount === 0) return 0;
    const value = (platformsData as any)[p] || 0;
    return Math.round((Number(value) / (totalPlatCount as number)) * 100);
  };

  const platformColors = {
    twitter: { text: 'text-sky-400', bg: 'bg-sky-500/10', bar: 'bg-sky-400' },
    instagram: { text: 'text-pink-500', bg: 'bg-pink-500/10', bar: 'bg-pink-500' },
    linkedin: { text: 'text-blue-500', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },
    youtube: { text: 'text-red-500', bg: 'bg-red-500/10', bar: 'bg-red-500' }
  };

  // Live timeline details pulled from metrics endpoint
  const rawTimeline = metricsData?.timeline || [];
  const chartDays = rawTimeline.map((t: any) => {
    try {
      const d = new Date(t.day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
      return t.day;
    }
  });

  const chartValues = rawTimeline.map((t: any) => t.total || 0);
  const maxChartVal = chartValues.length > 0 ? (Math.max(...chartValues, 10) || 10) : 10;

  // Render SVG coordinates
  const points = chartValues.map((val: number, xIdx: number) => {
    const x = (xIdx * (500 / Math.max(chartValues.length - 1, 1))).toFixed(1);
    const y = (200 - (val / maxChartVal) * 160).toFixed(1);
    return `${x},${y}`;
  });

  const pathDefinition = points.length > 0 
    ? `M 0,200 L ${points.join(' L ')} L 500,200 Z` 
    : 'M 0,200 L 500,200 Z';
  const lineDefinition = points.length > 0 
    ? `M ${points.join(' L ')}` 
    : 'M 0,200 L 500,200';

  return (
    <div className="space-y-6">
      
      {/* Upper overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Total Extractions</span>
            <Database className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white tracking-tight">{summary.totalJobs}</h4>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              Dynamic campaigns launched
            </p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Active Pipelines</span>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${summary.activeJobs > 0 ? 'bg-sky-400' : 'bg-gray-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${summary.activeJobs > 0 ? 'bg-sky-500' : 'bg-gray-500'}`} />
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white tracking-tight flex items-center gap-2">
              {summary.activeJobs}
              {summary.activeJobs > 0 && <Clock className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />}
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Active crawling threads executing
            </p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">SLA Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white tracking-tight">
              {String(summary.successRate).endsWith('%') ? summary.successRate : `${summary.successRate}%`}
            </h4>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Operational completions
            </p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Total Documents</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-semibold font-mono text-white tracking-tight">{summary.totalScrapedCount.toLocaleString()}</h4>
            <p className="text-xs text-sky-300 mt-1 font-medium">
              Total dynamic DB items stored
            </p>
          </div>
        </motion.div>
      </div>

      {/* Center Layout: Graph + Platform spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Graph module */}
        <div className="col-span-1 lg:col-span-8 p-6 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Extraction Yield (Past 7 Days)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Continuous data-volume harvested across all social domains.</p>
            </div>
            
            <span className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +{summary.totalScrapedCount.toLocaleString()} records total
            </span>
          </div>

          {/* Premium Custom Area SVG Chart */}
          <div className="relative w-full h-[220px] bg-slate-950/60 rounded-xl p-2 border border-gray-900/60 flex flex-col justify-between">
            
            {/* Absolute indicator values */}
            <div className="absolute top-2 right-4 text-[10px] font-mono text-gray-400 bg-gray-950/40 px-2 py-0.5 rounded border border-gray-800">
              Peak: <span className="text-indigo-400 font-bold">{Math.max(...chartValues, 0).toLocaleString()} doc/day</span>
            </div>

            {/* Responsive SVG */}
            <div className="w-full h-[170px] relative">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="yieldGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* Fill Area */}
                 <path d={pathDefinition} fill="url(#yieldGlow)" />

                {/* Stroke Line */}
                <path d={lineDefinition} fill="none" stroke="rgb(129, 140, 248)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Glow filter under line */}
                <path d={lineDefinition} fill="none" stroke="rgb(129, 140, 248)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.15" />

                {/* Interactive Points indicators */}
                {points.map((pt, ptIdx) => {
                  const [px, py] = pt.split(',');
                  return (
                    <g key={ptIdx} className="group/dot cursor-pointer">
                      <circle cx={px} cy={py} r="5" fill="#ffffff" stroke="rgb(79, 70, 229)" strokeWidth="2.5" />
                      <circle cx={px} cy={py} r="9" className="opacity-0 group-hover/dot:opacity-100 transition-opacity" fill="rgba(99, 102, 241, 0.2)" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-1.5 pt-2 text-[10px] font-semibold font-mono text-gray-500 border-t border-gray-900/60">
              {chartDays.map((day, dIdx) => (
                <div key={dIdx} className="flex flex-col items-center">
                  <span>{day}</span>
                  <span className="text-[9px] text-[#818cf8] font-normal font-mono">{Number(chartValues[dIdx] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="col-span-1 lg:col-span-4 p-6 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Platform Density</h3>
            <p className="text-xs text-gray-400 mt-0.5">Relative yield breakdown across API scopes.</p>
          </div>

          <div className="space-y-4 my-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  Twitter / X
                </span>
                <span className="font-mono text-gray-400">{getPercentage('twitter')}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-450 h-full rounded-full" style={{ width: `${getPercentage('twitter')}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  Instagram
                </span>
                <span className="font-mono text-gray-400">{getPercentage('instagram')}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: `${getPercentage('instagram')}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  LinkedIn
                </span>
                <span className="font-mono text-gray-400">{getPercentage('linkedin')}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getPercentage('linkedin')}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  YouTube
                </span>
                <span className="font-mono text-gray-400">{getPercentage('youtube')}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${getPercentage('youtube')}%` }} />
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigateToTab('analytics')}
            className="w-full py-2.5 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/40 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1"
          >
            Open Analytics Suite <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lower section: Recent jobs + Interactive Logs console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Jobs Panel */}
        <div className="col-span-1 lg:col-span-8 p-6 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Harvesting Pipelines</h3>
              <p className="text-xs text-gray-400 mt-0.5">Quickly view logs, execution specs, and extracted datasets.</p>
            </div>
            
            <button 
              onClick={() => onNavigateToTab('jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
            >
              See all jobs
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 font-mono">
                  <th className="pb-3 font-semibold">Target Domain</th>
                  <th className="pb-3 font-semibold">Platform</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Volume</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {recentPipelines.slice(0, 4).map((job: ScraperJob) => (
                  <tr key={job.id} className="hover:bg-gray-900/20 group">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-xs group-hover:text-indigo-300 transition-colors">{job.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono lowercase truncate max-w-[150px]">{job.target} · {job.type}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="capitalize text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono bg-gray-900 border border-gray-800">
                        {job.platform}
                      </span>
                    </td>
                    <td className="py-3">
                      {job.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      )}
                      {job.status === 'running' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          <Clock className="w-3 h-3 animate-spin" />
                          Crawling ({job.progress}%)
                        </span>
                      )}
                      {job.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {job.status === 'queued' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Queued
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-gray-400 font-medium">
                      {job.resultsCount > 0 ? `${job.resultsCount} docs` : '—'}
                    </td>
                    <td className="py-3 font-mono text-gray-400">
                      {job.duration > 0 ? `${job.duration}s` : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => onSelectJob(job)}
                        className="p-1 px-2.5 text-[10px] border border-gray-800 hover:border-gray-700 bg-gray-950 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-white transition-all flex items-center justify-center ml-auto gap-0.5"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Logs Monitor */}
        <div className="col-span-1 lg:col-span-4 p-6 rounded-xl border border-gray-800 bg-gray-950/40 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">System Signal Ticker</h3>
            <p className="text-xs text-gray-400 mt-0.5">Rotational proxy gateways & worker event logs.</p>
          </div>

          <div className="mt-4 flex-1 bg-black/60 rounded-xl border border-gray-900 p-4 font-mono text-[10px] text-gray-400 leading-relaxed overflow-y-auto h-[180px] flex flex-col justify-end space-y-1.5">
            {activities.length > 0 ? (
              [...activities].reverse().slice(-6).map((act: any) => {
                const time = new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                let colorClass = 'text-gray-400';
                if (act.action.includes('CREATE') || act.action.includes('SUBMIT') || act.action.includes('START')) colorClass = 'text-sky-400';
                if (act.action.includes('COMPLETE') || act.action.includes('SUCCESS')) colorClass = 'text-emerald-400';
                if (act.action.includes('FAIL') || act.action.includes('ERROR')) colorClass = 'text-red-400';
                if (act.action.includes('DELETE') || act.action.includes('CANCEL')) colorClass = 'text-amber-400';
                return (
                  <div key={act.id} className={`${colorClass} truncate`}>
                    <span className="text-gray-600">[{time}]</span> [{act.action}] {act.details}
                  </div>
                );
              })
            ) : (
              <>
                <div className="text-gray-600">[GATEWAY-POOL] refreshed 15 residential proxies...</div>
                <div className="text-gray-500">[WORKER-THREAD] hot standby nodes rotating and active.</div>
              </>
            )}
            <div className="text-emerald-400 flex items-center gap-1 font-semibold animate-pulse mt-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              [DAEMON-SYSTEM] healthy. 0.04s proxy latency.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              Sync: Auto Cloud Live
            </span>
            <span className="font-mono">Nodes: {activities.length > 0 ? 12 : 6} Online</span>
          </div>
        </div>

      </div>

    </div>
  );
}
