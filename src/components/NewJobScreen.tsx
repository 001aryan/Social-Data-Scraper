import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { Platform, ScraperJob } from '../types';
import { PLATFORMS } from '../utils/mockData';

interface NewJobScreenProps {
  onAddJob: (job: ScraperJob) => void;
  onNavigateToTab: (tab: string) => void;
  showToast: (title: string, desc: string, type: 'success' | 'error') => void;
}

export default function NewJobScreen({ onAddJob, onNavigateToTab, showToast }: NewJobScreenProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter');
  const [target, setTarget] = useState('');
  const [type, setType] = useState('hashtag');
  const [limit, setLimit] = useState(100);
  const [jobName, setJobName] = useState('');

  // Scrape simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  // Reset type when platform changes
  useEffect(() => {
    const config = PLATFORMS[selectedPlatform];
    if (config && config.fields) {
      const typeField = config.fields.find(f => f.name === 'type');
      if (typeField && typeField.options) {
        setType(typeField.options[0]);
      }
    }
  }, [selectedPlatform]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!target.trim()) {
      newErrors.target = 'Target descriptor is required.';
    } else if (target.trim().length < 2) {
      newErrors.target = 'Target must be at least 2 characters.';
    }

    if (limit <= 0) {
      newErrors.limit = 'Search limit must be greater than zero.';
    } else if (limit > 5000) {
      newErrors.limit = 'Max concurrent limit is 5,000 for standard API.';
    }

    if (!jobName.trim()) {
      newErrors.jobName = 'Please enter a name to identify this job.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Validation Error', 'Please check the form configurations below.', 'error');
      return;
    }

    try {
      setIsSimulating(true);
      setSimProgress(5);
      setSimLogs([`[SYSTEM] Submitting spider scraping job to remote DB queue...`]);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: jobName,
          platform: selectedPlatform,
          type: type,
          target: target,
          limit: limit
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error creating scraper job record.');
      }

      const parsed = await response.json();
      const createdJob = parsed.job;
      
      setRunningJobId(createdJob.id);
      setSimLogs(prev => [...prev, `[SYSTEM] Job queued successfully with unique ID: ${createdJob.id}!`, `[SYSTEM] Spawning worker crawler thread...`]);
    } catch (err: any) {
      setIsSimulating(false);
      showToast('Launch Failure', err.message || 'Error occurred starting task.', 'error');
    }
  };

  // Run the premium polling mechanism directly synchronized to database queue
  useEffect(() => {
    if (!isSimulating || !runningJobId) return;

    let completedTriggered = false;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${runningJobId}`);
        if (!response.ok) return;

        const data = await response.json();
        const job = data.job;
        if (!job) return;

        setSimProgress(job.progress || 0);
        if (job.logs && job.logs.length > 0) {
          setSimLogs(job.logs.map((l: any) => l.message));
        }

        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          clearInterval(interval);
          if (!completedTriggered) {
            completedTriggered = true;
            setIsSimulating(false);
            setTarget('');
            setJobName('');
            onAddJob(job);
            showToast(
              job.status === 'completed' ? 'Extraction Complete' : 'Extraction Error',
              job.status === 'completed' 
                ? `Successfully crawled ${job.resultsCount} records tag "${job.target}".`
                : `Task ended with status: ${job.status}`,
              job.status === 'completed' ? 'success' : 'error'
            );
            onNavigateToTab('jobs');
          }
        }
      } catch (err) {
        console.error('Failure polling background scraper status:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, runningJobId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Go Back Header element */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToTab('home')}
            className="p-2 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/60 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Launch Scraper Spider</h1>
            <p className="text-xs text-gray-400">Assemble multi-threaded search spiders bypassing geo rate-limits.</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSimulating ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left selector cards */}
            <div className="md:col-span-12 space-y-3">
              <label className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider block">
                1. Select Target Social Platform
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(PLATFORMS).map((plat) => {
                  const isSelected = selectedPlatform === plat.id;
                  
                  return (
                    <button 
                      key={plat.id}
                      type="button"
                      onClick={() => setSelectedPlatform(plat.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${isSelected ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_4px_20px_rgba(79,70,229,0.1)]' : 'border-gray-800 bg-gray-950/30 hover:border-gray-700'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-400 group-hover:text-white transition-colors'}`}>
                          {plat.id === 'twitter' && <Twitter className="w-4 h-4" />}
                          {plat.id === 'instagram' && <Instagram className="w-4 h-4" />}
                          {plat.id === 'linkedin' && <Linkedin className="w-4 h-4" />}
                          {plat.id === 'youtube' && <Youtube className="w-4 h-4" />}
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>

                      <div className="mt-4">
                        <span className="block font-semibold text-xs sm:text-sm text-white">{plat.name}</span>
                        <span className="block text-[10px] text-gray-400 mt-1 truncate">{plat.avgSpeed}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right configuration input forms */}
            <div className="md:col-span-8 p-6 rounded-xl border border-gray-800 bg-[#090f19]/30 backdrop-blur-xl">
              <form onSubmit={handleLaunch} className="space-y-5">
                <span className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider block pb-2 border-b border-gray-800/60">
                  2. Parameter Specifications
                </span>

                {/* Job Nickname input */}
                <div className="relative group">
                  <input 
                    type="text" 
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-950 rounded-xl border focus:border-indigo-500 focus:outline-none text-xs text-white transition-all peer placeholder-transparent ${errors.jobName ? 'border-red-500/60' : 'border-gray-800'}`}
                    placeholder="Job Identification Name"
                    id="jobName"
                  />
                  <label 
                    htmlFor="jobName"
                    className="absolute left-3.5 top-0.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono transition-all transform -translate-y-2.5 scale-90 bg-[#070c14] px-1 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:top-0.5 peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-indigo-400 peer-focus:font-extrabold cursor-text"
                  >
                    Job Name Tag
                  </label>
                  {errors.jobName && (
                    <span className="text-[10px] text-red-400 block mt-1">{errors.jobName}</span>
                  )}
                </div>

                {/* Scraper Selector configuration dynamics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Select extraction mode */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 font-mono uppercase tracking-wider block">
                      Extraction Mode
                    </label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3.5 py-3 bg-gray-950 font-mono rounded-xl border border-gray-800 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none"
                    >
                      {PLATFORMS[selectedPlatform].fields.find(f => f.name === 'type')?.options?.map(opt => (
                        <option key={opt} value={opt} className="capitalize">{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Limit limit amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 font-mono uppercase tracking-wider block">
                      Target limits (Posts)
                    </label>
                    <input 
                      type="number" 
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                      className={`w-full px-3.5 py-3 font-mono bg-gray-950 rounded-xl border text-xs text-gray-300 focus:border-indigo-500 focus:outline-none ${errors.limit ? 'border-red-500/60' : 'border-gray-800'}`}
                      placeholder="e.g. 100"
                    />
                    {errors.limit && (
                      <span className="text-[10px] text-red-400 block mt-1">{errors.limit}</span>
                    )}
                  </div>

                </div>

                {/* Target keyword / link detail */}
                <div className="relative group pt-1">
                  <input 
                    type="text" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-950 rounded-xl border focus:border-indigo-500 focus:outline-none text-xs text-white transition-all peer placeholder-transparent ${errors.target ? 'border-red-500/60' : 'border-gray-800'}`}
                    placeholder={PLATFORMS[selectedPlatform].fields[0].placeholder}
                    id="target"
                  />
                  <label 
                    htmlFor="target"
                    className="absolute left-3.5 top-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono transition-all transform -translate-y-2.5 scale-90 bg-[#070c14] px-1 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:top-1.5 peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-indigo-400 peer-focus:font-extrabold cursor-text"
                  >
                    Target Target Value
                  </label>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 px-1">
                    {PLATFORMS[selectedPlatform].fields[0].placeholder}
                  </p>
                  {errors.target && (
                    <span className="text-[10px] text-red-400 block mt-1">{errors.target}</span>
                  )}
                </div>

                {/* Actions bottom submit button */}
                <div className="pt-4 flex items-center justify-between border-t border-gray-800/60">
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Proxy-Mesh protection auto-enabled
                  </span>

                  <button 
                    type="submit"
                    className="px-5 py-3 text-xs font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch Scraping Spider
                  </button>
                </div>

              </form>
            </div>

            {/* Platform statistics sidebar panel */}
            <div className="md:col-span-4 space-y-4">
              <div className="p-5 rounded-xl border border-gray-800 bg-gray-950/20">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">API Specifications</span>
                <div className="space-y-3.5 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Node Success Scope:</span>
                    <span className="text-emerald-400 font-mono font-semibold">{PLATFORMS[selectedPlatform].successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Average Rate Yield:</span>
                    <span className="text-white font-mono font-semibold">{PLATFORMS[selectedPlatform].avgSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">SLA Active Spiders:</span>
                    <span className="text-indigo-400 font-mono font-semibold">{PLATFORMS[selectedPlatform].activeJobs} active</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 my-4" />

                <div className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                  <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    To customize cookies or target company geofenced accounts, please configure setting auth keys in Settings tab.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Live animated simulation interface */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-xl border border-gray-800 bg-[#070b12] max-w-2xl mx-auto space-y-6 shadow-2xl relative"
          >
            <div className="absolute top-2 right-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Scraping In Action</span>
            </div>

            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              <div>
                <h3 className="text-sm font-semibold text-white">Spider Thread #sds-crawler-928</h3>
                <p className="text-xs text-gray-400">Targeting {PLATFORMS[selectedPlatform].name} · {target}</p>
              </div>
            </div>

            {/* Custom SVG telemetry indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 rounded-xl p-4 border border-gray-900/60 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Progress</span>
                <span className="text-base font-semibold text-white font-mono">{simProgress}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Est Speed</span>
                <span className="text-base font-semibold text-sky-400 font-mono">{PLATFORMS[selectedPlatform].avgSpeed}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Proxies Rotated</span>
                <span className="text-base font-semibold text-purple-400 font-mono">{Math.floor(simProgress / 10) + 1}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Active Status</span>
                <span className="text-base font-semibold text-emerald-400 font-mono">Bypassed</span>
              </div>
            </div>

            {/* The active growing logs terminal container */}
            <div className="p-4 bg-black/90 rounded-xl border border-gray-900 h-[2400] relative font-mono text-[10px] text-gray-400 leading-relaxed max-h-[180px] overflow-y-auto">
              {simLogs.map((log, lIdx) => (
                <div key={lIdx} className="fade-in">
                  <span className="text-gray-600 font-mono">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
              <div className="text-indigo-400 font-semibold animate-pulse mt-1 ml-0.5 flex items-center gap-1 pb-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                CRAWLING STREAM: extracted {Math.ceil((simProgress / 100) * limit)} / {limit} records
              </div>
            </div>

            {/* Animated progress bar slider */}
            <div className="space-y-1.5">
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all" 
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
