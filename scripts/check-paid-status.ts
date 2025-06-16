import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaidStatus() {
  console.log('Fetching all users and their paid status...');
  
  try {
    // Fetch all profiles with their auth email
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        is_paid,
        auth_users: auth.users!profiles_id_fkey (
          email
        )`);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log('\nCurrent User Paid Status:');
    console.log('------------------------');
    
    profiles.forEach(profile => {
      const email = profile.auth_users?.email || profile.username || 'No email';
      console.log(`User: ${email}`);
      console.log(`ID: ${profile.id}`);
      console.log(`Paid Status: ${profile.is_paid ? '✅ PAID' : '❌ NOT PAID'}`);
      console.log('------------------------');
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkPaidStatus();
