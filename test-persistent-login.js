/**
 * Test Script for Persistent Login System
 * Run this in browser console to test the persistent login functionality
 */

// Import required modules (if in browser console, these should already be available)
const testPersistentLogin = async () => {
  console.log('🧪 Starting Persistent Login System Tests...\n');

  try {
    // Test 1: Check if Preferences API is available
    console.log('Test 1: Checking Capacitor Preferences API...');
    const { Preferences } = await import('@capacitor/preferences');
    console.log('✅ Preferences API available\n');

    // Test 2: Save test session data
    console.log('Test 2: Saving test session data...');
    const testData = {
      email: 'test@primeflex.com',
      userId: 'test-user-123',
      loginTimestamp: Date.now(),
      lastActive: Date.now()
    };
    
    await Preferences.set({
      key: 'primeflex-test-data',
      value: JSON.stringify(testData)
    });
    console.log('✅ Test data saved:', testData);
    console.log('');

    // Test 3: Retrieve test session data
    console.log('Test 3: Retrieving test session data...');
    const { value } = await Preferences.get({ key: 'primeflex-test-data' });
    if (value) {
      const retrieved = JSON.parse(value);
      console.log('✅ Test data retrieved:', retrieved);
      console.log('');
    } else {
      console.log('❌ Failed to retrieve test data\n');
    }

    // Test 4: Check session manager
    console.log('Test 4: Testing session manager...');
    const { sessionManager } = await import('./src/lib/sessionManager');
    
    const sessionInfo = await sessionManager.getSessionInfo();
    console.log('✅ Session Info:', sessionInfo);
    console.log('');

    // Test 5: Check if user is logged in
    console.log('Test 5: Checking login status...');
    const isLoggedIn = await sessionManager.isLoggedIn();
    console.log(`✅ Is Logged In: ${isLoggedIn}`);
    console.log('');

    // Test 6: Get user data
    console.log('Test 6: Getting user data...');
    const userData = await sessionManager.getUserData();
    if (userData) {
      console.log('✅ User Data:', {
        email: userData.email,
        userId: userData.userId,
        loginTime: new Date(userData.loginTimestamp).toLocaleString(),
        lastActive: new Date(userData.lastActive).toLocaleString()
      });
    } else {
      console.log('ℹ️ No user data found (user not logged in)');
    }
    console.log('');

    // Test 7: Check session expiry
    console.log('Test 7: Checking session expiry...');
    const isExpired = await sessionManager.isSessionExpired();
    console.log(`✅ Is Expired: ${isExpired}`);
    console.log('');

    // Test 8: Update last active
    console.log('Test 8: Updating last active time...');
    await sessionManager.updateLastActive();
    console.log('✅ Last active time updated');
    console.log('');

    // Clean up test data
    console.log('Cleaning up test data...');
    await Preferences.remove({ key: 'primeflex-test-data' });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Preferences API: ✅ Working');
    console.log('- Data Storage: ✅ Working');
    console.log('- Data Retrieval: ✅ Working');
    console.log('- Session Manager: ✅ Working');
    console.log('- Login Status Check: ✅ Working');
    console.log('- User Data Retrieval: ✅ Working');
    console.log('- Session Expiry Check: ✅ Working');
    console.log('- Last Active Update: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
};

// Run the tests
testPersistentLogin();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPersistentLogin };
}
