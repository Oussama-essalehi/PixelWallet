'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChildAccount } from '@/hooks/use-child-account';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreditCard, ShieldCheck, AlertTriangle, Ban, Calendar } from 'lucide-react';

export default function ParametresPage() {
  const { account, loading } = useChildAccount();

  if (loading) return <LoadingSpinner />;
  if (!account) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du compte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{account.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{account.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{account.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">
                  <Calendar className="inline-block mr-2 h-4 w-4 text-gray-500" />
                  {new Date(account.birth_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Limites de dépenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Limite par achat</p>
                <p className="font-medium">{account.max_purchase_amount} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Limite quotidienne</p>
                <p className="font-medium">{account.max_daily_purchases} achats</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Limite hebdomadaire</p>
                <p className="font-medium">{account.max_weekly_purchases} achats</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Limite mensuelle</p>
                <p className="font-medium">{account.max_monthly_purchases} achats</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dépense mensuelle max</p>
                <p className="font-medium">{account.max_monthly_spend} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Catégories bloquées</p>
              {account.banned_categories && account.banned_categories.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {account.banned_categories.map((category) => (
                    <Badge key={category} variant="destructive">{category.toUpperCase()}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune catégorie bloquée</p>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Restrictions d'âge</p>
              {account.age_restrictions && account.age_restrictions.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {account.age_restrictions.map((restriction) => (
                    <Badge key={restriction} variant="outline">{restriction}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune restriction d'âge</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Solde et alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Solde actuel</p>
              <p className="font-medium text-xl text-green-600">{account.current_balance} €</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}