import { AuditSnapshot, TagAuditResult, TagNetworkRequest } from '../types';

export const generateMockAudit = (url: string): AuditSnapshot => {
  const tags: TagAuditResult[] = [
    {
      domain: 'google-analytics.com',
      category: 'analytics',
      blocked: false,
      totalBlockingTime: 45,
      impactOnLCP: 0.2,
      impactOnTBT: 120,
      requests: [
        {
          id: 'ga-1',
          name: 'collect',
          url: 'https://www.google-analytics.com/g/collect?v=2&tid=G-12345&cid=67890&en=page_view&_p=1102',
          initiator: 'gtag.js',
          timestamp: Date.now() - 5000,
          status: 'validated',
          size: 1024,
          blockingTime: 12,
          payload: {
            trackingId: 'G-12345',
            event: 'page_view',
            client_id: '67890',
            dl: url,
            dt: 'The Local Auditor - Dashboard'
          }
        },
        {
          id: 'ga-2',
          name: 'purchase',
          url: 'https://www.google-analytics.com/g/collect?v=2&tid=G-12345&en=purchase&pr1=id123~nmProduct~pr29.99',
          initiator: 'gtag.js',
          timestamp: Date.now() - 2000,
          status: 'error',
          size: 2048,
          blockingTime: 33,
          payload: {
            event: 'purchase',
            transaction_id: 'T123',
            value: 29.99,
            items: [
              { item_id: 'id123', item_name: 'Product', price: 29.99 }
            ]
          }
        }
      ]
    },
    {
      domain: 'connect.facebook.net',
      category: 'marketing',
      blocked: false,
      totalBlockingTime: 88,
      impactOnLCP: 0.4,
      impactOnTBT: 250,
      requests: [
        {
          id: 'fb-1',
          name: 'fbevents.js',
          url: 'https://connect.facebook.net/en_US/fbevents.js',
          initiator: 'script',
          timestamp: Date.now() - 6000,
          status: 'sent',
          size: 85000,
          blockingTime: 88,
          payload: {}
        }
      ]
    },
    {
      domain: 'hotjar.com',
      category: 'analytics',
      blocked: true,
      totalBlockingTime: 12,
      impactOnLCP: 0.1,
      impactOnTBT: 50,
      requests: []
    }
  ];

  return {
    id: 'audit-' + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    url,
    results: tags,
    scores: {
      performance: 82,
      governance: 65,
      integrity: 91
    },
    architecture: {
      redis: {
        costReduction: 42,
        memoryUsage: 256,
        probabilisticSavings: 68
      },
      agents: {
        traceEfficiency: 94,
        loopDetectionRate: 99.8,
        averageSteps: 4.2
      },
      vector: {
        searchLatency: 12,
        recallPrecision: 96.5,
        indexSize: 1024
      }
    }
  };
};

export const getRealResources = (): TagAuditResult[] => {
  if (typeof window === 'undefined') return [];
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const domains = new Map<string, PerformanceResourceTiming[]>();
  
  resources.forEach(r => {
    try {
      const url = new URL(r.name);
      const domain = url.hostname;
      if (!domains.has(domain)) domains.set(domain, []);
      domains.get(domain)!.push(r);
    } catch (e) {
      // invalid url
    }
  });

  return Array.from(domains.entries()).map(([domain, entries]) => {
    const isAnalytics = domain.includes('google') || domain.includes('analytics') || domain.includes('fb');
    return {
      domain,
      category: isAnalytics ? 'analytics' : 'performance',
      blocked: false,
      totalBlockingTime: Math.round(entries.reduce((acc, r) => acc + (r.duration || 0), 0) / 10),
      impactOnLCP: 0,
      impactOnTBT: 0,
      requests: entries.slice(0, 3).map((r, i) => ({
        id: `real-${domain}-${i}`,
        name: r.name.split('/').pop() || 'resource',
        url: r.name,
        initiator: r.initiatorType,
        timestamp: Date.now() - (performance.now() - r.startTime),
        status: 'sent',
        size: r.transferSize || 0,
        blockingTime: Math.round(r.duration / 5),
        payload: {
          initiator: r.initiatorType,
          duration: `${r.duration.toFixed(2)}ms`,
          size: `${(r.transferSize / 1024).toFixed(2)}KB`,
          protocol: r.nextHopProtocol
        }
      }))
    };
  });
};
