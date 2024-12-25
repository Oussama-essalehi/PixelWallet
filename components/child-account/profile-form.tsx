'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GAME_CATEGORIES } from '@/lib/constants/child-account';

const AGE_RESTRICTIONS = [
  '+3',
  '+7',
  '+10',
  '+12',
  '+14',
  '+16',
  '+18'
];

interface ChildProfileFormProps {
  childEmail: string;
  onSuccess: () => void;
}

export function ChildProfileForm({ childEmail, onSuccess }: ChildProfileFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bannedCategories, setBannedCategories] = useState<string[]>([]);
  const [ageRestrictions, setAgeRestrictions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    max_daily_purchases: '3',
    max_weekly_purchases: '10',
    max_monthly_purchases: '20',
    max_purchase_amount: '50',
    max_monthly_spend: '100',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get parent profile
      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!parentProfile) throw new Error('Parent profile not found');

      // Get child user_id from auth.users
      const { data: userData, error: userError } = await supabase
        .from('auth_users_view')
        .select('id')
        .eq('email', childEmail)
        .single();

      if (userError || !userData) {
        throw new Error('Child user not found');
      }

      // Create child account - la carte virtuelle sera créée automatiquement par le trigger
      const { data: childAccount, error } = await supabase
        .from('child_accounts')
        .insert([{
          parent_id: parentProfile.id,
          user_id: userData.id,
          email: childEmail,
          ...formData,
          banned_categories: bannedCategories,
          age_restrictions: ageRestrictions,
          max_daily_purchases: parseInt(formData.max_daily_purchases),
          max_weekly_purchases: parseInt(formData.max_weekly_purchases),
          max_monthly_purchases: parseInt(formData.max_monthly_purchases),
          max_purchase_amount: parseFloat(formData.max_purchase_amount),
          max_monthly_spend: parseFloat(formData.max_monthly_spend),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Le compte enfant a été configuré avec succès',
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

  // Fonctions utilitaires pour générer le numéro de carte et la date d'expiration
  function generateVirtualCardNumber() {
    // Génère un numéro de carte virtuelle de 16 chiffres sans décimales
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10).toString()).join('');
  }

  function generateExpiryDate() {
    // Génère une date d'expiration 3 ans dans le futur
    const now = new Date();
    const expiryDate = new Date(now.getFullYear() + 3, now.getMonth());
    return expiryDate.toISOString().split('T')[0];
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurer le profil</CardTitle>
        <CardDescription>
          Complétez les informations du profil de votre enfant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birth_date">Date de naissance</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Limites d'achats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Limites d'achats</h3>
            
            <div>
              <Label htmlFor="max_purchase_amount">Montant maximum par achat (€)</Label>
              <Input
                id="max_purchase_amount"
                name="max_purchase_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.max_purchase_amount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="max_monthly_spend">Limite de dépenses mensuelles (€)</Label>
              <Input
                id="max_monthly_spend"
                name="max_monthly_spend"
                type="number"
                min="0"
                step="0.01"
                value={formData.max_monthly_spend}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_daily_purchases">Achats par jour</Label>
                <Input
                  id="max_daily_purchases"
                  name="max_daily_purchases"
                  type="number"
                  min="0"
                  value={formData.max_daily_purchases}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_weekly_purchases">Achats par semaine</Label>
                <Input
                  id="max_weekly_purchases"
                  name="max_weekly_purchases"
                  type="number"
                  min="0"
                  value={formData.max_weekly_purchases}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_monthly_purchases">Achats par mois</Label>
                <Input
                  id="max_monthly_purchases"
                  name="max_monthly_purchases"
                  type="number"
                  min="0"
                  value={formData.max_monthly_purchases}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Restrictions de contenu */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Restrictions de contenu</h3>
            
            <div>
              <Label className="mb-2 block">Catégories de jeux à bannir</Label>
              <div className="space-y-2">
                {GAME_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={bannedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBannedCategories(prev => [...prev, category.id]);
                        } else {
                          setBannedCategories(prev => prev.filter(id => id !== category.id));
                        }
                      }}
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Restrictions d'âge */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Restrictions d'âge</h3>
            <div className="grid grid-cols-3 gap-4">
              {AGE_RESTRICTIONS.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox 
                    id={restriction}
                    checked={ageRestrictions.includes(restriction)}
                    onCheckedChange={(checked) => {
                      setAgeRestrictions(prev => 
                        checked 
                          ? [...prev, restriction]
                          : prev.filter(r => r !== restriction)
                      );
                    }}
                  />
                  <Label htmlFor={restriction}>{restriction}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Configuration en cours...' : 'Configurer le compte'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}