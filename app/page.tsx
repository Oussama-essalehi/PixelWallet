import { WalletIcon, Users, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    title: "Créez un compte",
    description: "Inscrivez-vous en tant que parent et ajoutez vos enfants"
  },
  {
    number: 2,
    title: "Configurez les contrôles",
    description: "Définissez les limites et les restrictions pour chaque enfant"
  },
  {
    number: 3,
    title: "Laissez-les jouer",
    description: "Vos enfants peuvent faire leurs achats en toute sécurité"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-6xl font-bold text-indigo-700 mb-6">PixelWallet</h1>
        <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Le portefeuille gaming sécurisé pour les mineurs
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth">
            <Button size="lg">Commencer</Button>
          </Link>
          <Button variant="outline" size="lg">En savoir plus</Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Fonctionnalités Clés</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-indigo-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comptes Familiaux</h3>
              <p className="text-gray-600">Créez des comptes pour vous et vos enfants, tous gérés en un seul endroit.</p>
            </div>
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-indigo-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transferts Faciles</h3>
              <p className="text-gray-600">Créditez les comptes de vos enfants en quelques clics.</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-indigo-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
              <p className="text-gray-600">Sécurité de niveau bancaire pour protéger les finances de votre famille.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-12 bg-indigo-50">
        <div className="container max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Comment ça fonctionne
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="absolute -left-4 -top-4 w-12 h-12 bg-indigo-700 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Tarification
          </h2>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 bg-indigo-700 rounded-full"></div>
                1€ pour la première recharge (création de la carte virtuelle paramètrés)
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 bg-indigo-700 rounded-full"></div>
                2.5% du montant pour chaque recharge.
              </li>
            </ul>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                Programme de cashback exclusif
              </h3>
              <p className="text-gray-600 mb-4">
                Notre programme de cashback récompense les achats de vos enfants avec des avantages uniques :
              </p>
              <ul className="space-y-2">
                {[
                  "Périodes d'essai gratuites pour des jeux populaires",
                  "Accès exclusif à des jeux développés par des studios indépendants"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="h-2 w-2 bg-indigo-700 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <WalletIcon className="h-8 w-8 text-indigo-700" />
                <span className="ml-2 text-xl font-bold text-indigo-700">PixelWallet</span>
              </div>
              <p className="text-gray-600">La solution de paiement sécurisée pour les jeunes gamers</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900">Tarifs</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">Sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">À propos</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">Politique de confidentialité</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900">Conditions d'utilisation</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-600">
            © 2024 PixelWallet. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}