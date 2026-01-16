import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Initialize Google Auth for native platforms only
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '514289536306-catbvaoa4rber85geliatnircnisp1nd.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

export const googleAuthService = {
  /**
   * Sign in with Google
   */
  async signIn() {
    try {
      console.log('Starting Google Sign-In...');
      
      // For web platform, use Supabase OAuth
      if (!Capacitor.isNativePlatform()) {
        console.log('Using Supabase OAuth for web...');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          console.error('Supabase OAuth error:', error);
          throw error;
        }

        return { data, error: null };
      }
      
      // For native platforms, use Capacitor Google Auth
      const googleUser = await GoogleAuth.signIn();
      console.log('Google user received:', googleUser);
      
      if (!googleUser) {
        throw new Error('No user data received from Google');
      }

      if (!googleUser.authentication?.idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('Attempting Supabase sign-in with ID token...');
      
      // Sign in to Supabase with Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleUser.authentication.idToken,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        throw error;
      }

      console.log('Supabase sign-in successful:', data);

      // Create or update profile
      if (data.user) {
        await this.createOrUpdateProfile(data.user, googleUser);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { data: null, error };
    }
  },

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      await GoogleAuth.signOut();
    } catch (error) {
      console.error('Google sign-out error:', error);
    }
  },

  /**
   * Create or update user profile after Google sign-in
   */
  async createOrUpdateProfile(user: any, googleUser: any) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: googleUser.name || user.user_metadata?.full_name || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error creating/updating profile:', error);
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  }
};
