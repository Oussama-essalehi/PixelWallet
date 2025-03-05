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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bannedCategories, setBannedCategories] = useState<string[]>([]);
  const [ageRestrictions, setAgeRestrictions] = useState<string[]>([]);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    max_daily_purchases: '1',
    max_weekly_purchases: '3',
    max_monthly_purchases: '5',
    max_purchase_amount: '30',
    max_monthly_spend: '50',
  });
  const [selectedAgeRestrictions, setSelectedAgeRestrictions] = useState<string[]>([]);

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Mettre à jour les restrictions d'âge disponibles
  const handleDateOfBirthChange = (date: string) => {
    setFormData(prev => ({ ...prev, birth_date: date }));
    const age = calculateAge(date);
    
    if (age >= 18) {
      toast({
        title: "Age non valide",
        description: "L'enfant doit avoir moins de 18 ans",
        variant: "destructive"
      });
      setAgeRestrictions([]);
      return;
    }

    // Définir les restrictions d'âge disponibles
    const allRestrictions = [3, 7, 10, 12, 14, 16, 18];
    const available = allRestrictions.filter(restriction => restriction > age);
    setAgeRestrictions(available.map(r => `+${r}`));
    // Réinitialiser les sélections quand l'âge change
    setSelectedAgeRestrictions([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const age = calculateAge(formData.birth_date);
    if (age >= 18) {
      toast({
        title: "Age non valide",
        description: "L'enfant doit avoir moins de 18 ans",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

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

      // Create child account
      const { data: childAccount, error } = await supabase
        .from('child_accounts')
        .insert([{
          parent_id: parentProfile.id,
          user_id: userData.id,
          email: childEmail,
          gender,
          first_name: formData.first_name,
          last_name: formData.last_name,
          birth_date: formData.birth_date,
          banned_categories: bannedCategories,
          age_restrictions: selectedAgeRestrictions,
          max_daily_purchases: parseInt(formData.max_daily_purchases),
          max_weekly_purchases: parseInt(formData.max_weekly_purchases),
          max_monthly_purchases: parseInt(formData.max_monthly_purchases),
          max_purchase_amount: parseFloat(formData.max_purchase_amount),
          max_monthly_spend: parseFloat(formData.max_monthly_spend),
          coins: 0
        }])
        .select()
        .single();

      if (error) throw error;

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
    <Card className="mb-8">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleDateOfBirthChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label>Genre</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value: 'M' | 'F') => setGender(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="gender-m" />
                    <Label htmlFor="gender-m">Masculin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="gender-f" />
                    <Label htmlFor="gender-f">Féminin</Label>
                  </div>
                </RadioGroup>
              </div>
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
          {ageRestrictions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Restrictions d'âge</h3>
              <div className="space-y-2">
                {ageRestrictions.map((restriction) => (
                  <div key={restriction} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${restriction}`}
                      checked={selectedAgeRestrictions.includes(restriction)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAgeRestrictions(prev => [...prev, restriction]);
                        } else {
                          setSelectedAgeRestrictions(prev => 
                            prev.filter(r => r !== restriction)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`age-${restriction}`} className="text-sm">
                      {restriction}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.birth_date || calculateAge(formData.birth_date) >= 18}
          >
            {loading ? 'Configuration en cours...' : 'Configurer le compte'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}