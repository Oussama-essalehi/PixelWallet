'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Pen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function ParametresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        console.log('Profile data:', data);
        console.log('Error if any:', error);
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

  const handleEditClick = () => {
    if (profile) {
      setEditedProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('parent_profiles')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone_number: editedProfile.phone_number,
          address: editedProfile.address,
          city: editedProfile.city,
          postal_code: editedProfile.postal_code,
          country: editedProfile.country
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setProfile(editedProfile);
      setIsEditing(false);

      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Paramètres du compte</h1>
        <Button variant="outline" onClick={handleEditClick}>
          <Pen className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>
      
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier vos informations</DialogTitle>
            <DialogDescription>Mettez à jour vos informations personnelles</DialogDescription>
          </DialogHeader>
          
          {editedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Prénom</label>
                  <Input 
                    name="first_name"
                    value={editedProfile.first_name} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Nom</label>
                  <Input 
                    name="last_name"
                    value={editedProfile.last_name} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Téléphone</label>
                  <Input 
                    name="phone_number"
                    value={editedProfile.phone_number} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Adresse</label>
                <Input 
                  name="address"
                  value={editedProfile.address} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Ville</label>
                  <Input 
                    name="city"
                    value={editedProfile.city} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Code postal</label>
                  <Input 
                    name="postal_code"
                    value={editedProfile.postal_code} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pays</label>
                  <Select
                    value={editedProfile.country}
                    onValueChange={(value) => {
                      if (editedProfile) {
                        setEditedProfile({
                          ...editedProfile,
                          country: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              onClick={handleSaveProfile} 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}