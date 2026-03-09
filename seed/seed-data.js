/**
 * Seed data para Firebase Emulators
 * Ejecutar: node seed-data.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  connectFirestoreEmulator, 
  collection, 
  doc, 
  setDoc,
  writeBatch
} = require('firebase/firestore');

const firebaseConfig = {
  projectId: 'bordados-pando-demo',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

// Datos de ejemplo
const machines = [
  { id: 'machine-1', nombre: 'Máquina 01', estado: 'libre', operario_nombre: 'Carlos López', capacidad_diaria_puntadas: 50000, contador_pedidos_hoy: 3 },
  { id: 'machine-2', nombre: 'Máquina 02', estado: 'ocupada', operario_nombre: 'Ana Martínez', capacidad_diaria_puntadas: 45000, contador_pedidos_hoy: 5, pedido_actual_id: 'order-1', tiempo_ocupada_desde: new Date() },
  { id: 'machine-3', nombre: 'Máquina 03', estado: 'libre', operario_nombre: 'Pedro Rodríguez', capacidad_diaria_puntadas: 55000, contador_pedidos_hoy: 2 },
  { id: 'machine-4', nombre: 'Máquina 04', estado: 'mantenimiento', operario_nombre: 'María González', capacidad_diaria_puntadas: 48000, contador_pedidos_hoy: 0, problema_reportado: 'Problema con el hilo superior' },
  { id: 'machine-5', nombre: 'Máquina 05', estado: 'ocupada', operario_nombre: 'Juan Silva', capacidad_diaria_puntadas: 52000, contador_pedidos_hoy: 4, pedido_actual_id: 'order-2', tiempo_ocupada_desde: new Date() },
  { id: 'machine-6', nombre: 'Máquina 06', estado: 'libre', operario_nombre: 'Lucía Fernández', capacidad_diaria_puntadas: 47000, contador_pedidos_hoy: 1 },
  { id: 'machine-7', nombre: 'Máquina 07', estado: 'libre', operario_nombre: 'Diego Torres', capacidad_diaria_puntadas: 51000, contador_pedidos_hoy: 0 },
];

const orders = [
  {
    id: 'order-1',
    cliente: { nombre: 'Empresa ABC', email: 'contacto@abc.com', telefono: '+598 99 123 456' },
    descripcion: 'Logo corporativo en 50 camisetas',
    producto: 't-shirt',
    posicion_bordado: 'pecho-izq',
    colores_hilo: ['blanco', 'azul'],
    puntadas_estimadas: 8500,
    complejidad: 'media',
    fecha_creacion: new Date(Date.now() - 86400000 * 2),
    fecha_entrega_prometida: new Date(Date.now() + 86400000),
    estado: 'en_proceso',
    prioridad: 5,
    total_monto: 875,
    tipo_retiro: 'local',
    asignacion: { maquina_id: 'machine-2', asignado_por: 'sistema', puede_moverse: true }
  },
  {
    id: 'order-2',
    cliente: { nombre: 'Club Deportivo XYZ', email: 'info@xyz.com', telefono: '+598 99 789 012' },
    descripcion: 'Escudo del club en 100 gorras',
    producto: 'cap',
    posicion_bordado: 'pecho-centro',
    colores_hilo: ['rojo', 'negro'],
    puntadas_estimadas: 12000,
    complejidad: 'alta',
    fecha_creacion: new Date(Date.now() - 86400000),
    fecha_entrega_prometida: new Date(Date.now() + 86400000 * 2),
    estado: 'en_proceso',
    prioridad: 4,
    total_monto: 1440,
    tipo_retiro: 'envio',
    direccion_envio: 'Av. 18 de Julio 1234, Montevideo',
    asignacion: { maquina_id: 'machine-5', asignado_por: 'manual_admin', puede_moverse: false }
  },
  {
    id: 'order-3',
    cliente: { nombre: 'Café del Centro', email: 'hola@cafedelcentro.uy', telefono: '+598 99 345 678' },
    descripcion: 'Delantal con logo bordado',
    producto: 'otro',
    posicion_bordado: 'pecho-centro',
    colores_hilo: ['marron', 'crema'],
    puntadas_estimadas: 6000,
    complejidad: 'baja',
    fecha_creacion: new Date(Date.now() - 86400000 * 3),
    fecha_entrega_prometida: new Date(Date.now() + 43200000), // Menos de 24h
    estado: 'en_cola',
    prioridad: 10,
    total_monto: 320,
    tipo_retiro: 'local',
    asignacion: { maquina_id: null, asignado_por: 'sistema', puede_moverse: true }
  },
  {
    id: 'order-4',
    cliente: { nombre: 'Tech Solutions SA', email: 'admin@techsolutions.com', telefono: '+598 99 567 890' },
    descripcion: 'Uniformes corporativos - 30 unidades',
    producto: 't-shirt',
    posicion_bordado: 'pecho-izq',
    colores_hilo: ['negro', 'naranja'],
    puntadas_estimadas: 9500,
    complejidad: 'media',
    fecha_creacion: new Date(),
    fecha_entrega_prometida: new Date(Date.now() + 86400000 * 5),
    estado: 'pendiente',
    prioridad: 2,
    total_monto: 1350,
    tipo_retiro: 'envio',
    direccion_envio: 'Ruta 8 Km 25, Canelones',
    asignacion: { maquina_id: null, asignado_por: 'sistema', puede_moverse: true }
  },
  {
    id: 'order-5',
    cliente: { nombre: 'Gimnasio Fitness Pro', email: 'info@fitnesspro.uy', telefono: '+598 99 234 567' },
    descripcion: 'Bolsos deportivos con logo - 25 unidades',
    producto: 'bag',
    posicion_bordado: 'espalda',
    colores_hilo: ['gris', 'verde'],
    puntadas_estimadas: 15000,
    complejidad: 'alta',
    fecha_creacion: new Date(Date.now() - 86400000 * 4),
    fecha_entrega_prometida: new Date(Date.now() - 86400000), // Atrasado
    estado: 'en_cola',
    prioridad: 10,
    total_monto: 1875,
    tipo_retiro: 'local',
    asignacion: { maquina_id: null, asignado_por: 'sistema', puede_moverse: true }
  },
  {
    id: 'order-6',
    cliente: { nombre: 'Escuela Primaria 123', email: 'directora@escuela123.edu.uy', telefono: '+598 99 876 543' },
    descripcion: 'Uniformes escolares - 200 unidades',
    producto: 't-shirt',
    posicion_bordado: 'pecho-izq',
    colores_hilo: ['azul', 'blanco'],
    puntadas_estimadas: 5000,
    complejidad: 'baja',
    fecha_creacion: new Date(Date.now() - 86400000 * 10),
    fecha_entrega_prometida: new Date(Date.now() + 86400000 * 7),
    estado: 'entregado',
    prioridad: 1,
    total_monto: 6000,
    tipo_retiro: 'envio',
    direccion_envio: 'Av. Italia 4567, Montevideo',
    asignacion: { maquina_id: null, asignado_por: 'sistema', puede_moverse: true },
    fecha_fin_real: new Date(Date.now() - 86400000 * 2)
  },
];

async function seed() {
  console.log('🌱 Seeding Firebase Emulators...\n');

  // Seed machines
  console.log('🏭 Creating machines...');
  for (const machine of machines) {
    await setDoc(doc(db, 'machines', machine.id), {
      ...machine,
      operario_id: machine.id.replace('machine-', 'user-'),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`  ✓ ${machine.nombre}`);
  }

  // Seed orders
  console.log('\n📦 Creating orders...');
  for (const order of orders) {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      tracking: {
        estado_pendiente: order.fecha_creacion,
        ...(order.estado !== 'pendiente' && { estado_en_cola: new Date() }),
        ...(order.estado === 'en_proceso' && { estado_en_proceso: new Date() }),
        ...(order.estado === 'entregado' && { 
          estado_en_proceso: new Date(),
          estado_listo: order.fecha_fin_real 
        })
      },
      updatedAt: new Date()
    });
    console.log(`  ✓ Order ${order.id} - ${order.cliente.nombre}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Machines: ${machines.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log('\n🚀 You can now start the app with:');
  console.log('   npm run dev:full');
  
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
