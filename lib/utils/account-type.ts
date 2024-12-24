import { supabase } from '@/lib/supabase';

export async function getAccountType(userId: string) {
  // Check if user is a parent
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (parentProfile) return 'parent';

  // Check if user is a child
  const { data: childAccount } = await supabase
    .from('child_accounts')
    .select('*')
    .eq('email', (await supabase.auth.getUser()).data.user?.email)
    .single();

  if (childAccount) return 'child';

  return null;
}