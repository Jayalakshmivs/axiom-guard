import { useState, useEffect } from "react";
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
  ExternalLink,
  RefreshCw,
  Trash2
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusIndicator from "@/components/StatusIndicator";
import ScanProgress from "@/components/ScanProgress";
import { toast } from "@/hooks/use-toast";
import { phishingApi, type PhishingScanResult } from "@/services/api";

interface RecentScan {
  url: string;
  status: 'safe' | 'warning' | 'danger';
  time: string;
  timestamp: number;
  confidence?: number;
}

const AntiPhishing = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<PhishingScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [stats, setStats] = useState({
    urlsScanned: 2847,
    threatsBlocked: 23,
    safeUrls: 2819,
    warnings: 5,
  });

  // Load initial data
  useEffect(() => {
    const initialScans: RecentScan[] = [
      { url: "https://secure-bank.com/login", status: "safe", time: "2 min ago", timestamp: Date.now() - 120000 },
      { url: "https://suspicious-link.xyz", status: "danger", time: "15 min ago", timestamp: Date.now() - 900000 },
      { url: "https://mycompany.com/portal", status: "safe", time: "1 hour ago", timestamp: Date.now() - 3600000 },
      { url: "https://promo-deal.net/claim", status: "warning", time: "2 hours ago", timestamp: Date.now() - 7200000 },
    ];
    setRecentScans(initialScans);
  }, []);

  const handleScanUrl = async () => {
    if (!url) {
      toast({
        title: "Enter a URL",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);

    // Simulate progress while API call happens
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const result = await phishingApi.scanUrl(formattedUrl);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setScanResult(result);
      
      // Add to recent scans
      const newScan: RecentScan = {
        url: formattedUrl,
        status: result.status,
        time: "Just now",
        timestamp: Date.now(),
        confidence: result.confidence,
      };
      setRecentScans(prev => [newScan, ...prev].slice(0, 10));

      // Update stats
      setStats(prev => ({
        urlsScanned: prev.urlsScanned + 1,
        threatsBlocked: result.status === 'danger' ? prev.threatsBlocked + 1 : prev.threatsBlocked,
        safeUrls: result.status === 'safe' ? prev.safeUrls + 1 : prev.safeUrls,
        warnings: result.status === 'warning' ? prev.warnings + 1 : prev.warnings,
      }));

      // Show toast for threats
      if (result.status !== 'safe') {
        toast({
          title: result.status === 'danger' ? "⚠️ Phishing Detected!" : "⚠️ Potential Risk",
          description: result.details,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ URL is Safe",
          description: `Confidence: ${result.confidence}%`,
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Scan Failed",
        description: "Failed to scan URL. Please try again.",
        variant: "destructive",
      });
    }

    setIsScanning(false);
  };

  const handleRescan = (scanUrl: string) => {
    setUrl(scanUrl);
    handleScanUrl();
  };

  const handleRemoveScan = (timestamp: number) => {
    setRecentScans(prev => prev.filter(s => s.timestamp !== timestamp));
    toast({
      title: "Scan Removed",
      description: "The scan has been removed from history.",
    });
  };

  const getResultDisplay = () => {
    if (!scanResult) return null;
    
    switch (scanResult.status) {
      case "safe":
        return {
          icon: <CheckCircle className="w-16 h-16 text-accent" />,
          title: "URL is Safe",
          description: scanResult.details,
          color: "border-accent/50 bg-accent/5",
          confidence: scanResult.confidence,
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-warning" />,
          title: "Potential Risk",
          description: scanResult.details,
          color: "border-warning/50 bg-warning/5",
          confidence: scanResult.confidence,
        };
      case "danger":
        return {
          icon: <XCircle className="w-16 h-16 text-destructive" />,
          title: "Phishing Detected",
          description: scanResult.details,
          color: "border-destructive/50 bg-destructive/5",
          confidence: scanResult.confidence,
        };
      default:
        return null;
    }
  };

  const result = getResultDisplay();

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

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
            Connected to FastAPI backend for real-time threat analysis.
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
                disabled={isScanning}
              />
            </div>
            <Button 
              variant="cyber" 
              onClick={handleScanUrl}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan
                </>
              )}
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
            <div className={`mt-6 p-6 rounded-xl border ${result.color} text-center animate-fade-in-up`}>
              <div className="flex justify-center mb-4">{result.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{result.title}</h3>
              <p className="text-muted-foreground mb-3">{result.description}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-sm">
                <span>Confidence:</span>
                <span className="font-bold">{result.confidence}%</span>
              </div>
              {scanResult?.threatType && (
                <p className="text-xs text-destructive mt-3">
                  Threat Type: {scanResult.threatType}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent Scans</h2>
            <span className="text-xs text-muted-foreground">{recentScans.length} scans</span>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {recentScans.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scans yet. Enter a URL above to start scanning.</p>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.timestamp}
                  className={`flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group ${
                    scan.status === 'danger' ? 'border-l-2 border-destructive' : 
                    scan.status === 'warning' ? 'border-l-2 border-warning' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIndicator
                      status={scan.status === 'safe' ? 'active' : scan.status}
                      size="sm"
                      pulse={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{scan.url}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(scan.timestamp)}
                        {scan.confidence && (
                          <span className="ml-2">• {scan.confidence}% confidence</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRescan(scan.url)}
                      title="Rescan URL"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(scan.url, '_blank')}
                      title="Open URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveScan(scan.timestamp)}
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "URLs Scanned", value: stats.urlsScanned.toLocaleString(), color: "text-primary" },
            { label: "Threats Blocked", value: stats.threatsBlocked.toString(), color: "text-destructive" },
            { label: "Safe URLs", value: stats.safeUrls.toLocaleString(), color: "text-accent" },
            { label: "Warnings", value: stats.warnings.toString(), color: "text-warning" },
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

        {/* API Connection Info */}
        <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-3">
            <StatusIndicator status="active" size="sm" />
            <div>
              <p className="font-medium text-primary">FastAPI Backend Connected</p>
              <p className="text-xs text-muted-foreground">
                Real-time phishing detection using pattern matching and threat database
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AntiPhishing;
