'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/child-account/search-form';
import { ChildProfileForm } from '@/components/child-account/profile-form';

export default function AddChildPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState('');

  return (
    <div className="container py-8">
      <div className="mx-auto ">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Ajouter un compte enfant</h1>
          <p className="mt-2 text-muted-foreground">
            {step === 1 
              ? "Recherchez l'adresse email de votre enfant pour commencer."
              : "Remplissez les informations ci-dessous pour créer un compte pour votre enfant."
            }
          </p>
        </div>

        {step === 1 ? (
          <SearchForm 
            onSuccess={(email) => {
              setChildEmail(email);
              setStep(2);
            }}
          />
        ) : (
          <ChildProfileForm
            childEmail={childEmail}
            onSuccess={() => router.push('/dashboard')}
          />
        )}
      </div>
    </div>
  );
}