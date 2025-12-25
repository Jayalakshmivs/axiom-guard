import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2d218109454247c5893620b6b5c9fcb4',
  appName: 'AXIOM JAVELIN',
  webDir: 'dist',
  server: {
    url: 'https://2d218109-4542-47c5-8936-20b6b5c9fcb4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A1929',
      showSpinner: true,
      spinnerColor: '#00D4FF'
    }
  }
};

export default config;
