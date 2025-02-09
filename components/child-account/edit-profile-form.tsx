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

interface EditChildProfileFormProps {
  childAccount: any; // We'll type this properly later
  onSuccess: () => void;
  onCancel?: () => void;
}

export function EditChildProfileForm({ childAccount, onSuccess, onCancel }: EditChildProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bannedCategories, setBannedCategories] = useState<string[]>(childAccount.banned_categories || []);
  const [ageRestrictions, setAgeRestrictions] = useState<string[]>(childAccount.age_restrictions || []);
  
  const [formData, setFormData] = useState({
    first_name: childAccount.first_name || '',
    last_name: childAccount.last_name || '',
    birth_date: childAccount.birth_date || '',
    max_daily_purchases: childAccount.max_daily_purchases?.toString() || '3',
    max_weekly_purchases: childAccount.max_weekly_purchases?.toString() || '10',
    max_monthly_purchases: childAccount.max_monthly_purchases?.toString() || '20',
    max_purchase_amount: childAccount.max_purchase_amount?.toString() || '50',
    max_monthly_spend: childAccount.max_monthly_spend?.toString() || '100',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update child account
      const { error } = await supabase
        .from('child_accounts')
        .update({
          ...formData,
          banned_categories: bannedCategories,
          age_restrictions: ageRestrictions,
          max_daily_purchases: parseInt(formData.max_daily_purchases),
          max_weekly_purchases: parseInt(formData.max_weekly_purchases),
          max_monthly_purchases: parseInt(formData.max_monthly_purchases),
          max_purchase_amount: parseFloat(formData.max_purchase_amount),
          max_monthly_spend: parseFloat(formData.max_monthly_spend),
        })
        .eq('id', childAccount.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Le compte enfant a été mis à jour avec succès',
      });

      onSuccess();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
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

        <div>
          <Label htmlFor="max_daily_purchases">Nombre maximum d'achats par jour</Label>
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
          <Label htmlFor="max_weekly_purchases">Nombre maximum d'achats par semaine</Label>
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
          <Label htmlFor="max_monthly_purchases">Nombre maximum d'achats par mois</Label>
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

      {/* Restrictions de contenu */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Restrictions de contenu</h3>
        
        <div className="space-y-2">
          <Label>Catégories de jeux interdites</Label>
          <div className="grid grid-cols-2 gap-2">
            {GAME_CATEGORIES.map((category) => (
              <div key={`category-${category.id}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={bannedCategories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBannedCategories([...bannedCategories, category.id]);
                    } else {
                      setBannedCategories(bannedCategories.filter(c => c !== category.id));
                    }
                  }}
                />
                <Label htmlFor={`category-${category.id}`}>{category.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Restrictions d'âge</Label>
          <div className="grid grid-cols-4 gap-2">
            {AGE_RESTRICTIONS.map((age) => (
              <div key={`age-${age}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`age-${age}`}
                  checked={ageRestrictions.includes(age)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAgeRestrictions([...ageRestrictions, age]);
                    } else {
                      setAgeRestrictions(ageRestrictions.filter(a => a !== age));
                    }
                  }}
                />
                <Label htmlFor={`age-${age}`}>{age}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
}
