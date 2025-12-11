import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ShieldAlert, Scan, Lock, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import ModuleCard from "@/components/ModuleCard";
import StatusIndicator from "@/components/StatusIndicator";

const Dashboard = () => {
  const navigate = useNavigate();
  const [systemStatus] = useState({
    overall: "active" as const,
    threats: 0,
    scansToday: 47,
    protectedFiles: 1284,
  });

  const handleLogout = () => {
    navigate("/");
  };

  const modules = [
    {
      title: "Anti-Phishing Shield",
      description: "Real-time protection against phishing URLs, emails, and fraudulent websites.",
      icon: <ShieldAlert className="w-6 h-6" />,
      status: "active" as const,
      statusText: "Active Protection",
      route: "/anti-phishing",
      stats: [
        { label: "URLs Scanned", value: "2,847" },
        { label: "Threats Blocked", value: "23" },
      ],
    },
    {
      title: "Deepfake Scanner",
      description: "AI-powered detection for manipulated images using CNN technology.",
      icon: <Scan className="w-6 h-6" />,
      status: "active" as const,
      statusText: "Ready to Scan",
      route: "/deepfake-scanner",
      stats: [
        { label: "Scans Today", value: "15" },
        { label: "Accuracy", value: "98.7%" },
      ],
    },
    {
      title: "Anti-Ransomware Shield",
      description: "Protect your files from ransomware with real-time monitoring and secure vault.",
      icon: <Lock className="w-6 h-6" />,
      status: "active" as const,
      statusText: "Monitoring",
      route: "/anti-ransomware",
      stats: [
        { label: "Protected Files", value: "1,284" },
        { label: "Vault Size", value: "2.4 GB" },
      ],
    },
    {
      title: "Threat Monitor",
      description: "Centralized view of all security events and system health metrics.",
      icon: <Activity className="w-6 h-6" />,
      status: "active" as const,
      statusText: "Online",
      route: "/threat-monitor",
      stats: [
        { label: "Events Today", value: "156" },
        { label: "Alerts", value: "3" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SecurityHeader isLoggedIn onLogout={handleLogout} />

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* System Status Banner */}
        <div className="glass-card p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Shield className="w-12 h-12 text-accent" />
                <StatusIndicator 
                  status="active" 
                  size="lg" 
                  className="absolute -top-1 -right-1" 
                />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Security Dashboard</h1>
                <p className="text-muted-foreground">All systems operational</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{systemStatus.threats}</p>
                  <p className="text-xs text-muted-foreground">Active Threats</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scan className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{systemStatus.scansToday}</p>
                  <p className="text-xs text-muted-foreground">Scans Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Lock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{systemStatus.protectedFiles.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Protected Files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="glass-card p-4 mb-8 border-l-4 border-warning animate-fade-in-up animation-delay-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium">Security Recommendation</p>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication for enhanced account security.
              </p>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.title}
              {...module}
              delay={200 + index * 100}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 glass-card p-6 animate-fade-in-up animation-delay-400">
          <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Quick Scan", icon: Scan, color: "text-primary" },
              { label: "Check URL", icon: ShieldAlert, color: "text-accent" },
              { label: "Secure Vault", icon: Lock, color: "text-warning" },
              { label: "View Logs", icon: Activity, color: "text-muted-foreground" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:scale-105 group"
              >
                <action.icon className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
