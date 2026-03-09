'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Order, Machine } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  AlertTriangle,
  Factory,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const db = useFirestore();

  // Queries con memoización
  const ordersQuery = useMemoFirebase(() => 
    query(collection(db, 'orders'), orderBy('fecha_creacion', 'desc')), 
    [db]
  );
  const { data: orders } = useCollection<Order>(ordersQuery);

  const machinesQuery = useMemoFirebase(() => 
    query(collection(db, 'machines'), orderBy('id')), 
    [db]
  );
  const { data: machines } = useCollection<Machine>(machinesQuery);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    if (!orders || !machines) return null;

    const now = new Date();
    const pendientes = orders.filter(o => o.estado === 'pendiente' || o.estado === 'en_cola');
    const enProceso = orders.filter(o => o.estado === 'en_proceso');
    const criticos = orders.filter(o => {
      if (!o.fecha_entrega_prometida || o.estado === 'entregado') return false;
      const deadline = o.fecha_entrega_prometida.toDate();
      const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursLeft < 24;
    });

    const machinesOcupadas = machines.filter(m => m.estado === 'ocupada').length;
    const machinesLibres = machines.filter(m => m.estado === 'libre').length;

    const ventasMes = orders
      .filter(o => o.estado === 'entregado')
      .filter(o => {
        const fecha = o.fecha_fin_real?.toDate();
        return fecha && fecha.getMonth() === now.getMonth();
      })
      .reduce((acc, o) => acc + o.total_monto, 0);

    return {
      pendientes: pendientes.length,
      enProceso: enProceso.length,
      criticos: criticos.length,
      machinesOcupadas,
      machinesLibres,
      totalMachines: machines.length,
      ventasMes,
      pedidosUrgentes: criticos.slice(0, 5),
    };
  }, [orders, machines]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de operaciones • {new Date().toLocaleDateString('es-UY', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/pedidos/nuevo">
            <Button className="bg-primary hover:bg-primary/90">
              <Package className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pedidos Pendientes"
          value={stats.pendientes}
          description="En cola de producción"
          icon={Package}
          trend={{ value: stats.pendientes > 10 ? '+3' : '0', positive: false }}
          color="text-secondary"
        />
        <StatCard
          title="En Producción"
          value={stats.enProceso}
          description="Actualmente bordando"
          icon={Factory}
          color="text-primary"
        />
        <StatCard
          title="Urgentes (<24h)"
          value={stats.criticos}
          description="Requieren atención inmediata"
          icon={AlertTriangle}
          color={stats.criticos > 0 ? "text-destructive" : "text-accent"}
          alert={stats.criticos > 0}
        />
        <StatCard
          title="Ventas del Mes"
          value={`$${stats.ventasMes.toLocaleString()}`}
          description="Pedidos completados"
          icon={TrendingUp}
          trend={{ value: '+12%', positive: true }}
          color="text-accent"
        />
      </div>

      {/* Machines Status */}
      <Card className="glass-card border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" />
              Estado de Máquinas
            </CardTitle>
            <Link href="/admin/taller">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver Taller <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(stats.machinesOcupadas / stats.totalMachines) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.machinesOcupadas}/{stats.totalMachines} ocupadas
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.machinesLibres} libres
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {stats.machinesOcupadas} trabajando
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Orders */}
      {stats.pedidosUrgentes.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Pedidos Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pedidosUrgentes.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{order.cliente.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        #{order.id.slice(-6)} • {order.producto}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">
                      {order.fecha_entrega_prometida?.toDate().toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Entrega</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickLinkCard
          title="Gestionar Pedidos"
          description="Ver cola de producción y estados"
          href="/admin/pedidos"
          icon={Package}
        />
        <QuickLinkCard
          title="Panel de Taller"
          description="Control de máquinas en tiempo real"
          href="/admin/taller"
          icon={Factory}
        />
        <QuickLinkCard
          title="Reportes"
          description="Análisis de ventas y métricas"
          href="/admin/ventas"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}

// Componentes auxiliares

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color,
  alert 
}: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  color: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn(
      "glass-card border-white/5 transition-all hover:scale-[1.02]",
      alert && "border-destructive/30"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl bg-white/5", color)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-destructive"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ 
  title, 
  description, 
  href, 
  icon: Icon 
}: { 
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href}>
      <Card className="glass-card border-white/5 hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer group">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}


