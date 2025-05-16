import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data;
}

// User profile management
export async function updateUserProfile(userId: string, data: any) {
  const { data: profile, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return profile;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

// Connected tools management
export async function getConnectedTools(userId: string) {
  const { data, error } = await supabase
    .from('connected_tools')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}

export async function connectTool(userId: string, toolName: string, status = 'connected') {
  const { data, error } = await supabase
    .from('connected_tools')
    .insert([
      { user_id: userId, tool_name: toolName, status }
    ])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateToolStatus(toolId: string, status: string) {
  const { data, error } = await supabase
    .from('connected_tools')
    .update({ status })
    .eq('id', toolId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Auth state change subscription
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
