// js/supabaseClient.js
const supabaseUrl = 'https://tzjnyxaqbetbzbrasyul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am55eGFxYmV0YnpicmFzeXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjc3NTUsImV4cCI6MjA2ODk0Mzc1NX0.Dj6ZRN8Kw19LHPib-DQ46QBnp_CXx2hhoKCbiQPPjZc';
var supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.supabase = supabase; // Torna global para debug


