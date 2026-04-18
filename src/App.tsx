import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Shield, 
  Zap, 
  Network, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Code2,
  Lock,
  Eye,
  Settings,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { AuditSnapshot, TagAuditResult } from './types';
import { generateMockAudit, getRealResources } from './services/mockAudit';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'performance' | 'governance' | 'research'>('overview');
  const [audit, setAudit] = useState<AuditSnapshot | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation: Initialize or fetch audit
  useEffect(() => {
    handleScan();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mock = generateMockAudit(window.location.origin);
      const real = getRealResources();
      
      // Merge real resources into the audit results
      setAudit({
        ...mock,
        results: [...mock.results, ...real]
      });
      setIsScanning(false);
    }, 1500);
  };

  const filteredResults = useMemo(() => {
    if (!audit) return [];
    return audit.results.filter(r => 
      r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [audit, searchQuery]);

  const toggleBlock = (domain: string) => {
    if (!audit) return;
    setAudit({
      ...audit,
      results: audit.results.map(r => 
        r.domain === domain ? { ...r, blocked: !r.blocked } : r
      )
    });
  };

  // Derived scores based on blocking state for simulation
  const mockScores = useMemo(() => {
    if (!audit) return { perf: 0, gov: 0, int: 0 };
    const blockedCount = audit.results.filter(r => r.blocked).length;
    const basePerf = audit.scores.performance;
    return {
      perf: Math.min(100, basePerf + (blockedCount * 4)),
      gov: Math.min(100, audit.scores.governance + (blockedCount * 12)),
      int: audit.scores.integrity
    };
  }, [audit]);

  if (!audit) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing Auditor Core...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 selection:bg-blue-600/30 font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-200 bg-white sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-zinc-900">THE LOCAL AUDITOR</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Tag Governance & Validation engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Auditing:</span>
            <span className="font-mono">{audit.url}</span>
          </div>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-1.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-xs font-semibold disabled:opacity-50 text-zinc-700"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5", isScanning && "animate-spin")} />
            {isScanning ? 'SCANNING...' : 'START SNAPSHOT'}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-zinc-200 min-h-[calc(100vh-64px)] p-6 flex flex-col gap-2 bg-white">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest px-3 mb-4 font-bold">Audit Suite</p>
          <NavButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<Zap className="w-4 h-4" />}
            label="Overview"
            sub="Scores & Summary"
          />
          <NavButton 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')}
            icon={<Network className="w-4 h-4" />}
            label="Network Lab"
            sub="Payload Validation"
          />
          <NavButton 
            active={activeTab === 'performance'} 
            onClick={() => setActiveTab('performance')}
            icon={<Activity className="w-4 h-4" />}
            label="Profiler"
            sub="Main Thread Blocking"
          />
          <NavButton 
            active={activeTab === 'governance'} 
            onClick={() => setActiveTab('governance')}
            icon={<Lock className="w-4 h-4" />}
            label="Governance"
            sub="Simulation Blocking"
          />
          <NavButton 
            active={activeTab === 'research'} 
            onClick={() => setActiveTab('research')}
            icon={<Activity className="w-4 h-4" />}
            label="Research"
            sub="Arch & Optimization"
          />

          <div className="mt-auto pt-4">
            <NavButton 
              active={false} 
              onClick={() => {}}
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              sub="Config"
            />
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto max-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Score Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard 
                    label="Performance" 
                    value={mockScores.perf} 
                    icon={<Zap className="text-amber-500" />} 
                    color="text-amber-500"
                    trend="+4.2%"
                  />
                  <ScoreCard 
                    label="Governance" 
                    value={mockScores.gov} 
                    icon={<Shield className="text-emerald-500" />} 
                    color="text-emerald-500"
                    trend="+12.0%"
                  />
                  <ScoreCard 
                    label="Data Integrity" 
                    value={mockScores.int} 
                    icon={<Activity className="text-blue-600" />} 
                    color="text-blue-600"
                    trend="0.0%"
                  />
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 bg-white rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Audited Tag Landscape
                      </h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: '0s', perf: 60, load: 20 },
                          { name: '1s', perf: 55, load: 30 },
                          { name: '2s', perf: 45, load: 60 },
                          { name: '3s', perf: 65, load: 40 },
                          { name: '4s', perf: 85, load: 25 },
                          { name: '5s', perf: 90, load: 15 },
                        ]}>
                          <defs>
                            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#1e293b' }}
                          />
                          <Area type="monotone" dataKey="perf" stroke="#2563EB" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-xl border border-zinc-200">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-zinc-900">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Critical Findings
                    </h3>
                    <div className="space-y-4">
                      <FindingItem 
                        type="error"
                        title="GA4 Purchase Payload Mismatch"
                        description="Transaction revenue '29.99' sent as string instead of numeric value in collect request."
                      />
                      <FindingItem 
                        type="warning"
                        title="Meta Pixel Blocking Main Thread"
                        description="connect.facebook.net executing 88ms task during critical hydration phase."
                      />
                      <FindingItem 
                        type="info"
                        title="Governance Violation"
                        description="Hotjar.com detected but not found in the approved Tag Management Policy list."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div 
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="relative w-96 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search requests, payloads, tid..."
                      className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <FilterButton label="All" active />
                    <FilterButton label="Analytics" />
                    <FilterButton label="Marketing" />
                    <FilterButton label="Blocked" />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredResults.map((tag) => (
                    tag.requests.map((req) => (
                      <RequestCard key={req.id} request={req} domain={tag.domain} />
                    ))
                  ))}
                  {filteredResults.every(t => t.requests.length === 0) && (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                      <Network className="w-12 h-12 opacity-10" />
                      <p className="font-sans text-sm font-medium uppercase tracking-widest">No matching payloads identified</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div 
                key="performance"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="p-8 bg-white rounded-xl border border-zinc-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-1 text-zinc-900 leading-none">Tag CPU Execution Time</h3>
                  <p className="text-zinc-500 text-sm mb-8">Execution profile of third-party scripts during initial page load.</p>
                  
                  <div className="space-y-10">
                    {audit.results.map((tag) => (
                      <div key={tag.domain} className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-zinc-700">{tag.domain}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded",
                            tag.totalBlockingTime > 50 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                          )}>{tag.totalBlockingTime}ms</span>
                        </div>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (tag.totalBlockingTime / 150) * 100)}%` }}
                            className={cn(
                              "h-full rounded-full transition-colors",
                              tag.totalBlockingTime > 50 ? "bg-red-500" : "bg-blue-600"
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] items-center gap-1 font-bold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-600 uppercase tracking-tighter">
                            -{tag.impactOnLCP}s LCP Improvement
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">Potential gain if blocked</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'governance' && (
              <motion.div 
                key="governance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-5">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">Governance Simulation</h4>
                    <p className="text-sm text-blue-800/70 leading-relaxed mt-1">
                      Toggle specific tag domains to simulate performance improvements. In production, this auditor operates at the service-worker level to perform proactive script blocking.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audit.results.map((tag) => (
                    <div key={tag.domain} className="p-5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          tag.blocked ? "bg-zinc-100 text-zinc-400" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {tag.blocked ? <Lock className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 leading-tight">{tag.domain}</p>
                          <p className="text-[11px] font-medium text-zinc-500">{tag.category.toUpperCase()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {tag.blocked && <span className="text-[10px] font-bold text-orange-600 uppercase">Blocked</span>}
                        <button 
                          onClick={() => toggleBlock(tag.domain)}
                          className={cn(
                            "w-10 h-6 border rounded-full relative transition-all duration-200",
                            tag.blocked 
                              ? "bg-zinc-200 border-zinc-300" 
                              : "bg-blue-600 border-blue-700"
                          )}
                        >
                          <motion.div 
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ left: tag.blocked ? '4px' : '20px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === 'research' && (
              <motion.div 
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Redis Card */}
                  <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        Redis Optimization
                      </h4>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">COST REDUCTION</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-extrabold text-zinc-900">{audit.architecture?.redis.costReduction}%</span>
                      <span className="text-xs text-zinc-400 font-medium mb-1.5">Efficiency Gain</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                        <span>Memory (Probabilistic)</span>
                        <span>{audit.architecture?.redis.memoryUsage}MB</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[60%]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      Utilizing HyperLogLog and Bloom Filters to estimate user uniques without expensive SET operations.
                    </p>
                  </div>

                  {/* Agent Card */}
                  <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        Agent Observability
                      </h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">TRACE CAPTURE</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-extrabold text-zinc-900">{audit.architecture?.agents.traceEfficiency}%</span>
                      <span className="text-xs text-zinc-400 font-medium mb-1.5">Trace Coverage</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-zinc-50 rounded-lg">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Detect Rate</p>
                        <p className="text-sm font-bold text-zinc-700">{audit.architecture?.agents.loopDetectionRate}%</p>
                      </div>
                      <div className="p-3 bg-zinc-50 rounded-lg">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Avg Steps</p>
                        <p className="text-sm font-bold text-zinc-700">{audit.architecture?.agents.averageSteps}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      Autonomous loop detection triggers system feedback if the generator enters a redundant tool-call pattern.
                    </p>
                  </div>

                  {/* Vector Card */}
                  <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        Vector DB Arch
                      </h4>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">HNSW INDEXING</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-extrabold text-zinc-900">{audit.architecture?.vector.searchLatency}ms</span>
                      <span className="text-xs text-zinc-400 font-medium mb-1.5">Avg Recall</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                        <span>Recall Precision</span>
                        <span>{audit.architecture?.vector.recallPrecision}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-[96%]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      Horizontal scaling using sharded vector search with pre-filtering on metadata collections.
                    </p>
                  </div>
                </div>

                {/* Strategy Impact Section */}
                <div className="p-8 bg-zinc-900 rounded-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                    <Code2 className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 space-y-6 max-w-2xl">
                    <h3 className="text-2xl font-bold tracking-tight">Systemic Governance Impact</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Optimizing the architectural layer has direct downstream effects on the tag governance engine. 
                      By reducing data processing latency via Vector search improvements, the auditor can block 
                      rogue scripts <span className="text-blue-400 font-bold">140ms faster</span> than industry average.
                    </p>
                    <div className="flex gap-4">
                      <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">Redis Pipeline Integration: Active</span>
                      </div>
                      <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">Agent Trace DAGs: Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  label: string;
  sub: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function NavButton({ active, label, sub, icon, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-0.5 px-4 py-3 rounded-lg transition-all text-left group",
        active 
          ? "bg-blue-50 text-blue-700 font-bold" 
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(
          "transition-colors",
          active ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600"
        )}>
          {icon}
        </span>
        <span className="text-sm mt-0.5">{label}</span>
      </div>
    </button>
  );
}

function ScoreCard({ label, value, icon, color, trend }: { label: string, value: number, icon: React.ReactNode, color: string, trend: string }) {
  return (
    <div className="p-8 bg-white rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-zinc-100 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-3">
          <span className={cn("text-4xl font-extrabold tracking-tighter leading-none text-zinc-900", color)}>{value}%</span>
          <div className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 border border-emerald-100">
            {trend}
          </div>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full mt-6 overflow-hidden">
        <motion.div 
          className={cn("h-full", color.replace('text', 'bg'))}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function FindingItem({ type, title, description }: { type: 'error' | 'warning' | 'info', title: string, description: string }) {
  return (
    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex gap-4 transition-all hover:bg-zinc-100/50">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm",
        type === 'error' ? "bg-red-50 text-red-600" :
        type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
      )}>
        {type === 'error' && <XCircle className="w-5 h-5" />}
        {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
        {type === 'info' && <CheckCircle2 className="w-5 h-5" />}
      </div>
      
      <div>
        <p className="text-sm font-bold text-zinc-900 mb-1">{title}</p>
        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

function RequestCard({ request, domain }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden group hover:border-blue-200 transition-all shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={cn(
            "w-4 h-4 rounded-full",
            request.status === 'validated' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
            request.status === 'error' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" : "bg-zinc-300"
          )} />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-900">{request.name}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase py-0.5 rounded border border-zinc-100 px-1.5 flex items-center h-4">POST</span>
            </div>
            <span className="text-xs text-zinc-400 hover:text-blue-600 transition-colors font-medium truncate max-w-sm">{domain}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Size</p>
            <p className="text-xs font-bold text-zinc-600">{(request.size / 1024).toFixed(1)} KB</p>
          </div>
          <div className={cn(
            "p-1.5 rounded-full bg-zinc-50 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600",
            expanded && "rotate-90 bg-blue-100 text-blue-700"
          )}>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-zinc-50 border-t border-zinc-100"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Network Path
                </h4>
                <div className="p-4 bg-white rounded-lg border border-zinc-200 font-mono text-[11px] break-all text-zinc-600 leading-relaxed shadow-inner">
                  {request.url}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5" /> Decompiled Object
                </h4>
                <div className="p-4 bg-white rounded-lg border border-zinc-200 overflow-x-auto shadow-inner">
                  <pre className="text-[11px] font-mono text-blue-700/90 whitespace-pre-wrap">
                    {JSON.stringify(request.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={cn(
      "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
      active 
        ? "bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-200" 
        : "text-zinc-500 hover:text-zinc-900 bg-white border-zinc-200 hover:border-zinc-300"
    )}>
      {label}
    </button>
  );
}
