import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gltjnfbbnsgthusrtrvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGpuZmJibnNndGh1c3J0cnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMjA2OTAsImV4cCI6MjA0NzY5NjY5MH0.6LXpI47tJ9uxXpUiX6JI_elFWISM1Jp23hmYm-0x0-o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
