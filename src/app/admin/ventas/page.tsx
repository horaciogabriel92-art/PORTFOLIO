"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  CircleDollarSign, 
  PackageCheck, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Ban,
  CalendarClock,
  History,
  Download
} from "lucide-react";
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Order } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

export default function VentasPage() {
  const db = useFirestore();
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('fecha_creacion', 'desc')), [db]);
  const { data: orders } = useCollection<Order>(ordersQuery);

  const stats = useMemo(() => {
    if (!orders) return {
      ventasMes: 0,
      entregadosCount: 0,
      canceladosCount: 0,
      promedioEntrega: "---",
      valorFuturo: 0,
      futurosCount: 0
    };

    const ahora = new Date();
    const esteMes = ahora.getMonth();
    const esteAño = ahora.getFullYear();

    const entregados = orders.filter(o => o.estado === 'entregado' || o.estado === 'listo');
    const cancelados = orders.filter(o => o.estado === 'cancelado');
    const futuros = orders.filter(o => ['pendiente', 'en_cola', 'en_proceso'].includes(o.estado));
    
    const ventasMes = entregados
      .filter(o => {
        const fecha = o.fecha_creacion?.toDate();
        return fecha && fecha.getMonth() === esteMes && fecha.getFullYear() === esteAño;
      })
      .reduce((acc, o) => acc + o.total_monto, 0);

    const valorFuturo = futuros.reduce((acc, o) => acc + o.total_monto, 0);

    const tiemposEntrega = entregados
      .filter(o => o.fecha_creacion && o.fecha_fin_real)
      .map(o => {
        const inicio = o.fecha_creacion.toDate();
        const fin = o.fecha_fin_real.toDate();
        return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
      });
    
    const promedioEntrega = tiemposEntrega.length > 0 
      ? (tiemposEntrega.reduce((a, b) => a + b, 0) / tiemposEntrega.length).toFixed(1)
      : "---";

    return {
      ventasMes,
      entregadosCount: entregados.length,
      canceladosCount: cancelados.length,
      promedioEntrega,
      valorFuturo,
      futurosCount: futuros.length
    };
  }, [orders]);

  const chartData = useMemo(() => {
    return [
      { mes: "Ene", ventas: 4500, proyectado: 5200 },
      { mes: "Feb", ventas: 5200, proyectado: 5800 },
      { mes: "Mar", ventas: 4800, proyectado: 5100 },
      { mes: "Abr", ventas: 6100, proyectado: 6400 },
      { mes: "May", ventas: 5900, proyectado: 6200 },
      { mes: "Jun", ventas: stats.ventasMes || 0, proyectado: stats.valorFuturo || 0 },
    ];
  }, [stats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold mb-2">Panel de Ventas</h1>
          <p className="text-muted-foreground">Analítica comercial y proyección de ingresos.</p>
        </div>
        <Button variant="outline" className="glass rounded-xl h-12 border-white/10">
          <Download className="mr-2 h-4 w-4" /> Reporte Mensual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Ventas del Mes" 
          value={`$${stats.ventasMes.toLocaleString()}`} 
          change="+12.4%" 
          up 
          icon={CircleDollarSign} 
          color="text-primary" 
        />
        <StatCard 
          label="Pedidos Completados" 
          value={stats.entregadosCount.toString()} 
          change="+8" 
          up 
          icon={PackageCheck} 
          color="text-accent" 
        />
        <StatCard 
          label="Valor Pedidos Futuros" 
          value={`$${stats.valorFuturo.toLocaleString()}`} 
          description={`${stats.futurosCount} pedidos pendientes`}
          icon={CalendarClock} 
          color="text-secondary" 
        />
        <StatCard 
          label="Tpo. Promedio Entrega" 
          value={`${stats.promedioEntrega} días`} 
          change="-0.4d" 
          up 
          icon={Clock} 
          color="text-primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Desempeño Comercial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="mes" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1f', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ventas Reales" />
                  <Bar dataKey="proyectado" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Proyectado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Ban className="text-destructive" size={20} /> Pedidos Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <h3 className="text-4xl font-bold text-destructive">{stats.canceladosCount}</h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2">Total Histórico</p>
            </div>
            <Separator className="bg-white/5" />
            <div className="space-y-4">
               {orders?.filter(o => o.estado === 'cancelado').slice(0, 3).map(order => (
                 <div key={order.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                   <div>
                     <p className="text-sm font-bold truncate max-w-[120px]">{order.cliente.nombre}</p>
                     <p className="text-[10px] text-muted-foreground">#{order.id.slice(-6)}</p>
                   </div>
                   <Badge variant="outline" className="border-destructive/20 text-destructive text-[10px]">CANCELADO</Badge>
                 </div>
               ))}
               {stats.canceladosCount === 0 && (
                 <p className="text-center text-xs text-muted-foreground italic">No hay cancelaciones registradas.</p>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <History className="text-accent" size={20} /> Histórico de Ventas Recientes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders?.filter(o => o.estado === 'entregado' || o.estado === 'listo').slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center font-bold text-accent">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{order.cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{order.producto.toUpperCase()} • {order.fecha_fin_real?.toDate().toLocaleDateString() || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">${order.total_monto}</p>
                  <p className="text-[10px] uppercase font-black opacity-40">Pago Confirmado</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon, color, description }: { 
  label: string; 
  value: string; 
  change?: string; 
  up?: boolean; 
  icon: any; 
  color: string;
  description?: string;
}) {
  return (
    <Card className="glass-card border-none shadow-xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
            <Icon size={24} />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-bold ${up ? "text-accent" : "text-destructive"}`}>
              {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {change}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
        {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
