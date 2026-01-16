import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primeflex.app',
  appName: 'PRIME FLEX',
  webDir: 'dist',
  server: {
    // Uncomment and replace with your IP when using live reload
    // url: 'http://192.168.1.x:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
