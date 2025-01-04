'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/child-account/search-form';
import { ChildProfileForm } from '@/components/child-account/profile-form';

export default function AddChildPage() {
  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState('');

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-6">Ajouter un compte enfant</h1>
      
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
          onSuccess={() => setStep(1)}
        />
      )}
    </div>
  );
}