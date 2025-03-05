'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { SearchForm } from '@/components/child-account/search-form';
import { ChildProfileForm } from '@/components/child-account/profile-form';

export default function AddChildPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState('');

  const handleSubmit = async (formData: any) => {
    if (!user) return;

    try {
      setLoading(true);

      // Get parent profile
      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!parentProfile) {
        throw new Error('Parent profile not found');
      }

      // Create child account
      const { data: childAccount, error: childError } = await supabase
        .from('child_accounts')
        .insert({
          parent_id: parentProfile.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          email: childEmail,
          coins: 0,
          age_restrictions: formData.ageRestrictions
        })
        .select()
        .single();

      if (childError) throw childError;

      // Initialiser la progression
      const { error: progressError } = await supabase
        .from('user_progression')
        .insert({
          child_account_id: childAccount.id,
          level: 1,
          current_xp: 0,
          total_xp: 0,
          daily_streak: 0,
          last_connection: new Date().toISOString()
        });

      if (progressError) throw progressError;

      toast({
        title: 'Compte enfant créé',
        description: 'Le compte a été créé avec succès.',
      });

      router.push('/dashboard/enfants');
    } catch (error: any) {
      console.error('Error creating child account:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du compte.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto ">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Ajouter un compte enfant</h1>
          <p className="mt-2 text-muted-foreground">
            {step === 1 
              ? "Recherchez l'adresse email de votre enfant pour commencer."
              : "Remplissez les informations ci-dessous pour créer un compte pour votre enfant."
            }
          </p>
        </div>

        {step === 1 ? (
          <SearchForm 
            onSuccess={(email) => {
              setChildEmail(email);
              setStep(2);
            }}
          />
        ) : (
          <ChildProfileForm 
            onSubmit={handleSubmit} 
            loading={loading}
            childEmail={childEmail}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}