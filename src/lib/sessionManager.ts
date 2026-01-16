import { Preferences } from '@capacitor/preferences';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'primeflex-user-session';
const USER_DATA_KEY = 'primeflex-user-data';
const LAST_ACTIVE_KEY = 'primeflex-last-active';
const LOGIN_TIMESTAMP_KEY = 'primeflex-login-timestamp';

// Session expiry: 7 days in milliseconds
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

interface UserData {
  email: string;
  userId: string;
  loginTimestamp: number;
  lastActive: number;
}

export const sessionManager = {
  /**
   * Save complete session with user data to persistent storage
   */
  async saveSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const now = Date.now();
        
        // Save session tokens
        await Preferences.set({
          key: SESSION_KEY,
          value: JSON.stringify(session)
        });

        // Save user data
        const userData: UserData = {
          email: session.user.email || '',
          userId: session.user.id,
          loginTimestamp: now,
          lastActive: now
        };

        await Preferences.set({
          key: USER_DATA_KEY,
          value: JSON.stringify(userData)
        });

        await Preferences.set({
          key: LOGIN_TIMESTAMP_KEY,
          value: now.toString()
        });

        await Preferences.set({
          key: LAST_ACTIVE_KEY,
          value: now.toString()
        });

        console.log('✅ Session and user data saved to secure storage');
        console.log('📧 Email:', userData.email);
        console.log('🆔 User ID:', userData.userId);
        console.log('⏰ Login Time:', new Date(now).toLocaleString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error saving session:', error);
      return false;
    }
  },

  /**
   * Update last active timestamp
   */
  async updateLastActive() {
    try {
      const now = Date.now();
      await Preferences.set({
        key: LAST_ACTIVE_KEY,
        value: now.toString()
      });

      // Also update in user data
      const { value } = await Preferences.get({ key: USER_DATA_KEY });
      if (value) {
        const userData: UserData = JSON.parse(value);
        userData.lastActive = now;
        await Preferences.set({
          key: USER_DATA_KEY,
          value: JSON.stringify(userData)
        });
      }

      console.log('✅ Last active time updated:', new Date(now).toLocaleString());
      return true;
    } catch (error) {
      console.error('❌ Error updating last active:', error);
      return false;
    }
  },

  /**
   * Check if session is expired (7 days)
   */
  async isSessionExpired(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: LOGIN_TIMESTAMP_KEY });
      if (!value) return true;

      const loginTime = parseInt(value, 10);
      const now = Date.now();
      const elapsed = now - loginTime;

      const isExpired = elapsed > SESSION_EXPIRY_MS;
      
      if (isExpired) {
        console.log('⚠️ Session expired (7 days passed)');
        const daysElapsed = Math.floor(elapsed / (24 * 60 * 60 * 1000));
        console.log(`📅 Days since login: ${daysElapsed}`);
      }

      return isExpired;
    } catch (error) {
      console.error('❌ Error checking session expiry:', error);
      return true;
    }
  },

  /**
   * Get stored user data
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const { value } = await Preferences.get({ key: USER_DATA_KEY });
      if (value) {
        const userData: UserData = JSON.parse(value);
        console.log('📋 Retrieved user data:');
        console.log('  Email:', userData.email);
        console.log('  User ID:', userData.userId);
        console.log('  Login Time:', new Date(userData.loginTimestamp).toLocaleString());
        console.log('  Last Active:', new Date(userData.lastActive).toLocaleString());
        return userData;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  /**
   * Restore session from persistent storage with expiry check
   */
  async restoreSession() {
    try {
      // Check if session is expired
      const expired = await this.isSessionExpired();
      if (expired) {
        console.log('🔒 Session expired, clearing data');
        await this.clearSession();
        return null;
      }

      const { value } = await Preferences.get({ key: SESSION_KEY });
      if (value) {
        const session = JSON.parse(value);
        const { data, error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        
        if (error) {
          console.error('❌ Error restoring session:', error);
          await this.clearSession();
          return null;
        }
        
        // Update last active time
        await this.updateLastActive();
        
        // Get and log user data
        const userData = await this.getUserData();
        
        console.log('✅ Session restored from secure storage');
        console.log('🔐 User authenticated:', userData?.email);
        return data.session;
      }
      return null;
    } catch (error) {
      console.error('❌ Error restoring session:', error);
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if session exists and is not expired
      const { value } = await Preferences.get({ key: SESSION_KEY });
      if (!value) return false;

      const expired = await this.isSessionExpired();
      if (expired) {
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  },

  /**
   * Clear all session data from storage
   */
  async clearSession() {
    try {
      await Preferences.remove({ key: SESSION_KEY });
      await Preferences.remove({ key: USER_DATA_KEY });
      await Preferences.remove({ key: LAST_ACTIVE_KEY });
      await Preferences.remove({ key: LOGIN_TIMESTAMP_KEY });
      console.log('✅ All session data cleared from secure storage');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  },

  /**
   * Get session info for debugging
   */
  async getSessionInfo() {
    try {
      const userData = await this.getUserData();
      const isExpired = await this.isSessionExpired();
      const isLoggedIn = await this.isLoggedIn();

      return {
        isLoggedIn,
        isExpired,
        userData,
        sessionExpiryDays: 7
      };
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return null;
    }
  }
};
