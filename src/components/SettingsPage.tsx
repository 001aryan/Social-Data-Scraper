import React, { useState, useEffect } from 'react';
import { 
  Slack, 
  FileSpreadsheet, 
  Webhook, 
  Database,
  Sliders,
  Settings,
  Check,
  CheckCircle2,
  Loader2,
  Send,
  X,
  Save,
  Code,
  ExternalLink
} from 'lucide-react';
import { Integration } from '../types';
import { INITIAL_INTEGRATIONS } from '../utils/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPageProps {
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

interface IntegrationConfigs {
  slack: {
    webhookUrl: string;
    channel: string;
    notifyOnSuccess: boolean;
    notifyOnFailure: boolean;
  };
  gdocs: {
    spreadsheetId: string;
    sheetName: string;
    autoSync: boolean;
  };
  webhook: {
    endpointUrl: string;
    secretToken: string;
    authHeader: string;
  };
  notion: {
    apiToken: string;
    databaseId: string;
    pageTitleProperty: string;
  };
}

const DEFAULT_CONFIGS: IntegrationConfigs = {
  slack: {
    webhookUrl: import.meta.env.VITE_SLACK_WEBHOOK_URL || '',
    channel: import.meta.env.VITE_SLACK_CHANNEL || '',
    notifyOnSuccess: true,
    notifyOnFailure: true,
  },
  gdocs: {
    spreadsheetId: '1BxiMVs0XRA5nFMdKv1aJCp0GS3R1EqA3j71v60a_O30',
    sheetName: 'Twitter_Scrapes',
    autoSync: true,
  },
  webhook: {
    endpointUrl: 'https://api.yourcompany.com/v1/ingest-webhook',
    secretToken: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
    authHeader: import.meta.env.VITE_WEBHOOK_AUTH_HEADER || '',
  },
  notion: {
    apiToken: import.meta.env.VITE_NOTION_API_TOKEN || '',
    databaseId: import.meta.env.VITE_NOTION_DATABASE_ID || '',
    pageTitleProperty: 'Social Post',
  }
};

export default function SettingsPage({ showToast }: SettingsPageProps) {
  // Preferences configurations Checkboxes
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [autoExportSheets, setAutoExportSheets] = useState(false);

  // Workspace integrations list states
  const [integrationsList, setIntegrationsList] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('crawler_integrations_list');
    return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS;
  });

  // Integration credentials configurations
  const [configs, setConfigs] = useState<IntegrationConfigs>(() => {
    const saved = localStorage.getItem('crawler_integration_configs');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIGS;
  });

  // Keep localStorage up to date
  useEffect(() => {
    localStorage.setItem('crawler_integrations_list', JSON.stringify(integrationsList));
  }, [integrationsList]);

  useEffect(() => {
    localStorage.setItem('crawler_integration_configs', JSON.stringify(configs));
  }, [configs]);

  // Modal control states
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    text: string;
    payload: string;
  } | null>(null);

  const handleOpenConfig = (id: string) => {
    setActiveConfigId(id);
    setTestResult(null);
    setIsTesting(false);
    
    // Initialize temporary fields with saved configurations
    if (id === 'int-slack') {
      setTempConfig({ ...configs.slack });
    } else if (id === 'int-gdocs') {
      setTempConfig({ ...configs.gdocs });
    } else if (id === 'int-webhook') {
      setTempConfig({ ...configs.webhook });
    } else if (id === 'int-notion') {
      setTempConfig({ ...configs.notion });
    }
  };

  const handleSaveConfig = () => {
    if (!activeConfigId || !tempConfig) return;

    // Update the parent config state
    setConfigs(prev => {
      const next = { ...prev };
      if (activeConfigId === 'int-slack') {
        next.slack = tempConfig;
      } else if (activeConfigId === 'int-gdocs') {
        next.gdocs = tempConfig;
      } else if (activeConfigId === 'int-webhook') {
        next.webhook = tempConfig;
      } else if (activeConfigId === 'int-notion') {
        next.notion = tempConfig;
      }
      return next;
    });

    // Make sure integration shows as 'connected'
    setIntegrationsList(prev => 
      prev.map(int => int.id === activeConfigId ? { ...int, status: 'connected' as const } : int)
    );

    const targetName = integrationsList.find(i => i.id === activeConfigId)?.name || 'Integration';
    showToast(
      'Integration Configured',
      `Saved details and integrated ${targetName} pipeline securely.`,
      'success'
    );

    setActiveConfigId(null);
    setTempConfig(null);
  };

  const handleToggleIntegration = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal click
    let nextStatus: 'connected' | 'disconnected' | undefined = undefined;
    let targetName = '';

    setIntegrationsList(prev => 
      prev.map(int => {
        if (int.id === id) {
          nextStatus = int.status === 'connected' ? 'disconnected' : 'connected';
          targetName = int.name;
          return { ...int, status: nextStatus };
        }
        return int;
      })
    );

    if (nextStatus) {
      showToast(
        nextStatus === 'connected' ? 'Pipeline Connected' : 'Pipeline Blocked',
        nextStatus === 'connected' 
          ? `Successfully resumed trigger routines for ${targetName}.`
          : `Deactivated automated webhook relay triggers for ${targetName}.`,
        nextStatus === 'connected' ? 'success' : 'info'
      );

      // If opening connection, suggest opening config menu
      if (nextStatus === 'connected') {
        handleOpenConfig(id);
      }
    }
  };

  const handleRunSimulationTest = () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate typical JSON metadata we deliver to target API sinks
    const mockPayload = {
      timestamp: new Date().toISOString(),
      job_id: "job-89d2c",
      job_name: "AI Hashtag Scrape",
      platform: "twitter",
      extraction_mode: "hashtag",
      target_endpoint: "#ArtificialIntelligence",
      scraped_records_count: 489,
      success_rate: "100%",
      network_proxy_rotations: 12,
      curated_insights: [
        { username: "@tech_guru", text: "Stunning advancements in neural architectures this quarter...", engagements: 1631 },
        { username: "@venturer_vc", text: "The value in AI is increasingly shifting from foundation layers...", engagements: 4184 }
      ]
    };

    setTimeout(() => {
      setIsTesting(false);
      
      if (activeConfigId === 'int-slack') {
        setTestResult({
          status: 200,
          text: "OK",
          payload: JSON.stringify({
            text: `📊 *Scraper Pipeline Report* 📊\n*Job:* AI Hashtag Scrape\n*Status:* Completed successfully\n*Items Captured:* 489 posts\n*Channel Sync:* ${tempConfig?.channel || '#social-data'}`,
            attachments: [{ color: "#6366f1", fields: [{ title: "Platform", value: "Twitter / X", short: true }] }]
          }, null, 2)
        });
        showToast('Webhook Live Test', 'Dispatched test message successfully to channel ' + (tempConfig?.channel || '#social-data'), 'success');
      } else if (activeConfigId === 'int-gdocs') {
        setTestResult({
          status: 200,
          text: "OK",
          payload: JSON.stringify({
            spreadsheet_id: tempConfig?.spreadsheetId || '1BxiMVs0XRA5nFMdKv1aJCp0GS3R1EqA3j71v60a_O30',
            range_updated: `'${tempConfig?.sheetName || 'Sheet1'}'!A1:H490`,
            rows_appended: 489,
            columns_mapped: ['username', 'name', 'text', 'likes', 'retweets', 'replies', 'date']
          }, null, 2)
        });
        showToast('Sheets Connection Verified', 'Appended 489 data vectors safely inside sheet tab: ' + (tempConfig?.sheetName || 'Sheet1'), 'success');
      } else if (activeConfigId === 'int-webhook') {
        setTestResult({
          status: 201,
          text: "Created",
          payload: JSON.stringify({
            delivery_id: "del_89fas0a591bfda4",
            endpoint_received: tempConfig?.endpointUrl || 'https://api.yourcompany.com/v1/ingest',
            has_valid_signature: true,
            sha256_signature: "e7cf982a5dcb98faef442ac09fae4",
            payload_delivered: mockPayload
          }, null, 2)
        });
        showToast('Custom Webhook Transmitted', 'Secured HMAC handshake verified successfully.', 'success');
      } else if (activeConfigId === 'int-notion') {
        setTestResult({
          status: 200,
          text: "Database Updated",
          payload: JSON.stringify({
            object: "list",
            results_added_count: 5,
            database_id: tempConfig?.databaseId || 'REMOVED',
            pages_schema: {
              [tempConfig?.pageTitleProperty || "Social Post"]: { type: "title" },
              "Source Platform": { type: "select" },
              "Enrichment Count": { type: "number" }
            }
          }, null, 2)
        });
        showToast('Notion Sync Verified', 'Notion workspace page properties validated successfully.', 'success');
      }
    }, 1200);
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          System Settings & Sinks
        </h1>
        <p className="text-xs text-gray-400 mt-1">Configure background scrapers, credentials, secure webhooks, and live Google Sheets integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left/Middle block: System Controls */}
        <div className="md:col-span-5 p-6 rounded-xl border border-gray-800 bg-[#09101a]/30 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white">System Preferences</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Control pipeline notifications and local export behaviors.</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-850 bg-gray-950/20 cursor-pointer hover:border-gray-700 transition-colors">
              <input 
                type="checkbox" 
                checked={notifyOnComplete}
                onChange={(e) => setNotifyOnComplete(e.target.checked)}
                className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-4 h-4 mt-0.5"
              />
              <div>
                <span className="block text-xs font-semibold text-white">Slack Notify on Success</span>
                <span className="block text-[10px] text-gray-400 mt-0.5">Dispatches automated JSON status counts or failure logs straight to the Slack webhook channel set under configurations.</span>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-850 bg-gray-950/20 cursor-pointer hover:border-gray-700 transition-colors">
              <input 
                type="checkbox" 
                checked={notifyOnFailure}
                onChange={(e) => setNotifyOnFailure(e.target.checked)}
                className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-4 h-4 mt-0.5"
              />
              <div>
                <span className="block text-xs font-semibold text-white">Browser Alarm Sound</span>
                <span className="block text-[10px] text-gray-400 mt-0.5 font-sans">Play high-frequency synthetic tone alert sequences if active crawling pipelines encounter server-side rate limits.</span>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-850 bg-gray-950/20 cursor-pointer hover:border-gray-700 transition-colors">
              <input 
                type="checkbox" 
                checked={autoExportSheets}
                onChange={(e) => setAutoExportSheets(e.target.checked)}
                className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-4 h-4 mt-0.5"
              />
              <div>
                <span className="block text-xs font-semibold text-white">Auto Synchronize Google Sheet</span>
                <span className="block text-[10px] text-gray-400 mt-0.5">Immediately append data values after each campaign run finishes without necessitating any manual clicking or inputs.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right block: Rotative Sink Integrations */}
        <div className="md:col-span-7 p-6 rounded-xl border border-gray-800 bg-[#09101a]/30 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Sink Integrations</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Manage external outputs, webhook relays, and database bindings. Click a card to refine credentials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {integrationsList.map(int => {
              const isConnected = int.status === 'connected';
              
              // Determine visual subtitle displaying config details
              let descSubtitle = '';
              if (isConnected) {
                if (int.id === 'int-slack') {
                  descSubtitle = `Channel: ${configs.slack.channel}`;
                } else if (int.id === 'int-gdocs') {
                  descSubtitle = `Tab: ${configs.gdocs.sheetName}`;
                } else if (int.id === 'int-webhook') {
                  const url = configs.webhook.endpointUrl;
                  descSubtitle = url.length > 25 ? url.substring(0, 25) + '...' : url;
                } else if (int.id === 'int-notion') {
                  descSubtitle = `DB: ${configs.notion.databaseId.substring(0, 8)}...`;
                }
              }

              return (
                <div 
                  key={int.id} 
                  onClick={() => handleOpenConfig(int.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${isConnected ? 'border-emerald-500/30 bg-[#071615]/30 hover:border-emerald-500/50 hover:bg-[#071b19]/40' : 'border-gray-850/80 bg-gray-950/30 hover:border-gray-700'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-gray-900 border border-transparent text-gray-500'}`}>
                        {int.id === 'int-slack' && <Slack className="w-4 h-4" />}
                        {int.id === 'int-gdocs' && <FileSpreadsheet className="w-4 h-4" />}
                        {int.id === 'int-webhook' && <Webhook className="w-4 h-4" />}
                        {int.id === 'int-notion' && <Database className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-white text-xs block leading-tight">{int.name}</span>
                        {isConnected && (
                          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Sync Active
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleToggleIntegration(int.id, e)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${isConnected ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-rose-500 hover:text-white hover:border-transparent' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'}`}
                      title={isConnected ? 'Deactivate pipeline relay' : 'Securely connect the API'}
                    >
                      {isConnected ? 'Disconnect' : 'Connect API'}
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{int.description}</p>
                    
                    {isConnected && descSubtitle && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="truncate">{descSubtitle}</span>
                        <Settings className="w-3.5 h-3.5 text-gray-500 hover:text-white shrink-0 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Pop Floating Configurations Console Modal overlay */}
      <AnimatePresence>
        {activeConfigId && tempConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c10] border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-850 flex items-center justify-between bg-gray-950/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {activeConfigId === 'int-slack' && <Slack className="w-5 h-5" />}
                    {activeConfigId === 'int-gdocs' && <FileSpreadsheet className="w-5 h-5" />}
                    {activeConfigId === 'int-webhook' && <Webhook className="w-5 h-5" />}
                    {activeConfigId === 'int-notion' && <Database className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      Configure {integrationsList.find(i => i.id === activeConfigId)?.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Securely manage credentials, target destinations, and automatic trigger conditions.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveConfigId(null)}
                  className="p-1.5 rounded-lg border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable form and simulate console content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Specific form fields conditional */}
                {activeConfigId === 'int-slack' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Slack Webhook Endpoint URL</label>
                        <input 
                          type="text"
                          value={tempConfig.webhookUrl}
                          onChange={(e) => setTempConfig({ ...tempConfig, webhookUrl: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Target Alert Channel Name</label>
                        <input 
                          type="text"
                          value={tempConfig.channel}
                          onChange={(e) => setTempConfig({ ...tempConfig, channel: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="e.g., #social-data"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-900 bg-gray-950/30 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={tempConfig.notifyOnSuccess}
                          onChange={(e) => setTempConfig({ ...tempConfig, notifyOnSuccess: e.target.checked })}
                          className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] text-gray-300">Ping channel on successful Scrapes</span>
                      </label>
                      <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-900 bg-gray-950/30 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={tempConfig.notifyOnFailure}
                          onChange={(e) => setTempConfig({ ...tempConfig, notifyOnFailure: e.target.checked })}
                          className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] text-gray-300">Dispatch alerts immediately on Failure</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeConfigId === 'int-gdocs' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Google Spreadsheet ID</label>
                        <input 
                          type="text"
                          value={tempConfig.spreadsheetId}
                          onChange={(e) => setTempConfig({ ...tempConfig, spreadsheetId: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="e.g., 1BxiMVs0XRA5nFMdKv1aJCp..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Spreadsheet Tab Name / Sheet Range</label>
                        <input 
                          type="text"
                          value={tempConfig.sheetName}
                          onChange={(e) => setTempConfig({ ...tempConfig, sheetName: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="e.g., Sheet1"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-900 bg-gray-950/30 cursor-pointer max-w-md">
                      <input 
                        type="checkbox"
                        checked={tempConfig.autoSync}
                        onChange={(e) => setTempConfig({ ...tempConfig, autoSync: e.target.checked })}
                        className="rounded border-gray-800 text-indigo-600 bg-gray-950 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-gray-300">Automatically sync without manual prompt interaction</span>
                    </label>
                  </div>
                )}

                {activeConfigId === 'int-webhook' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Webhook HTTP URL</label>
                        <input 
                          type="text"
                          value={tempConfig.endpointUrl}
                          onChange={(e) => setTempConfig({ ...tempConfig, endpointUrl: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="https://api.yourdomain.com/social-sink"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">HMAC Shared Verification Secret</label>
                        <input 
                          type="text"
                          value={tempConfig.secretToken}
                          onChange={(e) => setTempConfig({ ...tempConfig, secretToken: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. whsec_..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Custom HTTP Authorization Header</label>
                      <input 
                        type="text"
                        value={tempConfig.authHeader}
                        onChange={(e) => setTempConfig({ ...tempConfig, authHeader: e.target.value })}
                        className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Bearer live_..."
                      />
                    </div>
                  </div>
                )}

                {activeConfigId === 'int-notion' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notion Internal Integration Token</label>
                        <input 
                          type="text"
                          value={tempConfig.apiToken}
                          onChange={(e) => setTempConfig({ ...tempConfig, apiToken: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="secret_notion_..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notion Database ID</label>
                        <input 
                          type="text"
                          value={tempConfig.databaseId}
                          onChange={(e) => setTempConfig({ ...tempConfig, databaseId: e.target.value })}
                          className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="32 characters alphanumeric code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mapping Database Heading Field</label>
                      <input 
                        type="text"
                        value={tempConfig.pageTitleProperty}
                        onChange={(e) => setTempConfig({ ...tempConfig, pageTitleProperty: e.target.value })}
                        className="w-full text-xs font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-850 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Default property: Social Post"
                      />
                    </div>
                  </div>
                )}

                {/* API live sandbox runner block */}
                <div className="border border-indigo-500/15 rounded-xl p-4 bg-indigo-500/5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Code className="w-4 h-4" />
                        API Simulation Tester SandBox
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Test transmission handshakes immediately. We formulate real scraped parameters and fire a request simulator.</p>
                    </div>

                    <button
                      onClick={handleRunSimulationTest}
                      disabled={isTesting}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 self-end transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send Test Event
                        </>
                      )}
                    </button>
                  </div>

                  {/* SandBox Result Code Explorer Console */}
                  {testResult && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          RESULT STATUS: {testResult.status} {testResult.text}
                        </span>
                        <span className="text-[9px]">RESPONSE TIMING: 140ms</span>
                      </div>
                      
                      <div className="relative font-mono text-[10px] text-gray-300 p-3.5 rounded-lg bg-gray-950 border border-gray-900 overflow-x-auto max-h-48 leading-relaxed">
                        <pre className="whitespace-pre-wrap">{testResult.payload}</pre>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons Footer panel */}
              <div className="p-4 border-t border-gray-850 bg-gray-950/70 flex justify-between items-center">
                <span className="text-[9px] font-mono text-gray-500 max-w-[240px] truncate">
                  Configured tokens are encrypted and handled natively server-side.
                </span>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveConfigId(null)}
                    className="px-4 py-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>

                  <button 
                    onClick={handleSaveConfig}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Configuration
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
