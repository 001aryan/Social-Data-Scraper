import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Download, 
  Copy, 
  X, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Check,
  AlertOctagon,
  ArrowUpDown,
  BookOpen,
  Eye,
  FileCode2,
  ListFilter
} from 'lucide-react';
import { ScraperJob, Platform, JobStatus } from '../types';

interface JobManagementProps {
  jobs: ScraperJob[];
  onSelectJob: (job: ScraperJob) => void;
  selectedJob: ScraperJob | null;
  onCloseDrawer: () => void;
  onDeleteJob: (id: string) => void;
  onDeleteMultipleJobs: (ids: string[]) => void;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
}

export default function JobManagement({ 
  jobs, 
  onSelectJob, 
  selectedJob, 
  onCloseDrawer, 
  onDeleteJob,
  onDeleteMultipleJobs,
  showToast
}: JobManagementProps) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'limit' | 'resultsCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Toggle single row checkbox
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Toggle select all rows
  const handleToggleSelectAll = (filteredJobs: ScraperJob[]) => {
    const filteredIds = filteredJobs.map(j => j.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => [...Array.from(new Set([...prev, ...filteredIds]))]);
    }
  };

  // Bulk deletion
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteMultipleJobs(selectedIds);
    showToast('Bulk Action Done', `Successfully purged ${selectedIds.length} job records.`, 'success');
    setSelectedIds([]);
  };

  const handleCopyResults = (results: any) => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    showToast('Copied to Clipboard', 'Structured JSON payload added to clipboard.', 'success');
  };

  // Filtering & Sorting
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase()) || 
                          job.target.toLowerCase().includes(search.toLowerCase()) ||
                          job.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || job.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  }).sort((a, b) => {
    let returnVal = 0;
    if (sortBy === 'createdAt') {
      returnVal = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'limit') {
      returnVal = b.limit - a.limit;
    } else if (sortBy === 'resultsCount') {
      returnVal = b.resultsCount - a.resultsCount;
    }
    return sortOrder === 'desc' ? returnVal : -returnVal;
  });

  const toggleSort = (field: 'createdAt' | 'limit' | 'resultsCount') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Drawer inner viewing tab states
  const [drawerTab, setDrawerTab] = useState<'logs' | 'data'>('logs');

  return (
    <div className="space-y-5">
      
      {/* Search and interactive filter controls banner */}
      <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between bg-[#080d15]/40 p-4 rounded-xl border border-gray-800/80">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-950 rounded-xl border border-gray-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
            placeholder="Search targets or job names..."
          />
        </div>

        {/* Platform scope pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button 
            type="button" 
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${platformFilter === 'all' ? 'border-indigo-500 text-indigo-300 bg-indigo-505/10 bg-indigo-500/10' : 'border-gray-850 text-gray-400 bg-transparent hover:text-white'}`}
          >
            All Platforms
          </button>
          <button 
            type="button" 
            onClick={() => setPlatformFilter('twitter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${platformFilter === 'twitter' ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-gray-850 text-gray-400 bg-transparent hover:text-white'}`}
          >
            <Twitter className="w-3.5 h-3.5" />
            X / Twitter
          </button>
          <button 
            type="button" 
            onClick={() => setPlatformFilter('instagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${platformFilter === 'instagram' ? 'border-pink-500 text-pink-400 bg-pink-500/10' : 'border-gray-850 text-gray-400 bg-transparent hover:text-white'}`}
          >
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </button>
          <button 
            type="button" 
            onClick={() => setPlatformFilter('linkedin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${platformFilter === 'linkedin' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-gray-850 text-gray-400 bg-transparent hover:text-white'}`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn
          </button>
          <button 
            type="button" 
            onClick={() => setPlatformFilter('youtube')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${platformFilter === 'youtube' ? 'border-red-500 text-red-400 bg-red-500/10 font-mono' : 'border-gray-850 text-gray-400 bg-transparent'}`}
          >
            <Youtube className="w-3.5 h-3.5" />
            YouTube
          </button>
        </div>
      </div>

      {/* Sub-filters Status selections & Bulk Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-gray-500">
            <ListFilter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['all', 'queued', 'running', 'completed', 'failed'] as const).map(st => {
            const isSelected = statusFilter === st;
            return (
              <button 
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 capitalize font-medium rounded-md transition-colors ${isSelected ? 'bg-gray-850 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Selected counts and Bulk Purple indicators */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-1.5 px-3"
            >
              <span className="text-[11px] font-mono text-indigo-300 font-semibold">{selectedIds.length} Selected</span>
              <button 
                onClick={handleBulkDelete}
                className="p-1 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10 rounded"
                title="Purge Selected Records"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main interactive data list Table */}
      <div className="bg-gray-950/40 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800/80 bg-gray-950/50 text-gray-500 font-mono text-[11px]">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={() => handleToggleSelectAll(filteredJobs)}
                    checked={filteredJobs.length > 0 && filteredJobs.every(j => selectedIds.includes(j.id))}
                    className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-3.5 h-3.5"
                  />
                </th>
                <th className="p-4 font-semibold hover:text-white transition-colors cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Job ID & Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 font-semibold">Platform</th>
                <th className="p-4 font-semibold cursor-pointer" onClick={() => toggleSort('limit')}>
                  <div className="flex items-center gap-1">
                    Depth Limit
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold cursor-pointer" onClick={() => toggleSort('resultsCount')}>
                  <div className="flex items-center gap-1">
                    Records Parsed
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-right">Action Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertOctagon className="w-8 h-8 text-gray-600 mx-auto" />
                      <h4 className="font-semibold text-white">No social spiders matched</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Refine your platform or status filter query and try again.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isChecked = selectedIds.includes(job.id);
                  const isDrawerFocus = selectedJob?.id === job.id;
                  
                  return (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-gray-900/30 transition-all ${isChecked ? 'bg-indigo-500/5' : ''} ${isDrawerFocus ? 'bg-indigo-500/10' : ''}`}
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(job.id)}
                          className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-3.5 h-3.5"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-xs">{job.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono tracking-tight mt-1 truncate max-w-[170px]">
                            {job.id} · {job.target}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-gray-900 border border-gray-800 capitalize text-gray-300">
                          {job.platform === 'twitter' && <Twitter className="w-3 h-3 text-sky-400" />}
                          {job.platform === 'instagram' && <Instagram className="w-3 h-3 text-pink-400" />}
                          {job.platform === 'linkedin' && <Linkedin className="w-3 h-3 text-blue-400" />}
                          {job.platform === 'youtube' && <Youtube className="w-3 h-3 text-red-400" />}
                          {job.platform}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-gray-400 font-semibold">{job.limit} pages</td>

                      <td className="p-4">
                        {job.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Completed
                          </span>
                        )}
                        {job.status === 'running' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                            Running ({job.progress}%)
                          </span>
                        )}
                        {job.status === 'queued' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Queued
                          </span>
                        )}
                        {job.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-500/20 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-white text-xs">
                        {job.resultsCount > 0 ? `${job.resultsCount} docs` : '—'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => onSelectJob(job)}
                            className="p-1 px-2.5 hover:bg-gray-900 border border-transparent hover:border-gray-800 rounded-lg text-gray-400 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1"
                            title="Inspect Dataset Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                          
                          <button 
                            onClick={() => onDeleteJob(job.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"
                            title="Purge index"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-[10px] font-mono text-gray-500 bg-gray-950/20">
          <span>Displaying 1-{filteredJobs.length} of {filteredJobs.length} jobs</span>
          <div className="flex gap-2">
            <button disabled className="px-2 py-1 rounded bg-gray-950 border border-gray-800 text-gray-500 cursor-not-allowed">Previous</button>
            <button disabled className="px-2 py-1 rounded bg-gray-950 border border-gray-800 text-gray-500 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Elegant Sliding side drawer and inspections details panel */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={onCloseDrawer}
          >
            {/* Drawer side box */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-[#060a12]/95 border-l border-gray-800 shadow-2xl h-full flex flex-col justify-between overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header section drawer details */}
              <div className="p-5 border-b border-gray-800 bg-[#080e1a]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-gray-300 font-semibold px-2 py-0.5 rounded text-[10px] font-mono bg-gray-950 border border-gray-800 flex items-center gap-1">
                      {selectedJob.platform === 'twitter' && <Twitter className="w-3 h-3 text-sky-400" />}
                      {selectedJob.platform === 'instagram' && <Instagram className="w-3 h-3 text-pink-400" />}
                      {selectedJob.platform === 'linkedin' && <Linkedin className="w-3 h-3 text-blue-400" />}
                      {selectedJob.platform === 'youtube' && <Youtube className="w-3 h-3 text-red-400" />}
                      {selectedJob.platform}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase font-bold tracking-wider">Spider profile</span>
                  </div>

                  <button 
                    onClick={onCloseDrawer}
                    className="p-1 px-2 border border-gray-800 hover:border-gray-700 bg-gray-950 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="text-base font-bold text-white leading-tight">{selectedJob.name}</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold truncate leading-none">Query targeting: {selectedJob.target}</p>
                </div>

                {/* Sub Tab Drawer controls: Logs vs Raw Data */}
                <div className="flex border-b border-gray-850/60 mt-6 gap-6 text-xs text-gray-500">
                  <button 
                    onClick={() => setDrawerTab('logs')}
                    className={`pb-2.5 font-bold flex items-center gap-1 transition-colors relative ${drawerTab === 'logs' ? 'text-indigo-400' : 'hover:text-gray-300'}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Spider Execution Logs
                    {drawerTab === 'logs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                  </button>

                  <button 
                    onClick={() => setDrawerTab('data')}
                    className={`pb-2.5 font-bold flex items-center gap-1 transition-colors relative ${drawerTab === 'data' ? 'text-indigo-400' : 'hover:text-gray-300'}`}
                  >
                    <FileCode2 className="w-4 h-4" />
                    Result Dataset ({selectedJob.resultsCount} docs)
                    {drawerTab === 'data' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                  </button>
                </div>
              </div>

              {/* Central body viewer */}
              <div className="flex-1 p-5 overflow-y-auto bg-black/30">
                <AnimatePresence mode="wait">
                  {drawerTab === 'logs' ? (
                    <motion.div 
                      key="logs"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      className="p-4 bg-[#03060d] border border-gray-900 rounded-xl font-mono text-[10px] text-gray-400 leading-relaxed space-y-2 max-h-[450px] overflow-y-auto whitespace-pre-wrap select-text"
                    >
                      {selectedJob.logs && selectedJob.logs.length > 0 ? (
                        selectedJob.logs.map((log, lIdx) => (
                          <div key={lIdx} className="hover:text-white transition-all font-mono">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No telemetry logs available for queued jobs.</div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="data"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="space-y-4"
                    >
                      {/* Interactive JSON string viewer or data list */}
                      {selectedJob.results && selectedJob.results.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span>Inspect structure mapping:</span>
                            <button 
                              onClick={() => handleCopyResults(selectedJob.results)}
                              className="px-2 py-1 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded text-gray-400 hover:text-white transition-all flex items-center gap-1 font-mono"
                            >
                              <Copy className="w-3 h-3" /> Copy Raw JSON
                            </button>
                          </div>

                          {/* Data loop visual cards */}
                          <div className="space-y-3 font-sans">
                            {selectedJob.results.map((item, itIdx) => (
                              <div key={itIdx} className="p-4 rounded-xl border border-gray-850 bg-gray-950/80 space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b border-gray-900 pb-1.5 font-mono text-[10px]">
                                  <span className="text-gray-400 font-semibold">{item.username || item.author || item.company || 'Record Item'}</span>
                                  <span className="text-gray-600">{item.date || item.posted || 'recently'}</span>
                                </div>
                                <p className="text-gray-200 leading-relaxed font-normal">{item.text || item.comment || `Position: ${item.position} (${item.location})`}</p>
                                
                                {/* Metrics loop */}
                                <div className="flex gap-4 pt-1.5 font-mono text-[9px] text-[#818cf8]">
                                  {(item.likes !== undefined) && <span>Likes: {item.likes}</span>}
                                  {(item.retweets !== undefined) && <span>Retweets: {item.retweets}</span>}
                                  {(item.comments_count !== undefined) && <span>Comments: {item.comments_count}</span>}
                                  {(item.salary !== undefined) && <span>Salary: {item.salary}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-600 font-semibold">
                          <AlertOctagon className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                          No scraped data records parsed for this status.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom footer button panel */}
              <div className="p-4 border-t border-gray-850/60 bg-[#060a12]/95 flex justify-end gap-2.5">
                <button 
                  onClick={onCloseDrawer}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-[#2e323e] hover:bg-gray-950 rounded-lg transition-all"
                >
                  Dismiss Drawer
                </button>
                <button 
                  onClick={() => handleCopyResults(selectedJob.results)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md rounded-lg transition-all"
                >
                  Download Raw Schema
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
