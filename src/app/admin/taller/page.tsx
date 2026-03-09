'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Monitor,
  ListOrdered,
  Wand2,
  AlertTriangle,
  Timer,
  Activity,
  Wrench,
  Pause,
  RotateCcw,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Alert,
  AlertDescription 
} from "@/components/ui/alert";
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, increment, writeBatch, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Machine, Order, AlertLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function WorkshopPage() {
  const db = useFirestore();
  const [now, setNow] = useState(new Date());
  const [optimizing, setOptimizing] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showMachineDialog, setShowMachineDialog] = useState(false);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Queries
  const machinesQuery = useMemoFirebase(() => 
    query(collection(db, 'machines'), orderBy('id')), 
    [db]
  );
  const { data: machines, loading: machinesLoading } = useCollection<Machine>(machinesQuery);

  const activeOrdersQuery = useMemoFirebase(() => 
    query(
      collection(db, 'orders'), 
      where('estado', 'in', ['pendiente', 'en_cola', 'en_proceso']),
      orderBy('prioridad', 'desc'),
      orderBy('fecha_entrega_prometida', 'asc')
    ), 
    [db]
  );
  const { data: activeOrders, loading: ordersLoading } = useCollection<Order>(activeOrdersQuery);

  // Datos derivados
  const pendingQueue = activeOrders?.filter(o => o.estado === 'en_cola' || o.estado === 'pendiente') || [];
  const urgentOrders = pendingQueue.filter(o => {
    if (!o.fecha_entrega_prometida) return false;
    const deadline = o.fecha_entrega_prometida.toDate();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft < 24;
  });

  const stats = {
    total: machines?.length || 0,
    ocupadas: machines?.filter(m => m.estado === 'ocupada').length || 0,
    libres: machines?.filter(m => m.estado === 'libre').length || 0,
    mantenimiento: machines?.filter(m => m.estado === 'mantenimiento').length || 0,
    pausadas: machines?.filter(m => m.estado === 'pausada').length || 0,
  };

  // Handlers
  const handleComplete = async (machineId: string, orderId: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'machines', machineId), {
        estado: 'libre',
        pedido_actual_id: null,
        tiempo_ocupada_desde: null,
        contador_pedidos_hoy: increment(1),
        updatedAt: serverTimestamp()
      });
      batch.update(doc(db, 'orders', orderId), {
        estado: 'listo',
        fecha_fin_real: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await batch.commit();
      toast({ 
        title: "✅ Pedido Completado", 
        description: "El pedido ha pasado a 'Listo para entrega'." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "No se pudo completar el pedido." 
      });
    }
  };

  const handleMaintenance = async (machineId: string, problema: string) => {
    try {
      await updateDoc(doc(db, 'machines', machineId), {
        estado: 'mantenimiento',
        problema_reportado: problema,
        updatedAt: serverTimestamp()
      });
      setShowMachineDialog(false);
      toast({ 
        title: "🔧 Máquina en Mantenimiento", 
        description: "Se ha reportado el problema correctamente." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "No se pudo actualizar el estado." 
      });
    }
  };

  const handleResume = async (machineId: string) => {
    try {
      await updateDoc(doc(db, 'machines', machineId), {
        estado: 'libre',
        problema_reportado: null,
        updatedAt: serverTimestamp()
      });
      toast({ 
        title: "▶️ Máquina Reactivada", 
        description: "La máquina vuelve a estar disponible." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "No se pudo reactivar la máquina." 
      });
    }
  };

  const optimizeQueue = async () => {
    if (pendingQueue.length === 0) return;
    
    setOptimizing(true);
    const freeMachines = machines?.filter(m => m.estado === 'libre') || [];
    
    if (freeMachines.length === 0) {
      toast({ 
        variant: "default",
        title: "Sin máquinas disponibles", 
        description: "Todas las máquinas están ocupadas o en mantenimiento." 
      });
      setOptimizing(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      const toAssign = pendingQueue.slice(0, freeMachines.length);
      
      toAssign.forEach((order, i) => {
        const machine = freeMachines[i];
        batch.update(doc(db, 'machines', machine.id), { 
          estado: 'ocupada', 
          pedido_actual_id: order.id, 
          tiempo_ocupada_desde: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        batch.update(doc(db, 'orders', order.id), { 
          estado: 'en_proceso', 
          'asignacion.maquina_id': machine.id,
          'asignacion.asignado_por': 'sistema',
          'asignacion.asignado_a_timestamp': serverTimestamp(),
          fecha_inicio_produccion: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      toast({ 
        title: "⚡ Optimización Completa", 
        description: `Se asignaron ${toAssign.length} pedidos a máquinas disponibles.` 
      });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "No se pudo optimizar la cola." 
      });
    } finally {
      setOptimizing(false);
    }
  };

  if (machinesLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Cargando panel de taller...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
            <Monitor className="text-primary h-8 w-8" /> 
            Control de Taller
          </h1>
          <p className="text-muted-foreground">
            {now.toLocaleTimeString()} • {stats.ocupadas}/{stats.total} máquinas activas
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={optimizeQueue} 
            disabled={optimizing || pendingQueue.length === 0}
            className="bg-accent hover:bg-accent/90"
          >
            <Wand2 className="mr-2 h-4 w-4" /> 
            {optimizing ? 'Optimizando...' : 'Auto-Asignar'}
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {urgentOrders.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>{urgentOrders.length} pedidos urgentes</strong> con entrega en menos de 24 horas.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatBadge label="Total" value={stats.total} color="bg-white/10" />
        <StatBadge label="Ocupadas" value={stats.ocupadas} color="bg-primary/20 text-primary" />
        <StatBadge label="Libres" value={stats.libres} color="bg-emerald-500/20 text-emerald-500" />
        <StatBadge label="Mantenimiento" value={stats.mantenimiento} color="bg-amber-500/20 text-amber-500" />
        <StatBadge label="Pausadas" value={stats.pausadas} color="bg-slate-500/20 text-slate-400" />
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machines?.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            orders={activeOrders || []} 
            now={now} 
            onComplete={handleComplete}
            onConfigure={(m) => {
              setSelectedMachine(m);
              setShowMachineDialog(true);
            }}
            onResume={handleResume}
          />
        ))}
      </div>

      {/* Production Queue */}
      <Card className="glass-card border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ListOrdered className="text-secondary h-5 w-5" />
              Cola de Producción
              <Badge variant="secondary" className="ml-2">{pendingQueue.length}</Badge>
            </CardTitle>
            {pendingQueue.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Ordenado por prioridad y fecha de entrega
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingQueue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay pedidos en cola de producción</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingQueue.slice(0, 10).map((order, idx) => {
                const alert = getAlertLevel(order.fecha_entrega_prometida?.toDate(), now);
                return (
                  <div 
                    key={order.id} 
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-colors",
                      alert.nivel === 'critico' ? "bg-destructive/10 border border-destructive/20" :
                      alert.nivel === 'rojo' ? "bg-red-500/5 border border-red-500/10" :
                      "bg-white/5 border border-white/5"
                    )}
                  >
                    <span className={cn(
                      "font-black w-8 h-8 flex items-center justify-center rounded-lg",
                      idx < 3 ? "bg-primary/20 text-primary" : "text-muted-foreground"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{order.cliente.nombre}</p>
                      <p className="text-xs opacity-60">
                        #{order.id.slice(-6)} • {order.producto.toUpperCase()} • {order.puntadas_estimadas.toLocaleString()} pts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">
                        {order.fecha_entrega_prometida?.toDate().toLocaleDateString()}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] uppercase",
                          alert.nivel === 'critico' && "border-destructive text-destructive",
                          alert.nivel === 'rojo' && "border-red-500 text-red-500",
                          alert.nivel === 'amarillo' && "border-amber-500 text-amber-500",
                          alert.nivel === 'verde' && "border-emerald-500 text-emerald-500"
                        )}
                      >
                        {alert.mensaje}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {pendingQueue.length > 10 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  +{pendingQueue.length - 10} pedidos más en cola
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Machine Configuration Dialog */}
      <MachineDialog
        machine={selectedMachine}
        orders={activeOrders || []}
        open={showMachineDialog}
        onOpenChange={setShowMachineDialog}
        onMaintenance={handleMaintenance}
        onComplete={handleComplete}
      />
    </div>
  );
}

// Componentes auxiliares

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("px-4 py-3 rounded-xl text-center", color)}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}

interface MachineCardProps {
  machine: Machine;
  orders: Order[];
  now: Date;
  onComplete: (machineId: string, orderId: string) => void;
  onConfigure: (machine: Machine) => void;
  onResume: (machineId: string) => void;
}

function MachineCard({ machine, orders, now, onComplete, onConfigure, onResume }: MachineCardProps) {
  const currentOrder = orders.find(o => o.id === machine.pedido_actual_id);
  const alert = currentOrder ? getAlertLevel(currentOrder.fecha_entrega_prometida?.toDate(), now) : null;

  const getStatusConfig = () => {
    switch (machine.estado) {
      case 'mantenimiento':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/10',
          icon: Wrench,
          iconColor: 'text-amber-500',
          label: 'MANTENIMIENTO'
        };
      case 'pausada':
        return {
          border: 'border-slate-500',
          bg: 'bg-slate-500/10',
          icon: Pause,
          iconColor: 'text-slate-400',
          label: 'PAUSADA'
        };
      case 'libre':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-500/5',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          label: 'LIBRE'
        };
      default:
        if (alert?.nivel === 'critico') {
          return {
            border: 'border-destructive',
            bg: 'bg-destructive/10',
            icon: AlertTriangle,
            iconColor: 'text-destructive animate-pulse',
            label: 'CRÍTICO'
          };
        }
        if (alert?.nivel === 'rojo') {
          return {
            border: 'border-red-500',
            bg: 'bg-red-500/10',
            icon: Clock,
            iconColor: 'text-red-500',
            label: 'URGENTE'
          };
        }
        return {
          border: 'border-primary',
          bg: 'bg-primary/10',
          icon: Activity,
          iconColor: 'text-primary animate-pulse',
          label: 'TRABAJANDO'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card 
      onClick={() => onConfigure(machine)}
      className={cn(
        "glass-card border-2 cursor-pointer transition-all hover:scale-[1.02]",
        config.border,
        config.bg
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-[10px] font-bold">
            {config.label}
          </Badge>
          <Icon size={18} className={config.iconColor} />
        </div>
        <CardTitle className="text-lg font-bold">{machine.nombre}</CardTitle>
        <p className="text-[10px] font-bold opacity-60 uppercase">{machine.operario_nombre}</p>
      </CardHeader>
      <CardContent>
        {machine.estado === 'ocupada' && currentOrder ? (
          <div className="space-y-3">
            <div className="p-3 bg-black/20 rounded-lg">
              <p className="text-xs font-bold truncate">{currentOrder.cliente.nombre}</p>
              <p className="text-[10px] opacity-60">{currentOrder.producto} • #{currentOrder.id.slice(-6)}</p>
            </div>
            <Button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onComplete(machine.id, currentOrder.id); 
              }}
              className="w-full h-9 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Completar
            </Button>
          </div>
        ) : machine.estado === 'mantenimiento' ? (
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-[10px] opacity-80">Problema reportado:</p>
              <p className="text-xs truncate">{machine.problema_reportado || 'Sin especificar'}</p>
            </div>
            <Button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onResume(machine.id); 
              }}
              variant="outline"
              className="w-full h-9 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reactivar
            </Button>
          </div>
        ) : (
          <div className="py-6 text-center opacity-30">
            <p className="text-xs uppercase font-black">Disponible</p>
            <p className="text-[10px] mt-1">{machine.contador_pedidos_hoy} hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MachineDialogProps {
  machine: Machine | null;
  orders: Order[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaintenance: (machineId: string, problema: string) => void;
  onComplete: (machineId: string, orderId: string) => void;
}

function MachineDialog({ machine, orders, open, onOpenChange, onMaintenance, onComplete }: MachineDialogProps) {
  const [problema, setProblema] = useState('');
  const [horasEstimadas, setHorasEstimadas] = useState('');
  
  if (!machine) return null;
  
  const currentOrder = orders.find(o => o.id === machine.pedido_actual_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {machine.nombre}
          </DialogTitle>
          <DialogDescription>
            Operario: {machine.operario_nombre} • Estado: {machine.estado}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pedido actual */}
          {currentOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-bold">Pedido Actual</p>
                <p className="font-bold">{currentOrder.cliente.nombre}</p>
                <p className="text-sm opacity-70">{currentOrder.descripcion}</p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span>{currentOrder.producto}</span>
                  <span>•</span>
                  <span>{currentOrder.puntadas_estimadas.toLocaleString()} puntadas</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Horas Estimadas</Label>
                  <Input 
                    type="number" 
                    placeholder="Ej: 3"
                    value={horasEstimadas}
                    onChange={(e) => setHorasEstimadas(e.target.value)}
                    className="bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pedidos Hoy</Label>
                  <div className="h-10 flex items-center px-3 rounded-md bg-white/5 text-sm">
                    {machine.contador_pedidos_hoy}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-primary"
                onClick={() => {
                  // Guardar horas estimadas
                  onOpenChange(false);
                }}
              >
                Guardar Datos
              </Button>

              <Button 
                variant="outline"
                className="w-full border-emerald-500 text-emerald-500"
                onClick={() => onComplete(machine.id, currentOrder.id)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar como Completado
              </Button>
            </div>
          )}

          {/* Mantenimiento */}
          <div className="pt-4 border-t border-white/10">
            <Label className="text-destructive font-bold flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Reportar Problema
            </Label>
            <Textarea 
              placeholder="Describe la falla técnica..."
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              className="bg-white/5 mt-2 h-24"
            />
            <Button 
              variant="destructive" 
              className="w-full mt-4"
              disabled={!problema.trim()}
              onClick={() => onMaintenance(machine.id, problema)}
            >
              Poner en Mantenimiento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getAlertLevel(deadline: Date | undefined, now: Date): { nivel: AlertLevel; mensaje: string } {
  if (!deadline) return { nivel: 'verde', mensaje: '---' };
  const diffH = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffH < 0) return { nivel: 'critico', mensaje: 'Atrasado' };
  if (diffH < 24) return { nivel: 'rojo', mensaje: 'Urgente' };
  if (diffH < 72) return { nivel: 'amarillo', mensaje: 'Próximo' };
  return { nivel: 'verde', mensaje: 'A tiempo' };
}
