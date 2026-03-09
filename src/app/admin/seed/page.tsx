
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2, Database, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SeedPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const seedData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      // 1. CARGAR 7 MÁQUINAS INDUSTRIALES (Todas ocupadas inicialmente para el demo)
      const machines = [
        { id: 'M1', nombre: 'Bordadora Tajima M1', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-001', operario_id: 'OP-01', operario_nombre: 'Juan Pérez', capacidad_diaria_puntadas: 60000, contador_pedidos_hoy: 2, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M2', nombre: 'Bordadora Tajima M2', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-002', operario_id: 'OP-02', operario_nombre: 'María García', capacidad_diaria_puntadas: 60000, contador_pedidos_hoy: 1, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M3', nombre: 'Bordadora Barudan M3', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-003', operario_id: 'OP-03', operario_nombre: 'Carlos Ruiz', capacidad_diaria_puntadas: 55000, contador_pedidos_hoy: 0, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M4', nombre: 'Bordadora Brother M4', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-004', operario_id: 'OP-04', operario_nombre: 'Ana López', capacidad_diaria_puntadas: 45000, contador_pedidos_hoy: 4, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M5', nombre: 'Bordadora Brother M5', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-005', operario_id: 'OP-05', operario_nombre: 'Pedro Soler', capacidad_diaria_puntadas: 45000, contador_pedidos_hoy: 3, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M6', nombre: 'Bordadora Ricoma M6', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-006', operario_id: 'OP-06', operario_nombre: 'Lucía Fernández', capacidad_diaria_puntadas: 70000, contador_pedidos_hoy: 0, tiempo_ocupada_desde: serverTimestamp() },
        { id: 'M7', nombre: 'Bordadora Ricoma M7', estado: 'ocupada', pedido_actual_id: 'PED-PANDO-007', operario_id: 'OP-07', operario_nombre: 'Diego Torres', capacidad_diaria_puntadas: 70000, contador_pedidos_hoy: 0, tiempo_ocupada_desde: serverTimestamp() },
      ];

      for (const m of machines) {
        await setDoc(doc(db, 'machines', m.id), { ...m, updatedAt: serverTimestamp() });
      }

      // 2. CARGAR PEDIDOS (En proceso y en cola para jerarquía)
      const orders = [
        {
          id: 'PED-PANDO-001',
          cliente: { nombre: 'Club Atlético Peñarol', telefono: '+598 99 111 222', email: 'deportes@cap.uy' },
          descripcion: 'Bordado escudo oficial en 200 camisetas entrenamiento.',
          producto: 't-shirt',
          posicion_bordado: 'pecho-izq',
          puntadas_estimadas: 15000,
          complejidad: 'alta',
          fecha_creacion: serverTimestamp(),
          fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() - (2 * 60 * 60 * 1000))), // ATRASADO
          estado: 'en_proceso',
          prioridad: 10,
          total_monto: 3500,
          tipo_retiro: 'envio',
          direccion_envio: 'Palacio Gastón Guelfi, Montevideo',
          asignacion: { maquina_id: 'M1', asignado_por: 'manual_admin', asignado_a_timestamp: serverTimestamp(), puede_moverse: true }
        },
        {
          id: 'PED-PANDO-002',
          cliente: { nombre: 'Gimnasio Vital', telefono: '+598 94 444 555', email: 'vital@gmail.com' },
          descripcion: '50 Gorras con logo bordado 3D frontal.',
          producto: 'cap',
          posicion_bordado: 'pecho-centro',
          puntadas_estimadas: 8500,
          complejidad: 'media',
          fecha_creacion: serverTimestamp(),
          fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (4 * 60 * 60 * 1000))), // URGENTE
          estado: 'en_proceso',
          prioridad: 9,
          total_monto: 850,
          tipo_retiro: 'local',
          asignacion: { maquina_id: 'M2', asignado_por: 'sistema', asignado_a_timestamp: serverTimestamp(), puede_moverse: true }
        },
        {
          id: 'PED-PANDO-003',
          cliente: { nombre: 'Restaurante El Faro', telefono: '+598 92 888 777', email: 'compras@elfaro.com.uy' },
          descripcion: 'Logo en pecheras de cocina - 30 unidades.',
          producto: 'otro',
          posicion_bordado: 'pecho-der',
          puntadas_estimadas: 6000,
          complejidad: 'baja',
          fecha_creacion: serverTimestamp(),
          fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (24 * 60 * 60 * 1000))), // ROJO
          estado: 'en_proceso',
          prioridad: 7,
          total_monto: 450,
          tipo_retiro: 'local',
          asignacion: { maquina_id: 'M3', asignado_por: 'sistema', puede_moverse: true }
        },
        // MÁS PEDIDOS PARA LA COLA
        {
          id: 'PED-PANDO-004',
          cliente: { nombre: 'Agencia TechLine', telefono: '+598 99 999 000', email: 'rrhh@techline.com' },
          descripcion: 'Mochilas corporativas - Logo en bolsillo frontal.',
          producto: 'bag',
          posicion_bordado: 'pecho-centro',
          puntadas_estimadas: 12000,
          complejidad: 'alta',
          fecha_creacion: serverTimestamp(),
          fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (48 * 60 * 60 * 1000))), // AMARILLO
          estado: 'en_proceso',
          prioridad: 6,
          total_monto: 1200,
          tipo_retiro: 'envio',
          direccion_envio: 'WTC Torre 4, Montevideo',
          asignacion: { maquina_id: 'M4', asignado_por: 'manual_admin', puede_moverse: true }
        },
        {
            id: 'PED-PANDO-005',
            cliente: { nombre: 'Colegio British', telefono: '+598 91 123 456', email: 'admin@british.edu.uy' },
            descripcion: '60 Chombas escolares con logo bordado pecho.',
            producto: 't-shirt',
            posicion_bordado: 'pecho-izq',
            puntadas_estimadas: 5000,
            complejidad: 'baja',
            fecha_creacion: serverTimestamp(),
            fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (72 * 60 * 60 * 1000))), // VERDE
            estado: 'en_proceso',
            prioridad: 5,
            total_monto: 1800,
            tipo_retiro: 'envio',
            direccion_envio: 'Carrasco, Montevideo',
            asignacion: { maquina_id: 'M5', asignado_por: 'manual_admin', puede_moverse: true }
        },
        {
            id: 'PED-PANDO-006',
            cliente: { nombre: 'Hotel Enjoy', telefono: '+598 42 123 456', email: 'uniformes@enjoy.com.uy' },
            descripcion: '100 Batas de baño bordado logo espalda.',
            producto: 'otro',
            posicion_bordado: 'espalda',
            puntadas_estimadas: 25000,
            complejidad: 'alta',
            fecha_creacion: serverTimestamp(),
            fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (96 * 60 * 60 * 1000))), // VERDE
            estado: 'en_proceso',
            prioridad: 4,
            total_monto: 5000,
            tipo_retiro: 'envio',
            direccion_envio: 'Parada 4 Playa Mansa, Punta del Este',
            asignacion: { maquina_id: 'M6', asignado_por: 'manual_admin', puede_moverse: true }
        },
        {
            id: 'PED-PANDO-007',
            cliente: { nombre: 'Panadería Los Nietos', telefono: '+598 97 777 888', email: 'losnietos@gmail.com' },
            descripcion: '20 Delantales negros con logo blanco.',
            producto: 'otro',
            posicion_bordado: 'pecho-centro',
            puntadas_estimadas: 4000,
            complejidad: 'baja',
            fecha_creacion: serverTimestamp(),
            fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (120 * 60 * 60 * 1000))), // VERDE
            estado: 'en_proceso',
            prioridad: 3,
            total_monto: 350,
            tipo_retiro: 'local',
            asignacion: { maquina_id: 'M7', asignado_por: 'sistema', puede_moverse: true }
        },
        // PEDIDOS EN COLA (JERARQUÍA)
        {
            id: 'PED-PANDO-008',
            cliente: { nombre: 'Empresa Constructora S.A.', telefono: '+598 95 000 111', email: 'seguridad@constru.uy' },
            descripcion: 'Cascos de tela y gorras alta visibilidad.',
            producto: 'cap',
            posicion_bordado: 'pecho-der',
            puntadas_estimadas: 7500,
            complejidad: 'media',
            fecha_creacion: serverTimestamp(),
            fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (24 * 60 * 60 * 1000))), // COLA PRIORITARIA
            estado: 'en_cola',
            prioridad: 8,
            total_monto: 1500,
            tipo_retiro: 'envio',
            direccion_envio: 'Av. Italia 2450, Montevideo',
            asignacion: { maquina_id: null, asignado_por: 'manual_admin', puede_moverse: true }
        },
        {
            id: 'PED-PANDO-009',
            cliente: { nombre: 'Gamer Shop', telefono: '+598 93 333 444', email: 'ventas@gamershop.uy' },
            descripcion: 'Gorras personalizadas para evento gaming.',
            producto: 'cap',
            posicion_bordado: 'pecho-centro',
            puntadas_estimadas: 9000,
            complejidad: 'media',
            fecha_creacion: serverTimestamp(),
            fecha_entrega_prometida: Timestamp.fromDate(new Date(now.getTime() + (168 * 60 * 60 * 1000))), // 1 SEMANA
            estado: 'en_cola',
            prioridad: 2,
            total_monto: 900,
            tipo_retiro: 'local',
            asignacion: { maquina_id: null, asignado_por: 'sistema', puede_moverse: true }
        }
      ];

      for (const o of orders) {
        await setDoc(doc(db, 'orders', o.id), { ...o, updatedAt: serverTimestamp() });
      }

      toast({ title: "¡Sistema Poblado!", description: "7 máquinas ocupadas y 9 pedidos jerarquizados cargados." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos." });
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    setCleaning(true);
    try {
      const qOrders = await getDocs(collection(db, 'orders'));
      const qMachines = await getDocs(collection(db, 'machines'));
      
      const deletions = [
        ...qOrders.docs.map(d => deleteDoc(d.ref)),
        ...qMachines.docs.map(d => deleteDoc(d.ref))
      ];
      
      await Promise.all(deletions);
      toast({ title: "Base de Datos Limpia", description: "Se eliminaron todos los registros." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al limpiar" });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
          <Database size={48} />
        </div>
        <h1 className="font-headline text-4xl font-bold">Poblar Sistema Pro</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Carga las 7 máquinas industriales con pedidos activos y una cola de producción jerarquizada para pruebas de taller.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none hover:shadow-2xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-accent" /> Cargar Taller Completo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Llena las 7 máquinas y crea 9 pedidos con diferentes niveles de urgencia (Critical, Rojo, Amarillo, Verde).
            </p>
            <Button onClick={seedData} disabled={loading} className="w-full bg-primary h-12">
              {loading ? <Loader2 className="mr-2 animate-spin" /> : <Database className="mr-2" />}
              {loading ? "Cargando..." : "Llenar Taller"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-none hover:shadow-2xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="text-destructive" /> Limpiar Todo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Borra todos los pedidos y máquinas actuales para reiniciar las pruebas desde cero.
            </p>
            <Button variant="outline" onClick={clearData} disabled={cleaning} className="w-full border-destructive/20 text-destructive h-12">
              {cleaning ? <Loader2 className="mr-2 animate-spin" /> : <Trash2 className="mr-2" />}
              {cleaning ? "Limpiando..." : "Borrar Todo"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
