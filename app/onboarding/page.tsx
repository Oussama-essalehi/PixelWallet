'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletIcon } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const francophoneCountries = [
  { value: 'France', label: 'France' },
  { value: 'Belgique', label: 'Belgique' },
  { value: 'Suisse', label: 'Suisse' },
  { value: 'Maroc', label: 'Maroc' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Luxembourg', label: 'Luxembourg' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'Sénégal', label: 'Sénégal' },
  { value: 'Côte d\'Ivoire', label: 'Côte d\'Ivoire' },
  { value: 'Tunisie', label: 'Tunisie' }
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    phone_number: '',
    country: '',
    city: '',
    postal_code: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAgeError('');

    try {
      // Validate age (must be 18+)
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        setAgeError('Vous devez avoir au moins 18 ans pour créer un compte');
        return;
      }

      const { error } = await supabase
        .from('parent_profiles')
        .insert([{
          user_id: user?.id,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Votre profil a été créé avec succès',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <Link href="/" className="flex items-center mb-8">
        <WalletIcon className="h-8 w-8 text-indigo-700" />
        <span className="ml-2 text-2xl font-bold text-indigo-700">PixelWallet</span>
      </Link>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complétez votre profil</CardTitle>
          <CardDescription>
            Ces informations sont nécessaires pour sécuriser votre compte et celui de vos enfants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <Input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => {
                  setFormData({ ...formData, birth_date: e.target.value });
                  setAgeError('');
                }}
              />
              {ageError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{ageError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
              <Input
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code postal</label>
                <Input
                  required
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pays</label>
              <Select
                required
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre pays" />
                </SelectTrigger>
                <SelectContent>
                  {francophoneCountries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : 'Continuer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}