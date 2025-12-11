import { useState } from "react";
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
  HardDrive
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/StatusIndicator";
import { toast } from "@/hooks/use-toast";

const AntiRansomware = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vault" | "monitor" | "integrity" | "simulator">("vault");

  const tabs = [
    { id: "vault", label: "Secure Vault", icon: Lock },
    { id: "monitor", label: "Threat Monitor", icon: Shield },
    { id: "integrity", label: "Integrity Check", icon: FileCheck },
    { id: "simulator", label: "Simulator", icon: Play },
  ];

  const vaultFiles = [
    { name: "Financial_Report_2024.pdf", size: "2.4 MB", date: "Dec 10, 2024" },
    { name: "Project_Contracts.zip", size: "15.7 MB", date: "Dec 9, 2024" },
    { name: "Personal_Documents", size: "45.2 MB", date: "Dec 8, 2024", isFolder: true },
    { name: "Backup_Images.tar", size: "128.5 MB", date: "Dec 7, 2024" },
  ];

  const threats = [
    { name: "Suspicious process detected", level: "warning", time: "10 min ago", resolved: false },
    { name: "Unauthorized file encryption attempt", level: "danger", time: "2 hours ago", resolved: true },
    { name: "Unknown application access blocked", level: "warning", time: "1 day ago", resolved: true },
  ];

  const handleSimulation = () => {
    toast({
      title: "Simulation Started",
      description: "Running ransomware attack simulation in sandbox environment...",
    });
  };

  const renderVault = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Encrypted Files</h3>
          <p className="text-sm text-muted-foreground">Your protected documents</p>
        </div>
        <Button variant="cyber">
          <Upload className="w-4 h-4 mr-2" />
          Add Files
        </Button>
      </div>

      <div className="space-y-3">
        {vaultFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {file.isFolder ? (
                <Folder className="w-5 h-5 text-warning" />
              ) : (
                <Lock className="w-5 h-5 text-accent" />
              )}
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
              </div>
            </div>
            <StatusIndicator status="active" size="sm" pulse={false} />
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-accent" />
          <div>
            <p className="font-medium text-accent">Vault Storage</p>
            <p className="text-sm text-muted-foreground">191.8 MB used of 5 GB</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-[4%] bg-accent rounded-full" />
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
        <div className="flex items-center gap-2">
          <StatusIndicator status="active" />
          <span className="text-sm text-accent">Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Files Monitored", value: "1,284", color: "text-primary" },
          { label: "Threats Blocked", value: "12", color: "text-destructive" },
          { label: "Last Scan", value: "2m ago", color: "text-accent" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Recent Activity</h4>
        {threats.map((threat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
          >
            <div className="flex items-center gap-3">
              <StatusIndicator
                status={threat.level === "danger" ? "danger" : "warning"}
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
              <Button variant="outline" size="sm">
                Review
              </Button>
            )}
          </div>
        ))}
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
        <Button variant="cyber">
          <Activity className="w-4 h-4 mr-2" />
          Run Check
        </Button>
      </div>

      <div className="p-6 rounded-xl border-2 border-dashed border-border/50 text-center">
        <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="font-medium mb-2">Last integrity check: 2 hours ago</p>
        <p className="text-sm text-muted-foreground">All 1,284 files verified successfully</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="font-medium">Verified Files</span>
          </div>
          <p className="text-2xl font-bold text-accent">1,284</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="font-medium">Modified</span>
          </div>
          <p className="text-2xl font-bold text-warning">0</p>
        </div>
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

      <div className="text-center py-8">
        <Play className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="font-display text-lg font-semibold mb-2">Ransomware Attack Simulator</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Test your system's defenses against simulated ransomware attacks to identify vulnerabilities.
        </p>
        <Button variant="cyber" size="lg" onClick={handleSimulation}>
          <Play className="w-5 h-5 mr-2" />
          Start Simulation
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Simulations Run", value: "15" },
          { label: "Vulnerabilities Found", value: "2" },
          { label: "Success Rate", value: "100%" },
          { label: "Last Test", value: "3 days ago" },
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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Module Header */}
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

        {/* Tabs */}
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

export default AntiRansomware;
