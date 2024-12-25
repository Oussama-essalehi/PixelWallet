'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SearchFormProps {
  onSuccess: (email: string) => void;
}

interface UserResult {
  email: string;
  id: string;
}

export function SearchForm({ onSuccess }: SearchFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (searchTerm.length < 3) {
        throw new Error('Veuillez entrer au moins 3 caractères');
      }

      // First, get the current parent's ID
      const { data: parentProfile, error: parentError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (parentError) throw parentError;

      // Use the search_users_by_email function
      const { data, error } = await supabase
        .rpc('search_users_by_email', {
          search_email: searchTerm
        });

      if (error) throw error;

      // Filter out emails already linked to child accounts for this parent
      const { data: existingChildAccounts, error: childError } = await supabase
        .from('child_accounts')
        .select('email')
        .eq('parent_id', parentProfile.id);

      if (childError) throw childError;

      const existingChildEmails = existingChildAccounts.map(account => account.email);

      // Filter results to exclude existing child account emails
      const filteredResults = data.filter(
        (user: UserResult) => !existingChildEmails.includes(user.email)
      );

      setResults(filteredResults);
      
      if (filteredResults.length === 0) {
        toast({
          title: 'Aucun résultat',
          description: 'Aucun compte disponible trouvé avec cet email',
        });
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un compte',
        variant: 'destructive',
      });
      return;
    }
    onSuccess(selectedEmail);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rechercher un compte enfant</CardTitle>
        <CardDescription>
          Recherchez et sélectionnez le compte de votre enfant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </form>

          {results.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <RadioGroup
                value={selectedEmail}
                onValueChange={setSelectedEmail}
                className="space-y-2"
              >
                {results.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value={user.email} id={user.id} />
                    <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                      {user.email}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button type="submit" className="w-full" disabled={!selectedEmail}>
                Configurer ce compte
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}