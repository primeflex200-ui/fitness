// Verification Script for Nutrition Tracking
// Run this in browser console on your app

console.log("🔍 Starting Nutrition Tracking Verification...\n");

// 1. Check if Supabase is loaded
if (typeof window.supabase === 'undefined') {
    console.error("❌ Supabase not loaded!");
} else {
    console.log("✅ Supabase client loaded");
}

// 2. Check user authentication
async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log("✅ User authenticated:", user.email);
            return user;
        } else {
            console.error("❌ No user logged in");
            return null;
        }
    } catch (error) {
        console.error("❌ Auth check failed:", error);
        return null;
    }
}

// 3. Check if table exists
async function checkTable() {
    try {
        const { data, error } = await supabase
            .from('meal_completions')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error("❌ Table doesn't exist or RLS blocking:", error.message);
            console.log("📝 Run the SQL from create-meal-completions-table.sql");
            return false;
        }
        console.log("✅ meal_completions table exists");
        return true;
    } catch (error) {
        console.error("❌ Table check failed:", error);
        return false;
    }
}

// 4. Test insert
async function testInsert(user) {
    try {
        const testMeal = {
            user_id: user.id,
            day: 'Tuesday',
            meal_name: 'Test-0',
            food_name: 'Verification Test Meal',
            calories: 100,
            protein: 10,
            carbs: 10,
            fats: 5,
            completed: true,
            completion_date: new Date().toISOString().split('T')[0]
        };

        console.log("📝 Testing insert...");
        const { data, error } = await supabase
            .from('meal_completions')
            .upsert(testMeal)
            .select();

        if (error) {
            console.error("❌ Insert failed:", error.message);
            return false;
        }
        console.log("✅ Insert successful:", data);
        return true;
    } catch (error) {
        console.error("❌ Insert test failed:", error);
        return false;
    }
}

// 5. Test query
async function testQuery(user) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log("📝 Testing query for date:", today);
        
        const { data, error } = await supabase
            .from('meal_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('completion_date', today)
            .eq('completed', true);

        if (error) {
            console.error("❌ Query failed:", error.message);
            return false;
        }

        console.log(`✅ Query successful! Found ${data.length} meals`);
        
        if (data.length > 0) {
            const totals = {
                calories: data.reduce((sum, m) => sum + m.calories, 0),
                protein: data.reduce((sum, m) => sum + m.protein, 0),
                carbs: data.reduce((sum, m) => sum + m.carbs, 0),
                fats: data.reduce((sum, m) => sum + m.fats, 0)
            };
            console.log("📊 Nutrition Totals:", totals);
        }
        return true;
    } catch (error) {
        console.error("❌ Query test failed:", error);
        return false;
    }
}

// Run all checks
async function runVerification() {
    console.log("\n=== VERIFICATION RESULTS ===\n");
    
    const user = await checkAuth();
    if (!user) {
        console.log("\n❌ FAILED: Please log in first");
        return;
    }

    const tableExists = await checkTable();
    if (!tableExists) {
        console.log("\n❌ FAILED: Table doesn't exist or RLS is blocking");
        console.log("📝 Action: Run create-meal-completions-table.sql in Supabase");
        return;
    }

    const insertWorks = await testInsert(user);
    if (!insertWorks) {
        console.log("\n❌ FAILED: Cannot insert data");
        console.log("📝 Action: Check RLS policies");
        return;
    }

    const queryWorks = await testQuery(user);
    if (!queryWorks) {
        console.log("\n❌ FAILED: Cannot query data");
        console.log("📝 Action: Check RLS policies");
        return;
    }

    console.log("\n✅ ALL CHECKS PASSED!");
    console.log("🎉 Nutrition tracking is working correctly!");
    console.log("\n📝 Next steps:");
    console.log("1. Go to Diet Plan Tracker");
    console.log("2. Check some meals");
    console.log("3. Click 'Save Progress to Tracking'");
    console.log("4. Go to Progress page to see your nutrition data");
}

// Auto-run
runVerification();
