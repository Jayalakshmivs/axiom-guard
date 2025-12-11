import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Scan, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Trash2,
  BarChart3,
  Percent,
  Activity
} from "lucide-react";
import SecurityHeader from "@/components/SecurityHeader";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/StatusIndicator";
import ScanProgress from "@/components/ScanProgress";
import { toast } from "@/hooks/use-toast";

const DeepfakeScanner = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<null | "authentic" | "manipulated" | "suspicious">(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [metrics, setMetrics] = useState<null | {
    confidence: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setScanResult(null);
        setMetrics(null);
        
        if (!hasConsented) {
          setShowConsentDialog(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Simulate results
          const results: Array<"authentic" | "manipulated" | "suspicious"> = ["authentic", "authentic", "suspicious", "manipulated"];
          const result = results[Math.floor(Math.random() * results.length)];
          setScanResult(result);
          
          setMetrics({
            confidence: 85 + Math.random() * 14,
            accuracy: 96 + Math.random() * 3,
            precision: 94 + Math.random() * 5,
            recall: 92 + Math.random() * 7,
            f1Score: 93 + Math.random() * 6,
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setScanResult(null);
    setMetrics(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getResultDisplay = () => {
    switch (scanResult) {
      case "authentic":
        return {
          icon: <CheckCircle className="w-12 h-12 text-accent" />,
          title: "Authentic Image",
          description: "No manipulation detected. This image appears to be genuine.",
          color: "border-accent/50 bg-accent/5",
        };
      case "suspicious":
        return {
          icon: <AlertTriangle className="w-12 h-12 text-warning" />,
          title: "Suspicious Content",
          description: "Some anomalies detected. Manual review recommended.",
          color: "border-warning/50 bg-warning/5",
        };
      case "manipulated":
        return {
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          title: "Deepfake Detected",
          description: "High confidence of AI-generated or manipulated content.",
          color: "border-destructive/50 bg-destructive/5",
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
              <Scan className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Deepfake Scanner</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusIndicator status="active" size="sm" />
                <span className="text-sm text-accent">CNN Model Ready</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Upload images to detect AI-generated or manipulated content using advanced CNN technology.
          </p>
        </div>

        {/* Consent Dialog */}
        {showConsentDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 max-w-md w-full animate-fade-in-up">
              <h3 className="font-display text-lg font-semibold mb-4">Image Storage Permission</h3>
              <p className="text-muted-foreground mb-6">
                Allow Security Guardian to store your uploaded images for analysis and improvement of detection accuracy?
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Images are stored securely and encrypted. You can view and delete them anytime from settings.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowConsentDialog(false);
                  }}
                >
                  Deny
                </Button>
                <Button
                  variant="cyber"
                  className="flex-1"
                  onClick={() => {
                    setHasConsented(true);
                    setShowConsentDialog(false);
                    toast({
                      title: "Permission Granted",
                      description: "Images will be stored securely for analysis.",
                    });
                  }}
                >
                  Allow
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="glass-card p-6 mb-8 animate-fade-in-up animation-delay-200">
          <h2 className="font-display text-lg font-semibold mb-4">Upload Image</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden bg-secondary/30">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full max-h-96 object-contain mx-auto"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm font-medium">Analyzing Image...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={clearImage}
                  disabled={isScanning}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="cyber"
                  className="flex-1"
                  onClick={handleScan}
                  disabled={isScanning}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {isScanning ? "Scanning..." : "Analyze Image"}
                </Button>
              </div>

              {isScanning && (
                <div className="mt-4">
                  <ScanProgress 
                    progress={scanProgress} 
                    status="scanning" 
                    label="CNN Analysis Progress" 
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {result && !isScanning && (
          <div className={`glass-card p-6 mb-8 ${result.color} animate-fade-in-up`}>
            <div className="flex items-center gap-4">
              {result.icon}
              <div>
                <h3 className="font-display text-xl font-semibold">{result.title}</h3>
                <p className="text-muted-foreground">{result.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {metrics && !isScanning && (
          <div className="glass-card p-6 animate-fade-in-up animation-delay-100">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Model Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Confidence", value: metrics.confidence, icon: Percent },
                { label: "Accuracy", value: metrics.accuracy, icon: CheckCircle },
                { label: "Precision", value: metrics.precision, icon: Activity },
                { label: "Recall", value: metrics.recall, icon: Activity },
                { label: "F1 Score", value: metrics.f1Score, icon: BarChart3 },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="p-4 rounded-xl bg-secondary/30 text-center"
                >
                  <metric.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">
                    {metric.value.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="glass-card p-6 mt-8 animate-fade-in-up animation-delay-200">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Scans</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl bg-secondary/30 flex items-center justify-center group cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeepfakeScanner;
