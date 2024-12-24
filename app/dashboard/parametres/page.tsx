'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ParentProfile {
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: string;
  country: string;
  city: string;
  postal_code: string;
  address: string;
}

export default function ParametresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ParentProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le profil',
          variant: 'destructive',
        });
      }
    }

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  if (!profile) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Paramètres du compte</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Prénom</p>
              <p className="font-medium">{profile.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">{profile.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium">{profile.phone_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium">{new Date(profile.birth_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Adresse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">{profile.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ville</p>
                <p className="font-medium">{profile.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code postal</p>
                <p className="font-medium">{profile.postal_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pays</p>
                <p className="font-medium">{profile.country}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}