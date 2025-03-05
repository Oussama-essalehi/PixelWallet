import { WalletIcon, Users, ShieldIcon, UserCheckIcon, BookOpenIcon, SlidersHorizontal, Gamepad2, TrendingUp, Users2, Gamepad, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    title: "Créez un compte",
    description: "Inscrivez-vous en tant que parent et ajoutez vos enfants",
    icon: Users
  },
  {
    number: 2,
    title: "Configurez les contrôles",
    description: "Définissez les limites et les restrictions pour chaque enfant",
    icon: SlidersHorizontal
  },
  {
    number: 3,
    title: "Laissez-les jouer",
    description: "Vos enfants peuvent faire leurs achats en toute sécurité",
    icon: Gamepad2
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Soft Gradient Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 text-indigo-700 
            animate-gradient-x hover:animate-gradient-xy transition-all duration-300">
            PixelWallet
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed 
            transform transition-all duration-500 hover:scale-[1.02]">
            Le portefeuille gaming sécurisé pour les mineurs, conçu pour la tranquillité des parents
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/auth" className="group">
              <Button 
                size="lg" 
                className="transition-all duration-300 
                  group-hover:shadow-xl group-hover:shadow-indigo-500/40 
                  group-hover:scale-105 
                  transform"
              >
                Commencer
              </Button>
            </Link>
            <Link href="/about" className="group">
              <Button 
                variant="outline" 
                size="lg" 
                className="transition-all duration-300 
                  hover:bg-indigo-50 
                  hover:border-indigo-500 
                  hover:text-indigo-700
                  transform hover:scale-105"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Video Section - Add after Hero Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-indigo-700">
            Découvrez PixelWallet en action
          </h2>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Une démonstration rapide de notre solution de paiement gaming
          </p>
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9">
            <div className="mx-auto max-w-4xl aspect-video">
              <iframe
                className="w-full h-full rounded-xl"
                src="https://www.youtube.com/embed/vRsWzooO4rw"
                title="PixelWallet - Gaming Wallet (Prototype)"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-indigo-700">Quelques Statistiques</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { 
                value: "282 Milliards €", 
                label: "Valeur du marché",
                icon: TrendingUp
              },
              { 
                value: "3,2 Milliards", 
                label: "Joueurs actifs",
                icon: Users2
              },
              { 
                value: "680 Millions", 
                label: "Joueurs mineurs (-18ans)",
                icon: Gamepad
              },
              { 
                value: "52% des joueurs", 
                label: "s'abonnent à au moins un service de jeux",
                icon: Wallet
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="p-8 rounded-3xl bg-white border-2 border-indigo-100 shadow-lg
                    transition-all duration-300 hover:shadow-xl hover:border-indigo-200 
                    hover:scale-105 group"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center
                      group-hover:bg-indigo-200 transition-all duration-300">
                      <Icon className="w-6 h-6 text-indigo-700" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-indigo-700 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section id="features" className="py-20 bg-indigo-50 backdrop-blur-lg relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Fonctionnalités principales</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all duration-300">
                <ShieldIcon className="w-8 h-8 text-indigo-700 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">Sécurité</h3>
              <p className="text-gray-600">Protégez vos données financières avec des paiements sécurisés et une traçabilité complète des transactions.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all duration-300">
                <UserCheckIcon className="w-8 h-8 text-indigo-700 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">Contrôle parental</h3>
              <p className="text-gray-600">Supervisez les dépenses en temps réel et définissez des limites d'achat flexibles.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all duration-300">
                <BookOpenIcon className="w-8 h-8 text-indigo-700 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">Éducation financière</h3>
              <p className="text-gray-600">Apprenez à vos enfants la gestion de l'argent tout en effectuant des achats sécurisés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="features" className="py-20 bg-white backdrop-blur-lg relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Comment ça fonctionne
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number} 
                  className="text-center p-6 rounded-xl bg-indigo-100 border-2 border-indigo-200 shadow-lg 
                    transition-all duration-300 
                    hover:shadow-xl 
                    hover:scale-105 
                    group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full 
                    flex items-center justify-center 
                    transition-all duration-300">
                    <Icon className="w-8 h-8 text-indigo-700 
                      group-hover:scale-110 
                      transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-indigo-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Tarification
          </h2>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Nous utilisons les services de Stripe pour le traitement des paiements et la création des cartes virtuelles. Les frais totaux pour chaque recharge se décomposent comme suit :
              </p>
            </div>
            <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 bg-indigo-700 rounded-full"></div>
                1€ pour la première recharge (création de la carte virtuelle)
            </li>
            <li className="flex items-center gap-2 text-gray-700 mt-4">
              <div className="h-2 w-2 bg-indigo-700 rounded-full"></div>
              6.2% du montant pour chaque recharge :
            </li>
            <ul className="ml-6 mt-2 mb-4 text-gray-700">
              <li>• 5.2% : Frais Stripe (traitement des paiements et cartes virtuelles)</li>
              <li className="mt-2">• 1% : Frais PixelWallet</li>
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

      {/* Contact Section - Add before Footer */}
      <section id="contact" className="pb-12 bg-indigo-50">
        <div className="container mx-auto max-w-3xl p-16 bg-white rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-6">Contactez-nous</h2>
          <div className="max-w-2xl mx-auto">
            <div className="mt-8 text-center text-lg">
              <p className="text-gray-600">Vous pouvez nous contacter directement par email :</p>
              <a href="mailto:info@pixelwallet.app" className="text-indigo-600 hover:text-indigo-800">
                info@pixelwallet.app
              </a>
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
            &copy; 2024 PixelWallet. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}