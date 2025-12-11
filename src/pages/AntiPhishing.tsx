import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Search, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink 
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusIndicator from "@/components/StatusIndicator";
import ScanProgress from "@/components/ScanProgress";
import { toast } from "@/hooks/use-toast";

const AntiPhishing = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<null | "safe" | "warning" | "danger">(null);

  const handleScanUrl = async () => {
    if (!url) {
      toast({
        title: "Enter a URL",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);

    // Simulate scanning
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Random result for demo
          const results: Array<"safe" | "warning" | "danger"> = ["safe", "safe", "safe", "warning", "danger"];
          setScanResult(results[Math.floor(Math.random() * results.length)]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const recentScans = [
    { url: "https://secure-bank.com/login", status: "safe", time: "2 min ago" },
    { url: "https://suspicious-link.xyz", status: "danger", time: "15 min ago" },
    { url: "https://mycompany.com/portal", status: "safe", time: "1 hour ago" },
    { url: "https://promo-deal.net/claim", status: "warning", time: "2 hours ago" },
  ];

  const getResultDisplay = () => {
    switch (scanResult) {
      case "safe":
        return {
          icon: <CheckCircle className="w-16 h-16 text-accent" />,
          title: "URL is Safe",
          description: "No threats detected. This website appears to be legitimate.",
          color: "border-accent/50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-warning" />,
          title: "Potential Risk",
          description: "This URL shows some suspicious patterns. Proceed with caution.",
          color: "border-warning/50",
        };
      case "danger":
        return {
          icon: <XCircle className="w-16 h-16 text-destructive" />,
          title: "Phishing Detected",
          description: "This URL is identified as a phishing threat. Do not proceed.",
          color: "border-destructive/50",
        };
      default:
        return null;
    }
  };

  const result = getResultDisplay();

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
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Anti-Phishing Shield</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status="active" size="sm" />
                <span className="text-sm text-accent">Active Protection</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Scan URLs for phishing threats and protect yourself from fraudulent websites.
          </p>
        </div>

        {/* URL Scanner */}
        <div className="glass-card p-6 mb-8 animate-fade-in-up animation-delay-200">
          <h2 className="font-display text-lg font-semibold mb-4">Scan URL</h2>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter URL to scan (e.g., https://example.com)"
                className="pl-10"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanUrl()}
              />
            </div>
            <Button 
              variant="cyber" 
              onClick={handleScanUrl}
              disabled={isScanning}
            >
              <Search className="w-4 h-4 mr-2" />
              Scan
            </Button>
          </div>

          {/* Scan Progress */}
          {isScanning && (
            <div className="mt-6">
              <ScanProgress 
                progress={scanProgress} 
                status="scanning" 
                label="Analyzing URL..." 
              />
              <p className="text-sm text-muted-foreground mt-2">
                Checking against phishing database and pattern matching...
              </p>
            </div>
          )}

          {/* Scan Result */}
          {result && !isScanning && (
            <div className={`mt-6 p-6 rounded-xl border ${result.color} bg-card/30 text-center animate-fade-in-up`}>
              <div className="flex justify-center mb-4">{result.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{result.title}</h3>
              <p className="text-muted-foreground">{result.description}</p>
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-300">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Scans</h2>
          
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusIndicator
                    status={scan.status as "active" | "warning" | "danger"}
                    size="sm"
                    pulse={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{scan.url}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {scan.time}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "URLs Scanned", value: "2,847", color: "text-primary" },
            { label: "Threats Blocked", value: "23", color: "text-destructive" },
            { label: "Safe URLs", value: "2,819", color: "text-accent" },
            { label: "Warnings", value: "5", color: "text-warning" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-4 text-center animate-fade-in-up"
              style={{ animationDelay: `${400 + index * 50}ms` }}
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AntiPhishing;
