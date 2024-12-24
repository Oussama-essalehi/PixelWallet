import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message === 'Invalid login credentials') {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw signInError;
    }

    if (!signInData.user) {
      throw new Error('Erreur de connexion');
    }

    // Vérifie si l'utilisateur existe dans child_accounts
    const { data: childAccount, error: childError } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (childAccount) {
      return {
        accountType: 'child',
        isNewAccount: false
      };
    }

    // Vérifie les métadonnées pour savoir si c'est un compte enfant
    const accountType = signInData.user.user_metadata?.account_type;
    if (accountType === 'child') {
      // Déconnexion immédiate si c'est un enfant non configuré
      await supabase.auth.signOut();
      throw new Error('Votre compte n\'a pas encore été configuré par un parent. Veuillez patienter.');
    }

    // Pour les parents, redirection directe vers dashboard
    return {
      accountType: 'parent',
      isNewAccount: false
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signUp(email: string, password: string, accountType: 'parent' | 'child') {
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: accountType
        },
        emailRedirectTo: `${window.location.origin}/auth`,
      }
    });

    if (signUpError) throw signUpError;

    if (!signUpData.user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Déconnexion immédiate après l'inscription
    await supabase.auth.signOut();

    return {
      accountType,
      isNewAccount: accountType === 'parent'
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}