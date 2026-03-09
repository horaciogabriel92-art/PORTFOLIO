import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Factory, 
  Palette, 
  Truck, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-headline text-xl font-bold">
              Bordados <span className="text-primary">Pando</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/cotizador">
                <Button variant="ghost" size="sm">Cotizar</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Acceder</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Bordados industriales de alta calidad
            </div>
            
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Tu logo en
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> cualquier prenda</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Servicio profesional de bordado industrial para empresas, instituciones y eventos. 
              Cotiza online y recibe en 24-48 horas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cotizador">
                <Button size="lg" className="text-lg px-8 h-14">
                  Cotizar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#servicios">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="servicios" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-muted-foreground">Tecnología de punta y atención personalizada</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Factory}
              title="7 Máquinas Industriales"
              description="Capacidad para grandes volúmenes con entregas puntuales garantizadas."
            />
            <FeatureCard 
              icon={Palette}
              title="Diseño con IA"
              description="Visualiza tu bordado antes de producir con nuestro generador de mockups."
            />
            <FeatureCard 
              icon={Truck}
              title="Entrega en 24-48h"
              description="Servicio express disponible. Enviamos a todo el país."
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-bold mb-4">Productos disponibles</h2>
            <p className="text-muted-foreground">Bordamos sobre cualquier tipo de prenda</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProductCard 
              emoji="👕"
              title="Camisetas"
              description="100% algodón premium. Disponibles en todos los talles y colores."
              price="Desde $15/u"
            />
            <ProductCard 
              emoji="🧢"
              title="Gorras"
              description="Ajustables, 6 paneles. Ideal para uniformes y regalos corporativos."
              price="Desde $12/u"
            />
            <ProductCard 
              emoji="🎒"
              title="Bolsos"
              description="Lona resistente. Perfectos para eventos y uso diario."
              price="Desde $18/u"
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground">Cotiza y recibe tu pedido en 3 simples pasos</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number="1"
              title="Sube tu logo"
              description="Arrastra tu diseño o crea uno nuevo."
            />
            <StepCard 
              number="2"
              title="Elige prenda"
              description="Camiseta, gorra, bolso u otro producto."
            />
            <StepCard 
              number="3"
              title="Visualiza"
              description="Nuestra IA genera un mockup realista."
            />
            <StepCard 
              number="4"
              title="Recibe"
              description="Producción y entrega en 24-48 horas."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-headline text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Obtén tu cotización personalizada en segundos. Sin compromiso.
          </p>
          <Link href="/cotizador">
            <Button size="lg" className="text-lg px-10 h-14">
              Cotizar Mi Proyecto <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-headline text-lg font-bold">
              Bordados <span className="text-primary">Pando</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Bordados Pando. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Sistema Interno →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componentes auxiliares

function FeatureCard({ icon: Icon, title, description }: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function ProductCard({ emoji, title, description, price }: {
  emoji: string;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center hover:scale-[1.02] transition-transform">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <p className="text-primary font-bold">{price}</p>
    </div>
  );
}

function StepCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
