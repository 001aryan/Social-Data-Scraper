import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Copy, 
  Search, 
  Terminal, 
  Database, 
  Code, 
  Check, 
  ListFilter, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle,
  FileSpreadsheet,
  Braces
} from 'lucide-react';
import { ScraperJob } from '../types';
import { CODE_TEMPLATES } from '../utils/mockData';

interface ResultsViewerTabProps {
  jobs: ScraperJob[];
  selectedJobId: string | null;
  onSelectJob: (job: ScraperJob) => void;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
}

export default function ResultsViewerTab({ 
  jobs, 
  selectedJobId, 
  onSelectJob,
  showToast 
}: ResultsViewerTabProps) {
  // Select completed jobs only for viewing
  const completedJobs = jobs.filter(j => j.status === 'completed' && j.resultsCount > 0);
  const activeJob = completedJobs.find(j => j.id === selectedJobId) || completedJobs[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [dataLayoutMode, setDataLayoutMode] = useState<'cards' | 'json'>('cards');
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript' | 'curl'>('python');

  // Actual client-side download engine
  const handleExport = (format: 'csv' | 'json') => {
    if (!activeJob) return;
    
    const results = activeJob.results || [];
    if (results.length === 0) {
      showToast('Export Failed', 'No structured results available in this dataset to export.', 'error');
      return;
    }

    try {
      showToast('Export Initiated', `Assembling file: ${activeJob.name}_dataset.${format}...`, 'info');

      let fileContent = '';
      let mimeType = '';

      if (format === 'json') {
        fileContent = JSON.stringify(results, null, 2);
        mimeType = 'application/json;charset=utf-8;';
      } else {
        // Collect all unique keys for CSV headers
        const headers = Array.from(new Set(results.flatMap(item => Object.keys(item))));
        const csvRows: string[] = [];

        // Build header CSV definition row
        csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

        // Serialize rows matching those headers
        for (const item of results) {
          const values = headers.map(header => {
            const rawVal = item[header];
            if (rawVal === undefined || rawVal === null) {
              return '""';
            }
            const valStr = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);
            return `"${valStr.replace(/"/g, '""')}"`;
          });
          csvRows.push(values.join(','));
        }

        fileContent = csvRows.join('\r\n');
        mimeType = 'text/csv;charset=utf-8;';
      }

      // Generate localized Browser trigger anchor elements
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeJob.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_dataset.${format}`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Export Successful', `Downloaded ${results.length} records in ${format.toUpperCase()} format.`, 'success');
    } catch (err: any) {
      showToast('Export Failed', `An error occurred while assembling the file download: ${err.message}`, 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Snippet Copied', 'Rotated API integration code added to clipboard.', 'success');
  };

  // Filter within scraped fields
  const filteredResults = activeJob?.results?.filter(item => {
    const textStr = (item.text || item.comment || item.position || '').toLowerCase();
    const authorStr = (item.username || item.author || item.company || '').toLowerCase();
    return textStr.includes(searchQuery.toLowerCase()) || authorStr.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Structured Results Hub</h1>
          <p className="text-xs text-gray-400">Inspect compiled JSON models, download datasets, or retrieve API code blocks.</p>
        </div>
      </div>

      {completedJobs.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-gray-800 bg-gray-950/20 max-w-lg mx-auto space-y-4">
          <Database className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="font-semibold text-white">No active scraped results available</h3>
          <p className="text-xs text-gray-400">
            Please run or complete at least one scraping index task to inspect schemas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left column select dropdown lists */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-gray-800 bg-gray-950/20 space-y-4">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">Select Active Dataset</span>
            
            <div className="space-y-2">
              {completedJobs.map(job => {
                const isActive = activeJob?.id === job.id;
                return (
                  <button 
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${isActive ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-800 bg-gray-950/40 text-gray-400 hover:text-white'}`}
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="block font-semibold truncate leading-tight">{job.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono truncate lowercase">{job.target}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 font-bold">{job.resultsCount} docs</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column detailed viewer panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header detail segment */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-950/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold capitalize">
                  {activeJob.platform} profile
                </span>
                <h3 className="text-md font-bold text-white mt-2 leading-none">{activeJob.name}</h3>
                <span className="text-[10px] text-gray-500 font-mono mt-1 font-semibold block uppercase">Dataset Target ID: {activeJob.id}</span>
              </div>

              {/* Action buttons download copies */}
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => handleExport('csv')}
                  className="px-3 py-2 bg-gray-950 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
                </button>
                <button 
                  onClick={() => handleExport('json')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 font-bold shadow-md"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
              </div>
            </div>

            {/* Developer interactive Code generation Tabs */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-950/20 space-y-4">
              <div className="flex justify-between items-center bg-[#070c14]/40 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-gray-300 font-mono">Developer Integration Script</span>
                </div>

                {/* Sub language tabs selector */}
                <div className="flex gap-1.5 text-[10px] font-semibold font-mono">
                  {(['python', 'javascript', 'curl'] as const).map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-2 py-1 uppercase rounded transition-colors ${codeLanguage === lang ? 'bg-indigo-600 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display code block selection */}
              <div className="relative">
                <pre className="p-4 bg-black/90 border border-gray-900 rounded-xl font-mono text-[10px] text-gray-300 leading-relaxed overflow-x-auto select-text">
                  <code>
                    {codeLanguage === 'python' && CODE_TEMPLATES.python(activeJob.id)}
                    {codeLanguage === 'javascript' && CODE_TEMPLATES.javascript(activeJob.id)}
                    {codeLanguage === 'curl' && CODE_TEMPLATES.curl(activeJob.id)}
                  </code>
                </pre>
                
                <button 
                  onClick={() => handleCopyCode(
                    codeLanguage === 'python' ? CODE_TEMPLATES.python(activeJob.id) : 
                    codeLanguage === 'javascript' ? CODE_TEMPLATES.javascript(activeJob.id) : 
                    CODE_TEMPLATES.curl(activeJob.id)
                  )}
                  className="absolute top-3 right-3 p-1.5 bg-gray-950 border border-gray-800 hover:border-indigo-500 rounded text-gray-400 hover:text-white transition-all cursor-pointer shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Results Filter lists and Layout selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-950 rounded-xl border border-gray-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
                    placeholder="Filter records query matches..."
                  />
                </div>

                {/* layout toggle buttons */}
                <div className="inline-flex items-center gap-1 bg-[#090f19] p-1 rounded-lg border border-gray-850">
                  <button 
                    onClick={() => setDataLayoutMode('cards')}
                    className={`px-3 py-1 text-xs rounded transition-all font-semibold flex items-center gap-1 ${dataLayoutMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ListFilter className="w-3.5 h-3.5" /> List view
                  </button>
                  <button 
                    onClick={() => setDataLayoutMode('json')}
                    className={`px-3 py-1 text-xs rounded transition-all font-semibold flex items-center gap-1 ${dataLayoutMode === 'json' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Braces className="w-3.5 h-3.5" /> Raw JSON
                  </button>
                </div>
              </div>

              {/* Result renderer container */}
              <AnimatePresence mode="wait">
                {dataLayoutMode === 'cards' ? (
                  <motion.div 
                    key="cards"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {filteredResults.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                        No record elements matched searching keywords.
                      </div>
                    ) : (
                      filteredResults.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-850 bg-gray-950/20 space-y-2">
                          <div className="flex justify-between items-center border-b border-gray-900 pb-2 text-[10px] font-mono">
                            <span className="text-[#a5b4fc] font-bold">{item.username || item.author || item.company}</span>
                            <span className="text-gray-500 font-medium">{item.date || item.posted || 'scraped block'}</span>
                          </div>
                          
                          <p className="text-xs text-gray-200 leading-relaxed font-normal">{item.text || item.comment || `Staff scope position: ${item.position} located at: ${item.location}`}</p>
                          
                          <div className="flex gap-4 pt-1 text-[10px] font-mono text-gray-500 font-semibold">
                            {item.likes !== undefined && <span>Likes: {item.likes}</span>}
                            {item.retweets !== undefined && <span>Retweets: {item.retweets}</span>}
                            {item.comments_count !== undefined && <span>Comment lines: {item.comments_count}</span>}
                            {item.salary !== undefined && <span className="text-emerald-400">Budget: {item.salary}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 bg-black rounded-xl border border-gray-900 font-mono text-[10px] text-emerald-450 text-emerald-400 whitespace-pre-wrap leading-relaxed select-text overflow-x-auto max-h-[350px]"
                  >
                    {JSON.stringify(filteredResults, null, 2)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
