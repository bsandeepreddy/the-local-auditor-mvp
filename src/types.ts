export interface TagNetworkRequest {
  id: string;
  name: string;
  url: string;
  initiator: string;
  timestamp: number;
  status: 'sent' | 'blocked' | 'validated' | 'error';
  payload: Record<string, any>;
  blockingTime: number; // ms
  size: number; // bytes
}

export interface TagAuditResult {
  domain: string;
  category: 'analytics' | 'marketing' | 'performance' | 'security';
  blocked: boolean;
  requests: TagNetworkRequest[];
  totalBlockingTime: number;
  impactOnLCP: number; // calculated impact in seconds
  impactOnTBT: number; // calculated impact in ms
}

export interface ArchitectureMetrics {
  redis: {
    costReduction: number; // percentage
    memoryUsage: number; // MB
    probabilisticSavings: number; // percentage
  };
  agents: {
    traceEfficiency: number; // percentage
    loopDetectionRate: number; // percentage
    averageSteps: number;
  };
  vector: {
    searchLatency: number; // ms
    recallPrecision: number; // percentage
    indexSize: number; // MB
  };
}

export interface AuditSnapshot {
  id: string;
  timestamp: number;
  url: string;
  results: TagAuditResult[];
  scores: {
    performance: number;
    governance: number;
    integrity: number;
  };
  architecture?: ArchitectureMetrics;
}
