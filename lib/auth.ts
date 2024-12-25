import { supabase } from './supabase';

export async function signIn(email: string, password: string, selectedAccountType: 'parent' | 'child') {
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

    // Déconnexion immédiate en cas de type de compte incorrect
    const { data: childAccount } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('email', email)
      .single();

    // Validation du type de compte
    if (selectedAccountType === 'parent') {
      // Si l'utilisateur sélectionne Parent mais que c'est un compte enfant
      if (childAccount) {
        await supabase.auth.signOut();
        throw new Error('Ce compte est un compte enfant. Veuillez sélectionner "Enfant".');
      }

      // Vérifie les métadonnées pour savoir si c'est un compte enfant
      const accountType = signInData.user.user_metadata?.account_type;
      if (accountType === 'child') {
        await supabase.auth.signOut();
        throw new Error('Ce compte est un compte enfant. Veuillez sélectionner "Enfant".');
      }

      // Vérifie si le profil parent existe déjà
      const { data: parentProfile, error: parentProfileError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', signInData.user.id)
        .single();

      // Si le profil parent existe, rediriger vers le dashboard
      if (parentProfile) {
        return {
          accountType: 'parent',
          isNewAccount: false,
          hasCompletedOnboarding: true
        };
      }

      // Si le profil parent n'existe pas, rediriger vers l'onboarding
      return {
        accountType: 'parent',
        isNewAccount: false,
        hasCompletedOnboarding: false
      };
    } else if (selectedAccountType === 'child') {
      // Si l'utilisateur sélectionne Enfant mais que ce n'est pas un compte enfant
      if (!childAccount) {
        await supabase.auth.signOut();
        throw new Error('Ce compte n\'est pas un compte enfant. Veuillez sélectionner "Parent".');
      }

      return {
        accountType: 'child',
        isNewAccount: false
      };
    }

    // Déconnexion en cas de type de compte invalide
    await supabase.auth.signOut();
    throw new Error('Type de compte invalide');
  } catch (error: any) {
    // Assurez-vous que l'utilisateur est déconnecté en cas d'erreur
    await supabase.auth.signOut();
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

    // Pour les comptes parent, rester connecté et rediriger vers l'onboarding
    if (accountType === 'parent') {
      // Authentification automatique après l'inscription
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return {
        accountType,
        isNewAccount: true
      };
    }

    // Pour les comptes enfants, déconnexion
    await supabase.auth.signOut();

    return {
      accountType,
      isNewAccount: false
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}