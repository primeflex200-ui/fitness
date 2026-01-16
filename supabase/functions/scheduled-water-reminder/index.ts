// Scheduled Water Reminder - Runs every minute on the server
// This sends SMS to users even when app is closed

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Send SMS via Twilio
async function sendSMS(to: string, message: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  
  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER!,
      Body: message,
    }),
  })

  return response.ok
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get all users with water reminders enabled
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, phone_number, water_reminder_enabled, water_reminder_interval, last_reminder_sent')
      .eq('water_reminder_enabled', true)
      .not('phone_number', 'is', null)

    if (error) {
      console.error('Error fetching users:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const now = new Date()
    let sentCount = 0

    for (const user of users || []) {
      const interval = user.water_reminder_interval || 60 // default 60 minutes
      const lastSent = user.last_reminder_sent ? new Date(user.last_reminder_sent) : null
      
      // Check if enough time has passed since last reminder
      const shouldSend = !lastSent || 
        (now.getTime() - lastSent.getTime()) >= (interval * 60 * 1000)

      if (shouldSend && user.phone_number) {
        // Format phone number
        let phone = user.phone_number.replace(/\s/g, '')
        if (!phone.startsWith('+')) {
          phone = '+91' + phone
        }

        // Send SMS
        const success = await sendSMS(phone, "💧 PRIME FLEX: Time to drink water! Stay hydrated for better performance. 🏋️")
        
        if (success) {
          // Update last_reminder_sent
          await supabase
            .from('profiles')
            .update({ last_reminder_sent: now.toISOString() })
            .eq('id', user.id)
          
          sentCount++
          console.log(`Sent reminder to ${phone}`)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
