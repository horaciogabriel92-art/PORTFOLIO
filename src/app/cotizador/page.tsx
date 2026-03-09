"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CheckCircle2, 
  Smartphone, 
  Mail, 
  User, 
  Shirt, 
  Upload,
  ChevronRight,
  ChevronLeft,
  X,
  Download,
  Info,
  Package,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRODUCTOS = [
  { id: 't-shirt', nombre: 'Camiseta', icon: '👕', desc: '100% algodón premium', basePrice: 15, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop' },
  { id: 'cap', nombre: 'Gorra', icon: '🧢', desc: 'Ajustable, 6 paneles', basePrice: 12, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop' },
  { id: 'bag', nombre: 'Bolso', icon: '🎒', desc: 'Lona resistente', basePrice: 18, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop' }
];

const POSICIONES = [
  { id: 'pecho-centro', nombre: 'Centro', mockupClass: 'top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%]' },
  { id: 'pecho-izq', nombre: 'Izquierdo', mockupClass: 'top-[35%] left-[35%] -translate-x-1/2 -translate-y-1/2 w-[20%]' },
  { id: 'pecho-der', nombre: 'Derecho', mockupClass: 'top-[35%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-[20%]' },
  { id: 'manga-izq', nombre: 'Manga Izq', mockupClass: 'top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[12%] -rotate-12' },
  { id: 'manga-der', nombre: 'Manga Der', mockupClass: 'top-[40%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-[12%] rotate-12' },
  { id: 'espalda', nombre: 'Espalda', mockupClass: 'top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[45%]' }
];

const COLORES = [
  { id: 'blanco', nombre: 'Blanco', hex: '#ffffff', filter: 'brightness(1.1) contrast(1)' },
  { id: 'negro', nombre: 'Negro', hex: '#1a1a1a', filter: 'brightness(0.3) contrast(1.2) grayscale(1)' },
  { id: 'azul', nombre: 'Azul marino', hex: '#1e3a5f', filter: 'sepia(1) saturate(5) hue-rotate(190deg) brightness(0.5)' },
  { id: 'rojo', nombre: 'Rojo', hex: '#dc2626', filter: 'sepia(1) saturate(5) hue-rotate(320deg) brightness(0.6)' },
  { id: 'verde', nombre: 'Verde', hex: '#059669', filter: 'sepia(1) saturate(5) hue-rotate(100deg) brightness(0.5)' }
];

export default function CotizadorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    logo: null as string | null,
    producto: 't-shirt',
    cantidad: 50,
    color: 'blanco',
    posicion: 'pecho-centro',
    nombre: '',
    email: '',
    phone: '',
  });

  const calcularPrecio = () => {
    const prod = PRODUCTOS.find(p => p.id === formData.producto);
    const base = prod?.basePrice || 15;
    const volumen = formData.cantidad >= 100 ? 0.85 : formData.cantidad >= 50 ? 0.9 : 1;
    const unitario = base * volumen;
    const total = unitario * formData.cantidad;
    return {
      unitario: unitario.toFixed(2),
      min: Math.floor(total * 0.9),
      max: Math.ceil(total * 1.1),
      total: total.toFixed(2)
    };
  };

  const precio = calcularPrecio();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const goToStep2 = () => {
    if (formData.logo) setStep(2);
  };

  const handleSubmitContact = async () => {
    setLoading(true);
    try {
      await fetch('/api/n8n-simulation', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          estimatedPrice: precio.total,
          source: 'Public Quotation Tool'
        })
      });
      setStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedColor = COLORES.find(c => c.id === formData.color);
  const selectedProduct = PRODUCTOS.find(p => p.id === formData.producto);
  const selectedPosition = POSICIONES.find(p => p.id === formData.posicion);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden font-body">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 animate-grid opacity-10" />
      </div>

      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            <span className="animate-bounce">⚡</span> Cotizador Digital Pro
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Bordados Pando
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Configura tu pedido industrial y obtén una cotización personalizada al instante.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto">
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="glass-card rounded-[2.5rem] p-10 border-white/10 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                <span className={cn(step >= 1 && "text-primary")}>Diseño</span>
                <span className={cn(step >= 2 && "text-primary")}>Contacto</span>
                <span className={cn(step >= 3 && "text-accent")}>Cotización</span>
              </div>
              
              <div className="flex gap-2 mb-10">
                <div className={cn("h-1 flex-1 rounded-full transition-all duration-700", step >= 1 ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/5")} />
                <div className={cn("h-1 flex-1 rounded-full transition-all duration-700", step >= 2 ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/5")} />
                <div className={cn("h-1 flex-1 rounded-full transition-all duration-700", step >= 3 ? "bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/5")} />
              </div>

              {step === 1 && (
                <div className="space-y-10 slide-up">
                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Upload className="w-4 h-4 text-primary" /> 1. Sube tu logo
                    </Label>
                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group relative overflow-hidden",
                        isDragging ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50 hover:bg-white/5",
                        formData.logo ? "border-accent/50 bg-accent/5" : ""
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      {!formData.logo ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">Haz clic o arrastra tu archivo</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG o SVG • El fondo se eliminará automáticamente</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black/20 border border-white/10 p-2">
                              <img src={formData.logo} alt="Logo preview" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-accent text-xl">¡Diseño cargado!</p>
                              <p className="text-xs text-muted-foreground">Haz clic para reemplazar el archivo</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, logo: null}); }}
                            className="text-muted-foreground hover:text-destructive h-12 w-12 rounded-full"
                          >
                            <X className="w-6 h-6" />
                          </Button>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-primary" /> 2. Elige la prenda
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PRODUCTOS.map(p => (
                        <div 
                          key={p.id}
                          className={cn(
                            "glass-card p-6 rounded-3xl border-2 transition-all cursor-pointer group text-center",
                            formData.producto === p.id ? "border-primary bg-primary/5 shadow-lg" : "border-transparent hover:border-white/10"
                          )}
                          onClick={() => setFormData({...formData, producto: p.id})}
                        >
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{p.icon}</div>
                          <div className="font-bold">{p.nombre}</div>
                          <div className="text-[10px] text-muted-foreground uppercase mt-1">{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <Label className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                        <span className="flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> 3. Cantidad</span>
                        <span className="text-primary font-headline text-xl">{formData.cantidad} u.</span>
                      </Label>
                      <input 
                        type="range" 
                        min="10" 
                        max="500" 
                        step="10"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                        className="w-full accent-primary h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                        <span>Min 10</span>
                        <span className="text-accent">Dcto. volumen (+100)</span>
                        <span>500+</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Label className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" /> 4. Posición
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {POSICIONES.map(pos => (
                          <button
                            key={pos.id}
                            className={cn(
                              "text-[9px] p-2.5 rounded-xl border-2 transition-all font-black uppercase tracking-tighter",
                              formData.posicion === pos.id ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-white/5 text-muted-foreground hover:bg-white/5"
                            )}
                            onClick={() => setFormData({...formData, posicion: pos.id})}
                          >
                            {pos.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase tracking-widest">5. Color del tejido</Label>
                    <div className="flex flex-wrap gap-4">
                      {COLORES.map(c => (
                        <button
                          key={c.id}
                          className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all group",
                            formData.color === c.id ? "border-primary bg-primary/10" : "border-white/5 hover:border-white/20"
                          )}
                          onClick={() => setFormData({...formData, color: c.id})}
                        >
                          <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: c.hex }} />
                          <span className="text-xs font-bold">{c.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 rounded-[1.5rem] text-xl font-bold shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                    disabled={!formData.logo}
                    onClick={goToStep2}
                  >
                    Ingresar mis datos <ChevronRight className="ml-2 w-6 h-6" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 slide-up">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="rounded-full h-12 w-12 hover:bg-white/5">
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <h2 className="text-3xl font-bold font-headline">Datos de Contacto</h2>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <User className="w-4 h-4 text-primary" /> Nombre y Apellido
                      </Label>
                      <Input 
                        placeholder="Tu nombre completo" 
                        className="glass h-14 rounded-2xl border-white/10 text-lg px-6"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary" /> Correo Electrónico
                      </Label>
                      <Input 
                        type="email" 
                        placeholder="tu@empresa.com" 
                        className="glass h-14 rounded-2xl border-white/10 text-lg px-6"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Smartphone className="w-4 h-4 text-primary" /> Celular / WhatsApp
                      </Label>
                      <Input 
                        placeholder="+598 099 123 456" 
                        className="glass h-14 rounded-2xl border-white/10 text-lg px-6"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-[1.5rem] p-6 text-sm text-muted-foreground flex gap-5">
                    <Info className="w-6 h-6 text-primary shrink-0" />
                    <p className="font-medium leading-relaxed">
                      Al procesar tu cotización, un asesor técnico revisará tu diseño para validar la viabilidad de las puntadas y te contactará en breve.
                    </p>
                  </div>

                  <Button 
                    className="w-full h-16 rounded-[1.5rem] text-xl font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20"
                    disabled={!formData.nombre || !formData.email || !formData.phone || loading}
                    onClick={handleSubmitContact}
                  >
                    {loading ? <><Loader2 className="mr-2 animate-spin" /> Procesando...</> : <>Generar Presupuesto <CheckCircle2 className="ml-2 w-6 h-6" /></>}
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 slide-up text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-accent/40 mb-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-headline font-bold">¡Cotización Lista!</h2>
                  <p className="text-muted-foreground text-lg">
                    Hola <strong>{formData.nombre}</strong>, hemos enviado los detalles a <strong>{formData.email}</strong>.
                  </p>

                  <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Inversión Estimada</p>
                    <div className="text-5xl font-headline font-bold text-accent mb-2">
                      ${precio.min} - ${precio.max}
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      * El valor exacto depende de la cantidad total de puntadas (digitalización).
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl glass" onClick={() => window.print()}>
                      <Download className="mr-2 w-5 h-5" /> Guardar PDF
                    </Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-primary" onClick={() => setStep(1)}>
                      Nueva Cotización
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="glass-card rounded-[3rem] overflow-hidden border-white/10 shadow-2xl bg-black/20">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Estudio Visual</span>
                <h3 className="font-headline font-bold text-2xl tracking-tight">Previsualización Real</h3>
              </div>

              <div className="p-10 space-y-10">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white group shadow-inner">
                  {selectedProduct && (
                    <img 
                      src={selectedProduct.image} 
                      alt="Base product" 
                      className="w-full h-full object-cover transition-all duration-1000"
                      style={{ 
                        filter: selectedColor?.filter || 'none'
                      }}
                    />
                  )}
                  
                  {formData.logo && (
                    <div 
                      className={cn(
                        "absolute transition-all duration-700 pointer-events-none",
                        selectedPosition?.mockupClass
                      )}
                    >
                      <img 
                        src={formData.logo} 
                        alt="Logo overlay" 
                        className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] animate-pulse"
                        style={{ mixBlendMode: 'multiply', opacity: 0.9 }}
                      />
                    </div>
                  )}

                  <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white">
                    {formData.color}
                  </div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {selectedProduct?.nombre} • {formData.cantidad} u.
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                      <span className="text-muted-foreground/60 font-black uppercase tracking-widest">Valor Unitario</span>
                      <span className="font-bold text-primary">${precio.unitario}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                      <span className="text-muted-foreground/60 font-black uppercase tracking-widest">Dscto. Volumen</span>
                      <span className="font-bold text-accent">{formData.cantidad >= 100 ? '15%' : formData.cantidad >= 50 ? '10%' : '0%'}</span>
                    </div>
                  </div>

                  {step < 3 ? (
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-dashed border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Precio Estimado</p>
                      <div className="text-2xl font-headline font-bold blur-md select-none">
                        $XXXX - $XXXX
                      </div>
                      <p className="text-[9px] text-primary font-bold uppercase tracking-tighter mt-2">
                        Completa tus datos para revelar el precio
                      </p>
                    </div>
                  ) : (
                    <div className="bg-primary/10 rounded-2xl p-6 text-center border border-primary/20 animate-in zoom-in duration-500">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">Costo ESTIMADO</p>
                       <div className="text-4xl font-headline font-bold text-primary">
                        ${precio.min} - ${precio.max}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-around px-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-accent" /> Entrega 24h</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-accent" /> Muestra Gratis</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-accent" /> Garantía</div>
            </div>
          </div>
        </main>
      </div>

      <button className="fixed bottom-10 right-10 w-20 h-20 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group">
        <Smartphone className="w-10 h-10 group-hover:animate-bounce" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">1</span>
      </button>
    </div>
  );
}
