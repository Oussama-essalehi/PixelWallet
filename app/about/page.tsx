import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { 
  BrainCircuitIcon, 
  ShieldCheckIcon, 
  WalletCardsIcon,
  GraduationCapIcon,
  UsersIcon,
  HeartIcon,
  Lightbulb,
  Target
} from "lucide-react"

export const metadata: Metadata = {
  title: "À propos | PixelWallet",
  description: "Découvrez PixelWallet, un projet innovant développé par l'équipe PixelHeroes",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <section className="text-center space-y-4">
          <GraduationCapIcon className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            À propos de PixelWallet
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un projet innovant du Master 1 MIAGE à l&apos;Université Paul Sabatier de Toulouse
          </p>
        </section>

        <section className="space-y-6">
          <Card className="p-6 text-center bg-indigo-50 border-2 border-indigo-200">
            <div>
              <Lightbulb className="h-16 w-16 mx-auto text-primary p-1 mb-4"/>
              <h2 className="text-2xl font-semibold mb-4">Notre Vision</h2>
              <p className="text-muted-foreground">
                PixelWallet est né de notre passion pour l&apos;innovation et l&apos;éducation financière. 
                Dans un monde où la littératie financière devient cruciale, nous avons créé une solution 
                qui permet aux parents d&apos;accompagner leurs enfants dans leur apprentissage de la 
                gestion d&apos;argent.
              </p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-indigo-50 border-2 border-indigo-200">
            <div>
              <Target className="h-16 w-16 mx-auto text-primary p-1 mb-4"/>
              <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
              <p className="text-muted-foreground">
                Notre mission est de révolutionner la façon dont les familles abordent l&apos;éducation 
                financière, en rendant l&apos;apprentissage de la gestion d&apos;argent ludique, 
                sécurisé et adapté aux besoins modernes.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-6 bg-gray-50 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold text-center">Nos Solutions Innovantes</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 space-y-4">
              <WalletCardsIcon className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Gestion Simplifiée</h3>
              <p className="text-muted-foreground">
                Une interface intuitive permettant aux parents de gérer et suivre les dépenses 
                de leurs enfants en temps réel.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <BrainCircuitIcon className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Apprentissage Ludique</h3>
              <p className="text-muted-foreground">
                Des fonctionnalités gamifiées pour rendre l&apos;apprentissage de la gestion 
                financière amusant et engageant.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <ShieldCheckIcon className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Sécurité Maximale</h3>
              <p className="text-muted-foreground">
                Une plateforme sécurisée avec un contrôle parental avancé pour une tranquillité 
                d&apos;esprit totale.
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <UsersIcon className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold">Notre Équipe PixelHeroes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center space-y-2">
              <h3 className="font-semibold text-lg">Hamza EL BELGHITI</h3>
              <p className="text-primary">Développeur Data/AI et Web</p>
              <p className="text-sm text-muted-foreground">Alternant @Bient.ai</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <h3 className="font-semibold text-lg">Fodé DIAKITE</h3>
              <p className="text-primary">Chef de Projet</p>
              <p className="text-sm text-muted-foreground">Alternant @Airbus</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <h3 className="font-semibold text-lg">Oussame ESSALEHI</h3>
              <p className="text-primary">Développeur Web</p>
              <p className="text-sm text-muted-foreground">Alternant @Acteam ENR</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <h3 className="font-semibold text-lg">Bailo BARRY</h3>
              <p className="text-primary">Développeur Mobile</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <h3 className="font-semibold text-lg">Hachim MAHAMADENE</h3>
              <p className="text-primary">Chargé Communication & Marketing</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
