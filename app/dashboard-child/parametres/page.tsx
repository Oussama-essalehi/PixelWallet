'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Pen, Shield, CreditCard, Coins, Trophy, Calendar, Gamepad2, Bell, Lock, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays } from 'date-fns';

interface ChildProfile {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  coins: number;
  xp: number;
  daily_streak: number;
  last_connection: string;
  banned_categories: string[];
  age_restrictions: string[];
}

interface VirtualCard {
  card_number: string;
  expiry_date: string;
  cvv: string;
  balance: number;
}

export default function ChildSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch child profile
        const { data: childProfile, error: profileError } = await supabase
          .from('child_accounts')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (profileError) throw profileError;

        // Fetch virtual card
        const { data: card, error: cardError } = await supabase
          .from('virtual_cards')
          .select('*')
          .eq('child_account_id', childProfile.id)
          .single();

        if (cardError && cardError.code !== 'PGRST116') throw cardError;

        // Fetch user progression
        const { data: progression, error: progressionError } = await supabase
          .from('user_progression')
          .select('*')
          .eq('child_account_id', childProfile.id)
          .single();

        if (progressionError) throw progressionError;

        // Vérifier et mettre à jour la série de connexions quotidiennes
        const now = new Date();
        const lastLoginDate = progression?.last_connection 
          ? new Date(progression.last_connection) 
          : null;

        // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
        if (lastLoginDate && format(new Date(lastLoginDate), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
          // L'utilisateur s'est déjà connecté aujourd'hui, pas besoin de mettre à jour
          setProfile({
            ...childProfile,
            coins: progression.coins,
            xp: progression.total_xp,
            daily_streak: progression.daily_streak,
            last_connection: progression.last_connection
          });
          return;
        }

        // Si on arrive ici, c'est une nouvelle journée
        const isConsecutiveDay = lastLoginDate && 
          format(addDays(new Date(lastLoginDate), 1), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        // Calculer le nouveau streak
        const newStreak = isConsecutiveDay 
          ? (progression?.daily_streak || 0) + 1 
          : 1;

        // Mettre à jour last_connection et daily_streak
        const { data: updatedProgression, error: updateError } = await supabase
          .from('user_progression')
          .update({ 
            last_connection: now.toISOString(),
            daily_streak: newStreak
          })
          .eq('child_account_id', childProfile.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setProfile({
          ...childProfile,
          coins: updatedProgression.coins,
          xp: updatedProgression.total_xp,
          daily_streak: updatedProgression.daily_streak,
          last_connection: updatedProgression.last_connection
        });

        // Afficher une notification si la série a été mise à jour
        if (newStreak > (progression?.daily_streak || 0)) {
          toast({
            title: 'Série quotidienne mise à jour !',
            description: `Vous avez maintenant ${newStreak} jours de connexion consécutifs`,
          });
        }
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

  const calculateLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const calculateNextLevelXP = (currentLevel: number) => {
    return Math.pow(currentLevel - 1, 2) * 100;
  };

  const calculateProgress = (xp: number, currentLevel: number) => {
    const currentLevelXP = calculateNextLevelXP(currentLevel);
    const nextLevelXP = calculateNextLevelXP(currentLevel + 1);
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  if (!profile) return null;

  const currentLevel = calculateLevel(profile.xp);
  const progress = calculateProgress(profile.xp, currentLevel);

  return (
    <div className="p-6 space-y-6">

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vue d'ensemble</CardTitle>
              <CardDescription>Informations générales de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Trophy className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Niveau</p>
                    <p className="text-lg font-semibold">{currentLevel}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Coins className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coins</p>
                    <p className="text-lg font-semibold">{profile.coins ? profile.coins : 0}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Série quotidienne</p>
                    <p className="text-lg font-semibold">{profile.daily_streak} jours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Gamepad2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">XP Total</p>
                    <p className="text-lg font-semibold">{profile.xp}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Vos informations de base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">{new Date(profile.birth_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Changer le mot de passe</p>
                      <p className="text-sm text-gray-500">Mettez à jour votre mot de passe régulièrement</p>
                    </div>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dernière connexion</p>
                      <p className="text-sm text-gray-500">
                        {new Date(profile.last_connection).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Bell className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-gray-500">Recevez des notifications sur vos activités</p>
                    </div>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>Mettez à jour vos informations personnelles</DialogDescription>
          </DialogHeader>
          
          {profile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Prénom</label>
                  <Input 
                    defaultValue={profile.first_name}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Nom</label>
                  <Input 
                    defaultValue={profile.last_name}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => {
                // Handle save
                setIsEditing(false);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}