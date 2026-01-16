# 📅 Weekly Schedule Customization Feature

## ✅ FEATURE COMPLETE!

Users can now customize their weekly workout schedule with a dedicated page!

---

## 🎯 What's New

### 1. Weekly Schedule Page (`/weekly-schedule`)
- **Full week view** with all 7 days displayed as cards
- **Edit button** on each day card to customize workouts
- **15+ workout options** including:
  - Chest + Triceps
  - Lower Chest + Triceps
  - Upper Chest + Triceps
  - Back + Biceps
  - Back + Biceps + Shoulders
  - Shoulders + Arms
  - Legs + Core
  - Legs + Core (Intense)
  - Full Body
  - Push Day
  - Pull Day
  - Leg Day
  - Cardio + Abs
  - Rest Day
  - Active Recovery

### 2. Intensity Levels
- **Low** (Green badge)
- **Medium** (Yellow badge)
- **High** (Orange badge)
- **Very High** (Red badge)

### 3. Dashboard Integration
- **Weekly Schedule section** added to Dashboard
- Shows all 7 days at a glance
- **"Customize Schedule"** button to access full editor
- Click any day card to go to the schedule page

---

## 🚀 How to Use

### For Users:

1. **View Schedule:**
   - Go to Dashboard
   - Scroll to "Weekly Training Schedule" section
   - See your complete week at a glance

2. **Customize a Day:**
   - Click "Customize Schedule" button OR click any day card
   - On the Weekly Schedule page, click "Edit Schedule" on any day
   - Choose workout type from dropdown (15+ options)
   - Select intensity level (Low/Medium/High/Very High)
   - Click "Save Changes"

3. **Save Your Schedule:**
   - Click "Save Schedule" button in the header
   - Your custom schedule is saved to localStorage
   - Persists across sessions

---

## 💾 Data Storage

Currently using **localStorage** for instant saving without database setup.

### To Enable Database Storage (Optional):

1. Run the SQL file in Supabase:
   ```bash
   # Execute: create-weekly-schedules-table.sql
   ```

2. Update `WeeklySchedule.tsx` to use Supabase instead of localStorage
   (Code is already prepared, just uncomment the Supabase version)

---

## 🎨 Features

✅ **Visual Day Cards** - Color-coded for each day  
✅ **Intensity Badges** - Quick visual reference  
✅ **Edit Dialog** - Clean modal interface  
✅ **15+ Workout Types** - Comprehensive options  
✅ **4 Intensity Levels** - Customize difficulty  
✅ **Auto-Save** - localStorage persistence  
✅ **Responsive Design** - Works on all devices  
✅ **Dashboard Integration** - Quick access  

---

## 📱 User Flow

```
Dashboard
  ↓
Weekly Schedule Section (Preview)
  ↓
Click "Customize Schedule" or Day Card
  ↓
Weekly Schedule Page (Full Editor)
  ↓
Click "Edit Schedule" on any day
  ↓
Select Workout Type + Intensity
  ↓
Save Changes
  ↓
Click "Save Schedule" in header
  ↓
Done! ✅
```

---

## 🎯 Example Schedules

### Push/Pull/Legs Split:
- Monday: Push Day (High)
- Tuesday: Pull Day (High)
- Wednesday: Leg Day (High)
- Thursday: Push Day (Medium)
- Friday: Pull Day (Medium)
- Saturday: Leg Day (Medium)
- Sunday: Rest Day (Low)

### Bro Split:
- Monday: Chest + Triceps (High)
- Tuesday: Back + Biceps (High)
- Wednesday: Shoulders + Arms (Medium)
- Thursday: Legs + Core (Very High)
- Friday: Chest + Triceps (Medium)
- Saturday: Back + Biceps (Medium)
- Sunday: Active Recovery (Low)

### Upper/Lower Split:
- Monday: Upper Chest + Triceps (High)
- Tuesday: Legs + Core (High)
- Wednesday: Back + Biceps + Shoulders (High)
- Thursday: Rest Day (Low)
- Friday: Lower Chest + Triceps (High)
- Saturday: Legs + Core (High)
- Sunday: Full Body (Medium)

---

## 🔧 Technical Details

### Files Created:
1. `src/pages/WeeklySchedule.tsx` - Main schedule editor page
2. `create-weekly-schedules-table.sql` - Database schema (optional)
3. `WEEKLY_SCHEDULE_FEATURE.md` - This guide

### Files Modified:
1. `src/App.tsx` - Added route for `/weekly-schedule`
2. `src/pages/Dashboard.tsx` - Added weekly schedule section

### Components Used:
- Card, CardContent, CardHeader, CardTitle
- Button
- Badge
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue

---

## 💡 Pro Tips

1. **Plan Your Week:** Set up your schedule on Sunday for the upcoming week
2. **Match Intensity:** Adjust intensity based on your energy and recovery
3. **Rest Days:** Schedule at least 1-2 rest days per week
4. **Progressive Overload:** Gradually increase intensity over weeks
5. **Listen to Your Body:** Adjust schedule if you need extra recovery

---

## 🎉 Benefits

✅ **Personalized Training** - Create your own split  
✅ **Visual Planning** - See your whole week  
✅ **Flexible Scheduling** - Change anytime  
✅ **Intensity Control** - Match your energy levels  
✅ **Easy Access** - Right from Dashboard  
✅ **No Database Required** - Works with localStorage  

---

## 🚀 Future Enhancements (Optional)

- [ ] Drag & drop to reorder days
- [ ] Copy schedule from previous week
- [ ] Share schedule with friends
- [ ] Pre-made schedule templates
- [ ] Exercise list for each day
- [ ] Calendar view with monthly planning
- [ ] Workout reminders based on schedule

---

**Made with ❤️ for PRIME FLEX Users**
