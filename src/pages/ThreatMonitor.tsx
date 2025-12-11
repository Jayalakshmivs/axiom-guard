import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/StatusIndicator";

const ThreatMonitor = () => {
  const navigate = useNavigate();
  const [liveCounter, setLiveCounter] = useState(156);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const events = [
    { type: "info", message: "URL scan completed successfully", time: "Just now", module: "Anti-Phishing" },
    { type: "success", message: "Vault backup completed", time: "2 min ago", module: "Anti-Ransomware" },
    { type: "warning", message: "Suspicious pattern detected in upload", time: "15 min ago", module: "Deepfake Scanner" },
    { type: "info", message: "System integrity check passed", time: "1 hour ago", module: "Anti-Ransomware" },
    { type: "danger", message: "Phishing URL blocked: suspicious-site.xyz", time: "2 hours ago", module: "Anti-Phishing" },
    { type: "success", message: "Image analysis complete: Authentic", time: "3 hours ago", module: "Deepfake Scanner" },
  ];

  const metrics = [
    { 
      label: "Total Events", 
      value: liveCounter, 
      change: "+12%", 
      trend: "up",
      icon: Activity 
    },
    { 
      label: "Threats Blocked", 
      value: 23, 
      change: "-5%", 
      trend: "down",
      icon: Shield 
    },
    { 
      label: "Active Alerts", 
      value: 3, 
      change: "0%", 
      trend: "neutral",
      icon: AlertTriangle 
    },
    { 
      label: "Uptime", 
      value: "99.9%", 
      change: "+0.1%", 
      trend: "up",
      icon: CheckCircle 
    },
  ];

  const getEventStyle = (type: string) => {
    switch (type) {
      case "success":
        return { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10" };
      case "warning":
        return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" };
      case "danger":
        return { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" };
      default:
        return { icon: Activity, color: "text-primary", bg: "bg-primary/10" };
    }
  };

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
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Threat Monitor</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status="active" size="sm" />
                <span className="text-sm text-accent">Live Monitoring</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Real-time view of all security events, alerts, and system health metrics.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="glass-card p-4 animate-fade-in-up"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-primary" />
                <span className={`text-xs flex items-center gap-1 ${
                  metric.trend === "up" ? "text-accent" : 
                  metric.trend === "down" ? "text-destructive" : 
                  "text-muted-foreground"
                }`}>
                  {metric.trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {metric.trend === "down" && <TrendingDown className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <div className="glass-card p-6 mb-8 animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Activity Feed
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent">Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {events.map((event, index) => {
              const style = getEventStyle(event.type);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${style.bg}`}>
                    <style.icon className={`w-4 h-4 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{event.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {event.module}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-400">
          <h2 className="font-display text-lg font-semibold mb-4">System Health</h2>
          
          <div className="space-y-4">
            {[
              { label: "Anti-Phishing Shield", status: "active", load: 23 },
              { label: "Deepfake Scanner", status: "active", load: 45 },
              { label: "Anti-Ransomware Shield", status: "active", load: 12 },
              { label: "Secure Vault", status: "active", load: 67 },
            ].map((system) => (
              <div key={system.label} className="flex items-center gap-4">
                <StatusIndicator status={system.status as "active"} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{system.label}</span>
                    <span className="text-xs text-muted-foreground">{system.load}% CPU</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${system.load}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThreatMonitor;
