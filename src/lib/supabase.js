import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwldmxrjzojgcdugfqls.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bGRteHJqem9qZ2NkdWdmcWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDMyNjksImV4cCI6MjA5NDc3OTI2OX0.CwRabjfxZJie7Zv4el6y7qwLlOQEMuI1_rwLr7iRYz0'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)