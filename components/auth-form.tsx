'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/auth';

interface AuthFormProps {
  defaultTab?: 'signin' | 'signup';
}

export function AuthForm({ defaultTab = 'signin' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'parent' | 'child'>('parent');
  const [childSignupSuccess, setChildSignupSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { accountType: type, isNewAccount } = defaultTab === 'signup'
        ? await signUp(email, password, accountType)
        : await signIn(email, password);
      
      // Pour l'inscription d'un enfant
      if (defaultTab === 'signup' && accountType === 'child') {
        setChildSignupSuccess(true);
        return;
      }

      // Pour les parents ou la connexion
      if (type === 'parent') {
        if (isNewAccount) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else if (type === 'child') {
        router.push('/dashboard-child');
      } else {
        throw new Error('Type de compte invalide');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (childSignupSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Inscription réussie !</CardTitle>
          <CardDescription>
            Votre compte a été créé avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>Vous êtes maintenant inscrit. Votre parent doit compléter la configuration de votre compte avant que vous puissiez y accéder.</p>
              <p>Une fois que votre parent aura configuré votre compte, vous pourrez vous connecter avec votre email et mot de passe.</p>
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                setChildSignupSuccess(false);
                setEmail('');
                setPassword('');
                router.push('/auth');
              }}
            >
              Se connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{defaultTab === 'signup' ? 'Inscription' : 'Connexion'}</CardTitle>
        <CardDescription>
          {defaultTab === 'signup' 
            ? 'Créez votre compte pour commencer'
            : 'Entrez vos identifiants pour vous connecter'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            <Label>Type de compte</Label>
            <RadioGroup
              defaultValue="parent"
              onValueChange={(value) => setAccountType(value as 'parent' | 'child')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent">Parent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="child" id="child" />
                <Label htmlFor="child">Enfant</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Chargement...' : defaultTab === 'signup' ? "S'inscrire" : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}