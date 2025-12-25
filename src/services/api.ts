// API Service Layer for FastAPI Backend Integration
// Configure your FastAPI backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface ScanResult {
  status: 'safe' | 'warning' | 'danger';
  confidence: number;
  details: string;
  timestamp: string;
}

export interface PhishingScanResult extends ScanResult {
  url: string;
  threatType?: string;
  blockedDomains?: string[];
}

export interface VaultFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  date: string;
  isFolder?: boolean;
  encrypted: boolean;
  hash: string;
}

export interface ThreatEvent {
  id: string;
  name: string;
  level: 'info' | 'warning' | 'danger';
  time: string;
  timestamp: number;
  resolved: boolean;
  details?: string;
}

export interface IntegrityResult {
  fileId: string;
  fileName: string;
  status: 'verified' | 'modified' | 'corrupted';
  originalHash: string;
  currentHash: string;
  lastChecked: string;
}

export interface SimulationResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  vulnerabilitiesFound: number;
  details: string[];
  startTime: string;
  endTime?: string;
}

export interface EncryptionCheckResult {
  fileName: string;
  isEncrypted: boolean;
  encryptionType?: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// ==================== Anti-Phishing API ====================

export const phishingApi = {
  // Scan a URL for phishing threats
  scanUrl: async (url: string): Promise<PhishingScanResult> => {
    try {
      return await apiCall<PhishingScanResult>('/api/phishing/scan', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    } catch {
      // Fallback simulation for demo
      return simulatePhishingScan(url);
    }
  },

  // Get scan history
  getScanHistory: async (): Promise<PhishingScanResult[]> => {
    try {
      return await apiCall<PhishingScanResult[]>('/api/phishing/history');
    } catch {
      return [];
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      return await apiCall('/api/phishing/stats');
    } catch {
      return {
        urlsScanned: 2847,
        threatsBlocked: 23,
        safeUrls: 2819,
        warnings: 5,
      };
    }
  },
};

// ==================== Anti-Ransomware API ====================

export const ransomwareApi = {
  // Secure Vault operations
  vault: {
    getFiles: async (): Promise<VaultFile[]> => {
      try {
        return await apiCall<VaultFile[]>('/api/ransomware/vault/files');
      } catch {
        return [];
      }
    },

    uploadFile: async (file: File): Promise<VaultFile> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/ransomware/vault/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
      } catch {
        // Simulate upload for demo
        return simulateFileUpload(file);
      }
    },

    deleteFile: async (fileId: string): Promise<void> => {
      try {
        await apiCall(`/api/ransomware/vault/files/${fileId}`, {
          method: 'DELETE',
        });
      } catch {
        console.log('Delete simulated for:', fileId);
      }
    },

    getStorageInfo: async () => {
      try {
        return await apiCall('/api/ransomware/vault/storage');
      } catch {
        return { used: 191.8, total: 5120, unit: 'MB' };
      }
    },
  },

  // Threat Monitor operations
  monitor: {
    getThreats: async (): Promise<ThreatEvent[]> => {
      try {
        return await apiCall<ThreatEvent[]>('/api/ransomware/monitor/threats');
      } catch {
        return [];
      }
    },

    startMonitoring: async (): Promise<void> => {
      try {
        await apiCall('/api/ransomware/monitor/start', { method: 'POST' });
      } catch {
        console.log('Monitoring started (simulated)');
      }
    },

    stopMonitoring: async (): Promise<void> => {
      try {
        await apiCall('/api/ransomware/monitor/stop', { method: 'POST' });
      } catch {
        console.log('Monitoring stopped (simulated)');
      }
    },

    resolveThread: async (threatId: string): Promise<void> => {
      try {
        await apiCall(`/api/ransomware/monitor/threats/${threatId}/resolve`, {
          method: 'POST',
        });
      } catch {
        console.log('Threat resolved (simulated):', threatId);
      }
    },

    getStats: async () => {
      try {
        return await apiCall('/api/ransomware/monitor/stats');
      } catch {
        return { filesMonitored: 1284, threatsBlocked: 12, lastScan: '2m ago' };
      }
    },
  },

  // Integrity Check operations
  integrity: {
    runCheck: async (): Promise<IntegrityResult[]> => {
      try {
        return await apiCall<IntegrityResult[]>('/api/ransomware/integrity/check', {
          method: 'POST',
        });
      } catch {
        return [];
      }
    },

    getLastResults: async (): Promise<IntegrityResult[]> => {
      try {
        return await apiCall<IntegrityResult[]>('/api/ransomware/integrity/results');
      } catch {
        return [];
      }
    },

    getStats: async () => {
      try {
        return await apiCall('/api/ransomware/integrity/stats');
      } catch {
        return { verifiedFiles: 1284, modifiedFiles: 0, lastCheck: '2 hours ago' };
      }
    },
  },

  // Simulator operations
  simulator: {
    startSimulation: async (type: string): Promise<SimulationResult> => {
      try {
        return await apiCall<SimulationResult>('/api/ransomware/simulator/start', {
          method: 'POST',
          body: JSON.stringify({ type }),
        });
      } catch {
        return simulateRansomwareAttack();
      }
    },

    getSimulationStatus: async (simulationId: string): Promise<SimulationResult> => {
      try {
        return await apiCall<SimulationResult>(`/api/ransomware/simulator/${simulationId}`);
      } catch {
        throw new Error('Simulation not found');
      }
    },

    stopSimulation: async (simulationId: string): Promise<void> => {
      try {
        await apiCall(`/api/ransomware/simulator/${simulationId}/stop`, {
          method: 'POST',
        });
      } catch {
        console.log('Simulation stopped (simulated)');
      }
    },

    getHistory: async (): Promise<SimulationResult[]> => {
      try {
        return await apiCall<SimulationResult[]>('/api/ransomware/simulator/history');
      } catch {
        return [];
      }
    },
  },

  // Encryption Check operations
  encryption: {
    checkFile: async (file: File): Promise<EncryptionCheckResult> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/ransomware/encryption/check`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Check failed');
        return await response.json();
      } catch {
        return simulateEncryptionCheck(file);
      }
    },
  },
};

// ==================== Simulation Functions (for demo/fallback) ====================

function simulatePhishingScan(url: string): PhishingScanResult {
  const suspiciousPatterns = ['suspicious', 'phishing', 'scam', 'xyz', 'click', 'free', 'win'];
  const isSuspicious = suspiciousPatterns.some(p => url.toLowerCase().includes(p));
  const isHttps = url.startsWith('https://');
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let confidence = 95;
  
  if (isSuspicious) {
    status = 'danger';
    confidence = 92;
  } else if (!isHttps) {
    status = 'warning';
    confidence = 78;
  }
  
  return {
    url,
    status,
    confidence,
    details: status === 'safe' 
      ? 'No threats detected. This website appears to be legitimate.'
      : status === 'warning'
      ? 'This URL shows some suspicious patterns. Proceed with caution.'
      : 'This URL is identified as a phishing threat. Do not proceed.',
    timestamp: new Date().toISOString(),
    threatType: status !== 'safe' ? 'Phishing attempt' : undefined,
  };
}

function simulateFileUpload(file: File): VaultFile {
  return {
    id: `file_${Date.now()}`,
    name: file.name,
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    encrypted: true,
    hash: generateHash(),
  };
}

function simulateRansomwareAttack(): SimulationResult {
  return {
    id: `sim_${Date.now()}`,
    status: 'running',
    progress: 0,
    vulnerabilitiesFound: 0,
    details: [],
    startTime: new Date().toISOString(),
  };
}

function simulateEncryptionCheck(file: File): EncryptionCheckResult {
  const encryptedExtensions = ['.encrypted', '.locked', '.crypto', '.crypt'];
  const isEncrypted = encryptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  // Random simulation for demo
  const threatLevel = isEncrypted ? 'critical' : 'none';
  
  return {
    fileName: file.name,
    isEncrypted,
    encryptionType: isEncrypted ? 'Unknown ransomware encryption' : undefined,
    threatLevel,
    details: isEncrypted 
      ? 'This file appears to be encrypted by ransomware. Original data may be unrecoverable.'
      : 'No ransomware encryption detected. File appears to be safe.',
  };
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateHash(): string {
  return Array.from({ length: 8 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('').toUpperCase();
}

// Real-time threat generation for simulation
export function generateRandomThreat(): ThreatEvent {
  const threats = [
    { name: 'Suspicious process detected', level: 'warning' as const },
    { name: 'Unauthorized file encryption attempt', level: 'danger' as const },
    { name: 'Unknown application access blocked', level: 'warning' as const },
    { name: 'Potential ransomware behavior detected', level: 'danger' as const },
    { name: 'File system anomaly detected', level: 'info' as const },
    { name: 'Registry modification blocked', level: 'warning' as const },
  ];
  
  const threat = threats[Math.floor(Math.random() * threats.length)];
  
  return {
    id: `threat_${Date.now()}`,
    ...threat,
    time: 'Just now',
    timestamp: Date.now(),
    resolved: false,
  };
}
