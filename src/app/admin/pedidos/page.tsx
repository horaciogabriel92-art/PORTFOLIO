"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Clock, 
  User, 
  Package, 
  Globe,
  Truck,
  ArrowRight,
  MapPin,
  Calendar,
  AlertTriangle,
  Receipt,
  Search,
  Phone,
  Mail,
  RotateCcw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function PedidosPage() {
  const db = useFirestore();
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('fecha_creacion', 'desc')), [db]);
  const { data: orders } = useCollection<Order>(ordersQuery);

  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const updateData: any = { 
        estado: newStatus,
        updatedAt: serverTimestamp(),
      };
      
      if (newStatus === 'pendiente') {
        updateData['asignacion.maquina_id'] = null;
        updateData.fecha_inicio_produccion = null;
      }

      await updateDoc(orderRef, updateData);
      toast({ title: "Estado actualizado", description: `El pedido ahora está en: ${newStatus.replace('_', ' ')}` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado." });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: OrderStatus) => {
    const orderId = e.dataTransfer.getData("orderId");
    if (orderId) {
      handleUpdateStatus(orderId, status);
    }
  };

  const getOrdersByStatus = (statuses: OrderStatus[]) => 
    orders?.filter(o => {
      const matchesStatus = statuses.includes(o.estado);
      const matchesSearch = o.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           o.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold mb-2 text-foreground">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">Panel de control de producción • Bordados Pando</p>
        </div>
        
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Pedido
          </Button>
          <Button variant="outline" className="glass rounded-full px-6 border-white/10">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Buscar cliente o número de pedido..." 
          className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="glass border-white/10 bg-black/20 p-1 rounded-full mb-8">
          <TabsTrigger value="kanban" className="rounded-full px-8 data-[state=active]:bg-primary">Tablero Taller</TabsTrigger>
          <TabsTrigger value="web" className="rounded-full px-8 data-[state=active]:bg-accent">Leads Web</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn 
              title="Pendientes" 
              status="pendiente"
              icon={<Clock className="text-primary h-5 w-5" />}
              orders={getOrdersByStatus(['pendiente', 'en_cola'])}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
            <KanbanColumn 
              title="Pedido hecho" 
              status="en_proceso"
              icon={<Package className="text-secondary h-5 w-5" />}
              orders={getOrdersByStatus(['en_proceso', 'listo'])}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
            <KanbanColumn 
              title="En camino" 
              status="entregado"
              icon={<Truck className="text-accent h-5 w-5" />}
              orders={getOrdersByStatus(['entregado'])}
              isLast
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KanbanColumn({ title, status, icon, orders, isLast, onDragOver, onDrop }: { 
  title: string; 
  status: OrderStatus;
  icon: React.ReactNode; 
  orders: Order[];
  isLast?: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: OrderStatus) => void;
}) {
  return (
    <div 
      className="flex flex-col gap-4"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl mb-2">
        {icon}
        <h3 className="font-bold tracking-tight uppercase text-xs">{title}</h3>
        <Badge variant="secondary" className="ml-auto bg-black/40">{orders.length}</Badge>
      </div>
      <div className="space-y-4 min-h-[600px] p-2 rounded-2xl bg-black/10 border border-white/5">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            isLast={isLast} 
            onMove={(id, s) => {
              const db = useFirestore();
              updateDoc(doc(db, 'orders', id), { estado: s, updatedAt: serverTimestamp() });
            }}
            onUndo={async (id) => {
              const db = useFirestore();
              await updateDoc(doc(db, 'orders', id), { estado: 'pendiente', 'asignacion.maquina_id': null });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onMove, onUndo, isLast }: { 
  order: Order; 
  onMove?: (id: string, status: OrderStatus) => void; 
  onUndo?: (id: string) => void;
  isLast?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (order.fecha_entrega_prometida) {
      const deadline = order.fecha_entrega_prometida.toDate();
      setIsOverdue(deadline < new Date() && order.estado !== 'entregado');
    }
  }, [order.fecha_entrega_prometida, order.estado]);

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("orderId", order.id);
  };

  return (
    <>
      <Card 
        draggable
        onDragStart={onDragStart}
        className={cn(
          "glass-card border-none shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-grab active:cursor-grabbing group relative overflow-hidden",
          isOverdue ? "border-l-4 border-l-destructive bg-destructive/5" : ""
        )}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black tracking-widest text-muted-foreground/50">#{order.id.slice(-6)}</span>
            <div className="flex gap-1">
              {isOverdue && <Badge variant="destructive" className="h-5 px-1.5 animate-pulse text-[8px]">ATRASADO</Badge>}
              <Badge className="h-5 text-[8px] bg-primary/20 text-primary">
                {order.asignacion?.asignado_por?.toUpperCase() || 'MANUAL'}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{order.cliente.nombre}</h4>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{order.descripcion}</p>
          </div>

          <div className="flex justify-between items-center text-[10px]">
             <span className="font-bold text-primary">${order.total_monto}</span>
             <span className="opacity-60 flex items-center gap-1"><MapPin size={10} /> {order.tipo_retiro === 'local' ? 'LOCAL' : 'ENVÍO'}</span>
          </div>

          <div className="flex gap-2">
            {onUndo && order.estado === 'en_proceso' && (
              <Button 
                variant="ghost" 
                onClick={(e) => { e.stopPropagation(); onUndo(order.id); }}
                className="flex-1 h-8 bg-white/5 text-[9px] uppercase font-bold rounded-lg"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Revertir
              </Button>
            )}
            {!isLast && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  const next: OrderStatus = order.estado === 'pendiente' ? 'en_proceso' : 'entregado';
                  onMove?.(order.id, next);
                }}
                className="flex-[2] h-8 bg-white/5 hover:bg-primary text-[9px] uppercase font-bold rounded-lg"
              >
                Siguiente <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="glass-card border-none max-w-2xl overflow-hidden p-0">
          <div className="bg-primary/20 p-6">
            <h2 className="text-2xl font-bold font-headline">Pedido #{order.id.slice(-6)}</h2>
            <p className="text-sm opacity-70">Ingresado: {order.fecha_creacion?.toDate().toLocaleString()}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase opacity-60">Cliente</Label>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="font-bold">{order.cliente.nombre}</p>
                  <p className="text-sm text-muted-foreground">{order.cliente.email}</p>
                  <p className="text-sm text-muted-foreground">{order.cliente.telefono}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase opacity-60">Producción</Label>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="font-bold uppercase text-xs">{order.producto} • {order.posicion_bordado}</p>
                  <p className="text-xs text-muted-foreground mt-1">{order.puntadas_estimadas.toLocaleString()} puntadas</p>
                </div>
              </div>
            </div>
            <Separator className="bg-white/5" />
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-[10px] font-black opacity-40">Monto</p>
                <p className="text-lg font-bold">${order.total_monto}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-[10px] font-black opacity-40">Entrega</p>
                <p className="text-lg font-bold">{order.fecha_entrega_prometida?.toDate().toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-[10px] font-black opacity-40">Retiro</p>
                <p className="text-lg font-bold uppercase">{order.tipo_retiro}</p>
              </div>
            </div>
            {order.tipo_retiro === 'envio' && order.direccion_envio && (
              <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                <p className="text-xs font-bold text-accent uppercase mb-1">Dirección Envío</p>
                <p className="text-sm italic">{order.direccion_envio}</p>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 bg-black/40">
            <Button variant="ghost" onClick={() => setShowDetails(false)}>Cerrar</Button>
            <Button className="bg-primary">Imprimir Comprobante</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
