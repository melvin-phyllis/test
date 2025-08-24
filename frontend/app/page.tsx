import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, Target, TrendingUp, Users, Zap, Globe, Shield, Activity } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/50 to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold text-primary">ProspectAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Démo Live
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Connexion Admin</Link>
            </Button>
            <Button asChild className="animate-pulse-glow">
              <Link href="/dashboard">
                Dashboard Live <Activity className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 animate-float">
            <Zap className="w-4 h-4 mr-2" />
            CrewAI • Temps Réel • Automatisation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Prospection IA
            <br />
            <span className="text-accent">Temps Réel</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Regardez vos agents CrewAI travailler en temps réel. Prospection automatisée, qualification intelligente, et
            notifications instantanées pour maximiser vos conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 animate-pulse-glow" asChild>
              <Link href="/dashboard">
                Voir le Dashboard Live <Activity className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/auth/login">Accès Administrateur</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4</div>
              <div className="text-muted-foreground">Agents IA Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-muted-foreground">Surveillance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">Real-time</div>
              <div className="text-muted-foreground">Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-3">95%</div>
              <div className="text-muted-foreground">Précision IA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Fonctionnalités avancées</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment notre IA transforme votre approche de la prospection
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Agents IA Intelligents</CardTitle>
                <CardDescription>
                  Des agents IA spécialisés qui analysent et qualifient vos prospects automatiquement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Ciblage Précis</CardTitle>
                <CardDescription>
                  Identifiez les prospects les plus qualifiés grâce à notre algorithme de scoring avancé
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Analytics Temps Réel</CardTitle>
                <CardDescription>
                  Suivez vos performances en temps réel avec des tableaux de bord interactifs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Gestion d'Équipe</CardTitle>
                <CardDescription>
                  Coordonnez vos équipes commerciales avec des outils collaboratifs avancés
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Prospection Globale</CardTitle>
                <CardDescription>
                  Étendez votre prospection à l'international avec notre base de données mondiale
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Sécurité Avancée</CardTitle>
                <CardDescription>
                  Protection des données avec chiffrement de bout en bout et conformité RGPD
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">Dashboard en Action</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez comment nos agents CrewAI travaillent en temps réel pour votre prospection
          </p>
          <div className="relative max-w-4xl mx-auto">
            <Card className="border-border/50 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Sarah (Researcher) - En cours</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Marcus (Analyst) - Actif</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="mb-4 animate-notification-slide">
                      🎯 Nouveau prospect qualifié: Jean Dupont (TechCorp) - Score: 89/100
                    </Badge>
                    <p className="text-muted-foreground">
                      Agents IA en action • Notifications temps réel • Qualification automatique
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            <Button size="lg" className="animate-pulse-glow" asChild>
              <Link href="/dashboard">
                Accéder au Dashboard Complet <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-accent text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardContent className="relative z-10 py-16 text-center">
              <h2 className="text-4xl font-serif font-bold mb-4">Prêt à transformer votre prospection ?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Rejoignez des milliers d'entreprises qui ont déjà révolutionné leur approche commerciale
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                  <Link href="/dashboard">
                    Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary bg-transparent"
                >
                  Planifier une démo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-serif font-bold text-primary">ProspectAI</span>
              </div>
              <p className="text-muted-foreground">La plateforme de prospection IA nouvelle génération</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Carrières
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ProspectAI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
