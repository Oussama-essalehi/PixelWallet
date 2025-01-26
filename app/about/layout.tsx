import { Metadata } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  HomeIcon, 
  InfoIcon,
  CreditCardIcon,
  HistoryIcon,
  UsersIcon,
  LogOutIcon, 
  WalletIcon
} from "lucide-react"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "À propos | PixelWallet",
  description: "Découvrez PixelWallet, un projet innovant développé par l'équipe PixelHeroes",
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          {children}
        </ScrollArea>
      </div>

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
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">À propos</Link></li>
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
  )
}
