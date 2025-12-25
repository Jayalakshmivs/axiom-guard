import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  Shield, 
  FileCheck, 
  Play, 
  ArrowLeft,
  Upload,
  Folder,
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  Trash2,
  XCircle,
  RefreshCw,
  StopCircle,
  FileWarning,
  Eye
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/StatusIndicator";
import ScanProgress from "@/components/ScanProgress";
import { toast } from "@/hooks/use-toast";
import { 
  ransomwareApi, 
  generateRandomThreat,
  type VaultFile, 
  type ThreatEvent, 
  type IntegrityResult,
  type SimulationResult,
  type EncryptionCheckResult
} from "@/services/api";

const AntiRansomware = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vault" | "monitor" | "integrity" | "simulator">("vault");
  
  // Vault state
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(191.8);
  const [storageTotal] = useState(5120);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor state
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [monitorStats, setMonitorStats] = useState({
    filesMonitored: 1284,
    threatsBlocked: 12,
    lastScan: '2m ago'
  });
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Integrity state
  const [integrityResults, setIntegrityResults] = useState<IntegrityResult[]>([]);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [integrityProgress, setIntegrityProgress] = useState(0);
  const [integrityStats, setIntegrityStats] = useState({
    verifiedFiles: 1284,
    modifiedFiles: 0,
    lastCheck: '2 hours ago'
  });

  // Simulator state
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Encryption check state
  const [encryptionResult, setEncryptionResult] = useState<EncryptionCheckResult | null>(null);
  const [isCheckingEncryption, setIsCheckingEncryption] = useState(false);
  const encryptionFileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "vault", label: "Secure Vault", icon: Lock },
    { id: "monitor", label: "Threat Monitor", icon: Shield },
    { id: "integrity", label: "Integrity Check", icon: FileCheck },
    { id: "simulator", label: "Simulator", icon: Play },
  ];

  // Initialize vault files
  useEffect(() => {
    const initialFiles: VaultFile[] = [
      { id: '1', name: "Financial_Report_2024.pdf", size: "2.4 MB", sizeBytes: 2516582, date: "Dec 10, 2024", encrypted: true, hash: "A3F2B1C8" },
      { id: '2', name: "Project_Contracts.zip", size: "15.7 MB", sizeBytes: 16464076, date: "Dec 9, 2024", encrypted: true, hash: "D7E4F9A2" },
      { id: '3', name: "Personal_Documents", size: "45.2 MB", sizeBytes: 47395430, date: "Dec 8, 2024", isFolder: true, encrypted: true, hash: "B9C3E5F1" },
      { id: '4', name: "Backup_Images.tar", size: "128.5 MB", sizeBytes: 134742016, date: "Dec 7, 2024", encrypted: true, hash: "F1A8D3C6" },
    ];
    setVaultFiles(initialFiles);
    
    // Initial threats
    setThreats([
      { id: '1', name: "Suspicious process detected", level: "warning", time: "10 min ago", timestamp: Date.now() - 600000, resolved: false },
      { id: '2', name: "Unauthorized file encryption attempt", level: "danger", time: "2 hours ago", timestamp: Date.now() - 7200000, resolved: true },
      { id: '3', name: "Unknown application access blocked", level: "warning", time: "1 day ago", timestamp: Date.now() - 86400000, resolved: true },
    ]);
  }, []);

  // Real-time monitoring
  useEffect(() => {
    if (isMonitoring && activeTab === 'monitor') {
      monitorIntervalRef.current = setInterval(() => {
        // Randomly add new threat (20% chance every 5 seconds)
        if (Math.random() < 0.2) {
          const newThreat = generateRandomThreat();
          setThreats(prev => [newThreat, ...prev].slice(0, 20));
          setMonitorStats(prev => ({
            ...prev,
            threatsBlocked: prev.threatsBlocked + 1,
            lastScan: 'Just now'
          }));
          
          toast({
            title: newThreat.level === 'danger' ? "⚠️ Threat Detected!" : "Alert",
            description: newThreat.name,
            variant: newThreat.level === 'danger' ? "destructive" : "default",
          });
        } else {
          setMonitorStats(prev => ({
            ...prev,
            filesMonitored: prev.filesMonitored + Math.floor(Math.random() * 3),
            lastScan: 'Just now'
          }));
        }
      }, 5000);
    }

    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
    };
  }, [isMonitoring, activeTab]);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      try {
        const uploadedFile = await ransomwareApi.vault.uploadFile(file);
        setVaultFiles(prev => [uploadedFile, ...prev]);
        setStorageUsed(prev => prev + (file.size / (1024 * 1024)));
        
        toast({
          title: "File Encrypted & Added",
          description: `${file.name} has been securely stored in the vault.`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete file handler
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await ransomwareApi.vault.deleteFile(fileId);
      setVaultFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: "File Removed",
        description: `${fileName} has been removed from the vault.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to remove file from vault.",
        variant: "destructive",
      });
    }
  };

  // Resolve threat handler
  const handleResolveThreat = async (threatId: string) => {
    try {
      await ransomwareApi.monitor.resolveThread(threatId);
      setThreats(prev => prev.map(t => 
        t.id === threatId ? { ...t, resolved: true } : t
      ));
      toast({
        title: "Threat Resolved",
        description: "The threat has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve threat.",
        variant: "destructive",
      });
    }
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
    toast({
      title: isMonitoring ? "Monitoring Paused" : "Monitoring Active",
      description: isMonitoring 
        ? "Real-time threat detection has been paused."
        : "Real-time threat detection is now active.",
    });
  };

  // Integrity check handler
  const handleIntegrityCheck = useCallback(async () => {
    setIsCheckingIntegrity(true);
    setIntegrityProgress(0);
    setIntegrityResults([]);

    const totalFiles = integrityStats.verifiedFiles;
    let checked = 0;
    const results: IntegrityResult[] = [];

    const checkInterval = setInterval(() => {
      checked += Math.floor(Math.random() * 50) + 20;
      if (checked >= totalFiles) {
        checked = totalFiles;
        clearInterval(checkInterval);
      }
      
      setIntegrityProgress(Math.round((checked / totalFiles) * 100));

      // Simulate finding files
      if (Math.random() < 0.3 && results.length < 10) {
        const statuses: Array<'verified' | 'modified'> = ['verified', 'verified', 'verified', 'verified', 'modified'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        results.push({
          fileId: `file_${Date.now()}_${results.length}`,
          fileName: `file_${results.length + 1}.${['pdf', 'docx', 'xlsx', 'zip'][Math.floor(Math.random() * 4)]}`,
          status,
          originalHash: generateRandomHash(),
          currentHash: status === 'modified' ? generateRandomHash() : results[results.length - 1]?.originalHash || generateRandomHash(),
          lastChecked: new Date().toISOString(),
        });
        setIntegrityResults([...results]);
      }
    }, 150);

    // Complete check
    setTimeout(() => {
      clearInterval(checkInterval);
      setIntegrityProgress(100);
      setIsCheckingIntegrity(false);
      
      const modifiedCount = results.filter(r => r.status === 'modified').length;
      setIntegrityStats({
        verifiedFiles: totalFiles - modifiedCount,
        modifiedFiles: modifiedCount,
        lastCheck: 'Just now'
      });

      toast({
        title: "Integrity Check Complete",
        description: modifiedCount > 0 
          ? `Found ${modifiedCount} modified file(s)!`
          : "All files verified successfully.",
        variant: modifiedCount > 0 ? "destructive" : "default",
      });
    }, 5000);
  }, [integrityStats.verifiedFiles]);

  // Simulation handler
  const handleStartSimulation = useCallback(async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setEncryptionResult(null);
    
    const sim: SimulationResult = {
      id: `sim_${Date.now()}`,
      status: 'running',
      progress: 0,
      vulnerabilitiesFound: 0,
      details: [],
      startTime: new Date().toISOString(),
    };
    setSimulation(sim);

    const logs = [
      "🔄 Initializing sandbox environment...",
      "✅ Sandbox isolated from main system",
      "🔄 Loading ransomware signatures...",
      "✅ Loaded 1,247 known ransomware patterns",
      "🔄 Starting encryption simulation...",
      "⚠️ Simulated encryption attempt detected",
      "🛡️ Defense mechanism triggered",
      "✅ Encryption attempt blocked",
      "🔄 Testing file system monitoring...",
      "⚠️ Suspicious registry modification detected",
      "🛡️ Registry protection activated",
      "✅ Modification prevented",
      "🔄 Analyzing system vulnerabilities...",
      "📊 Generating security report...",
      "✅ Simulation complete!",
    ];

    let logIndex = 0;
    let progress = 0;
    let vulnerabilities = 0;

    simulationIntervalRef.current = setInterval(() => {
      if (logIndex < logs.length) {
        setSimulationLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
        progress = Math.round((logIndex / logs.length) * 100);
        
        // Randomly find vulnerabilities
        if (logs[logIndex - 1]?.includes('⚠️') && Math.random() < 0.5) {
          vulnerabilities++;
        }

        setSimulation(prev => prev ? {
          ...prev,
          progress,
          vulnerabilitiesFound: vulnerabilities,
        } : null);
      } else {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        setIsSimulating(false);
        setSimulation(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          endTime: new Date().toISOString(),
        } : null);

        toast({
          title: "Simulation Complete",
          description: `Found ${vulnerabilities} potential vulnerabilities.`,
        });
      }
    }, 800);
  }, []);

  // Stop simulation
  const handleStopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setIsSimulating(false);
    setSimulation(prev => prev ? { ...prev, status: 'completed' } : null);
    toast({
      title: "Simulation Stopped",
      description: "The simulation has been terminated.",
    });
  };

  // Encryption check handler
  const handleEncryptionCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsCheckingEncryption(true);
    setEncryptionResult(null);

    try {
      // Simulate checking delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await ransomwareApi.encryption.checkFile(file);
      setEncryptionResult(result);

      toast({
        title: result.isEncrypted ? "⚠️ Encryption Detected!" : "✅ File is Safe",
        description: result.details,
        variant: result.isEncrypted ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to analyze file for encryption.",
        variant: "destructive",
      });
    }

    setIsCheckingEncryption(false);
    if (encryptionFileInputRef.current) {
      encryptionFileInputRef.current.value = '';
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const renderVault = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Encrypted Files</h3>
          <p className="text-sm text-muted-foreground">Your protected documents</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
          <Button 
            variant="cyber" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Add Files'}
          </Button>
        </div>
      </div>

      {isUploading && (
        <ScanProgress 
          progress={uploadProgress} 
          status="scanning" 
          label="Encrypting and uploading files..." 
        />
      )}

      <div className="space-y-3">
        {vaultFiles.length === 0 ? (
          <div className="p-8 rounded-xl border-2 border-dashed border-border/50 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No files in vault. Click "Add Files" to get started.</p>
          </div>
        ) : (
          vaultFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {file.isFolder ? (
                  <Folder className="w-5 h-5 text-warning" />
                ) : (
                  <Lock className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.size} • {file.date} • Hash: {file.hash}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status="active" size="sm" pulse={false} />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteFile(file.id, file.name)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <p className="font-medium text-accent">Vault Storage</p>
            <p className="text-sm text-muted-foreground">
              {storageUsed.toFixed(1)} MB used of {(storageTotal / 1024).toFixed(0)} GB
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-500" 
            style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderMonitor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Real-time Monitoring</h3>
          <p className="text-sm text-muted-foreground">Active threat detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusIndicator status={isMonitoring ? "active" : "inactive"} pulse={isMonitoring} />
            <span className={`text-sm ${isMonitoring ? 'text-accent' : 'text-muted-foreground'}`}>
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleMonitoring}>
            {isMonitoring ? (
              <>
                <StopCircle className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Files Monitored", value: monitorStats.filesMonitored.toLocaleString(), color: "text-primary" },
          { label: "Threats Blocked", value: monitorStats.threatsBlocked.toString(), color: "text-destructive" },
          { label: "Last Scan", value: monitorStats.lastScan, color: "text-accent" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Recent Activity</h4>
          {isMonitoring && (
            <span className="text-xs text-accent animate-pulse">● Live</span>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {threats.map((threat) => (
            <div
              key={threat.id}
              className={`flex items-center justify-between p-4 rounded-xl bg-secondary/30 animate-fade-in-up ${
                !threat.resolved && threat.level === 'danger' ? 'border border-destructive/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <StatusIndicator
                  status={threat.level === "danger" ? "danger" : threat.level === "warning" ? "warning" : "active"}
                  size="sm"
                  pulse={!threat.resolved}
                />
                <div>
                  <p className="font-medium">{threat.name}</p>
                  <p className="text-xs text-muted-foreground">{threat.time}</p>
                </div>
              </div>
              {threat.resolved ? (
                <span className="text-xs text-accent flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleResolveThreat(threat.id)}>
                  <Eye className="w-3 h-3 mr-1" />
                  Review
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">File Integrity Check</h3>
          <p className="text-sm text-muted-foreground">Verify file authenticity</p>
        </div>
        <Button 
          variant="cyber" 
          onClick={handleIntegrityCheck}
          disabled={isCheckingIntegrity}
        >
          {isCheckingIntegrity ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Run Check
            </>
          )}
        </Button>
      </div>

      {isCheckingIntegrity ? (
        <div className="space-y-4">
          <ScanProgress 
            progress={integrityProgress} 
            status="scanning" 
            label={`Verifying files... ${integrityProgress}%`}
          />
          
          {integrityResults.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {integrityResults.map((result) => (
                <div 
                  key={result.fileId}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    result.status === 'modified' ? 'bg-destructive/10' : 'bg-secondary/30'
                  }`}
                >
                  {result.status === 'verified' ? (
                    <CheckCircle className="w-4 h-4 text-accent" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm">{result.fileName}</span>
                  <span className={`text-xs ml-auto ${
                    result.status === 'modified' ? 'text-destructive' : 'text-accent'
                  }`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl border-2 border-dashed border-border/50 text-center">
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium mb-2">Last integrity check: {integrityStats.lastCheck}</p>
          <p className="text-sm text-muted-foreground">
            All {integrityStats.verifiedFiles.toLocaleString()} files verified successfully
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="font-medium">Verified Files</span>
          </div>
          <p className="text-2xl font-bold text-accent">{integrityStats.verifiedFiles.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="font-medium">Modified</span>
          </div>
          <p className="text-2xl font-bold text-warning">{integrityStats.modifiedFiles}</p>
        </div>
      </div>

      {/* Upload file for encryption check */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <FileWarning className="w-5 h-5 text-warning" />
          Check File for Ransomware Encryption
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a file to check if it has been encrypted by ransomware.
        </p>
        <input
          ref={encryptionFileInputRef}
          type="file"
          onChange={handleEncryptionCheck}
          className="hidden"
          accept="*/*"
        />
        <Button 
          variant="outline" 
          onClick={() => encryptionFileInputRef.current?.click()}
          disabled={isCheckingEncryption}
        >
          {isCheckingEncryption ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File to Check
            </>
          )}
        </Button>

        {encryptionResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            encryptionResult.isEncrypted ? 'bg-destructive/10 border border-destructive/30' : 'bg-accent/10 border border-accent/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {encryptionResult.isEncrypted ? (
                <XCircle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle className="w-5 h-5 text-accent" />
              )}
              <span className="font-medium">
                {encryptionResult.fileName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{encryptionResult.details}</p>
            {encryptionResult.encryptionType && (
              <p className="text-xs text-destructive mt-2">
                Encryption Type: {encryptionResult.encryptionType}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSimulator = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="font-medium text-warning">Sandbox Environment</p>
            <p className="text-sm text-muted-foreground">
              Simulations run in isolated environment. No actual files are affected.
            </p>
          </div>
        </div>
      </div>

      {!isSimulating && !simulation?.status ? (
        <div className="text-center py-8">
          <Play className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="font-display text-lg font-semibold mb-2">Ransomware Attack Simulator</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Test your system's defenses against simulated ransomware attacks to identify vulnerabilities.
          </p>
          <Button variant="cyber" size="lg" onClick={handleStartSimulation}>
            <Play className="w-5 h-5 mr-2" />
            Start Simulation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Simulation Progress</h4>
            {isSimulating && (
              <Button variant="destructive" size="sm" onClick={handleStopSimulation}>
                <StopCircle className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          <ScanProgress 
            progress={simulation?.progress || 0} 
            status={isSimulating ? "scanning" : simulation?.status === 'completed' ? "complete" : "error"} 
            label={isSimulating ? "Running simulation..." : "Simulation complete"}
          />

          {/* Live Logs */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/50 max-h-[250px] overflow-y-auto font-mono text-sm">
            {simulationLogs.map((log, index) => (
              <div 
                key={index} 
                className="py-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {log}
              </div>
            ))}
            {isSimulating && (
              <div className="py-1 text-muted-foreground animate-pulse">
                ▌
              </div>
            )}
          </div>

          {simulation?.status === 'completed' && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/30">
              <div>
                <p className="font-medium text-accent">Simulation Complete</p>
                <p className="text-sm text-muted-foreground">
                  Found {simulation.vulnerabilitiesFound} potential vulnerabilities
                </p>
              </div>
              <Button variant="cyber" onClick={handleStartSimulation}>
                Run Again
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Simulations Run", value: "15" },
          { label: "Vulnerabilities Found", value: simulation?.vulnerabilitiesFound.toString() || "2" },
          { label: "Success Rate", value: "100%" },
          { label: "Last Test", value: simulation?.status === 'completed' ? 'Just now' : "3 days ago" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SecurityHeader isLoggedIn onLogout={() => navigate("/")} />

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="glass-card p-6 mb-8 animate-fade-in-up animation-delay-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Anti-Ransomware Shield</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status="active" size="sm" />
                <span className="text-sm text-accent">Protection Active</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Protect your files with encrypted vault storage, real-time monitoring, and integrity verification.
          </p>
        </div>

        <div className="glass-card mb-8 animate-fade-in-up animation-delay-200">
          <div className="flex border-b border-border/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "vault" && renderVault()}
            {activeTab === "monitor" && renderMonitor()}
            {activeTab === "integrity" && renderIntegrity()}
            {activeTab === "simulator" && renderSimulator()}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function
function generateRandomHash(): string {
  return Array.from({ length: 8 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('').toUpperCase();
}

export default AntiRansomware;
