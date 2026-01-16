// 🧪 Profile Persistence Test Script
// Copy and paste this into your browser console to test profile persistence

console.log('🧪 Starting Profile Persistence Test...\n');

// Get current user ID from session
const getUserId = async () => {
  try {
    const { data: { session } } = await window.supabase?.auth?.getSession();
    return session?.user?.id;
  } catch (err) {
    console.error('Error getting user ID:', err);
    return null;
  }
};

// Test 1: Check if localStorage has profile
console.log('📋 Test 1: Check localStorage for profile');
getUserId().then(userId => {
  if (!userId) {
    console.log('❌ No user logged in');
    return;
  }
  
  const profileKey = `profile_${userId}`;
  const savedProfile = localStorage.getItem(profileKey);
  
  if (savedProfile) {
    console.log('✅ Found saved profile:', JSON.parse(savedProfile));
  } else {
    console.log('❌ No saved profile found in localStorage');
    console.log('   Key checked:', profileKey);
  }
  console.log('');

  // Test 2: Verify profile structure
  if (savedProfile) {
    console.log('📋 Test 2: Verify profile structure');
    try {
      const profile = JSON.parse(savedProfile);
      const fields = ['full_name', 'email', 'age', 'gender', 'height', 'weight', 'fitness_goal', 'diet_type'];
      
      console.log('Profile fields:');
      fields.forEach(field => {
        const value = profile[field];
        const status = value ? '✅' : '⚠️';
        console.log(`   ${status} ${field}:`, value || '(empty)');
      });
    } catch (err) {
      console.log('❌ Error parsing profile:', err);
    }
    console.log('');
  }

  // Test 3: Simulate saving profile
  console.log('📋 Test 3: Simulate saving test profile');
  console.log('Run this to save test profile:');
  console.log(`
const testProfile = {
  full_name: "Test User",
  email: "${userId ? 'user@example.com' : 'your-email@example.com'}",
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  fitness_goal: "muscle_gain",
  diet_type: "non_veg"
};
localStorage.setItem('profile_${userId}', JSON.stringify(testProfile));
console.log('✅ Test profile saved! Refresh the page to test persistence.');
  `);
  console.log('');

  // Test 4: Clear profile (for testing)
  console.log('📋 Test 4: Clear profile (for testing)');
  console.log('Run this to clear profile:');
  console.log(`
localStorage.removeItem('profile_${userId}');
console.log('✅ Profile cleared! Go to Settings page to fill again.');
  `);
  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  console.log('================');
  console.log('1. User logged in:', userId ? '✅ PASS' : '❌ FAIL');
  console.log('2. localStorage check:', savedProfile ? '✅ PASS' : '❌ FAIL');
  console.log('3. Profile structure:', savedProfile ? '✅ PASS' : '⚠️ SKIP');
  console.log('');

  // Instructions
  console.log('📝 Next Steps:');
  console.log('==============');
  if (!savedProfile) {
    console.log('1. Go to Settings page');
    console.log('2. Click "Edit Profile"');
    console.log('3. Fill in your details');
    console.log('4. Click "Save Changes"');
    console.log('5. Navigate to Dashboard');
    console.log('6. Navigate back to Settings');
    console.log('7. Run this script again to verify persistence');
  } else {
    console.log('1. Navigate to Settings page');
    console.log('2. Verify fields match saved profile');
    console.log('3. Navigate away and back');
    console.log('4. Verify profile still matches');
    console.log('5. Refresh page');
    console.log('6. Verify profile persists after refresh');
  }
  console.log('');
  console.log('✅ Test script complete!');
});

// Also check notification settings
console.log('\n📋 Bonus: Check notification settings');
const notificationSettings = localStorage.getItem('notification_settings');
if (notificationSettings) {
  console.log('✅ Found notification settings:', JSON.parse(notificationSettings));
} else {
  console.log('ℹ️ No notification settings found');
}
