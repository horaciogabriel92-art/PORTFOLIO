
export type ProductType = 't-shirt' | 'cap' | 'bag' | 'otro';
export type EmbroideryPosition = 'pecho-centro' | 'pecho-izq' | 'pecho-der' | 'manga-izq' | 'manga-der' | 'espalda';
export type OrderStatus = 'pendiente' | 'en_cola' | 'en_proceso' | 'pausado' | 'listo' | 'entregado' | 'cancelado';
export type MachineStatus = 'libre' | 'ocupada' | 'mantenimiento' | 'pausada';
export type AlertLevel = 'verde' | 'amarillo' | 'rojo' | 'critico';

export interface Customer {
  nombre: string;
  email: string;
  telefono: string;
}

export interface Order {
  id: string;
  cliente: Customer;
  descripcion: string;
  logo_url?: string;
  producto: ProductType;
  posicion_bordado: EmbroideryPosition;
  colores_hilo: string[];
  puntadas_estimadas: number;
  complejidad: 'baja' | 'media' | 'alta';
  
  fecha_creacion: any; // Timestamp
  fecha_entrega_prometida: any; // Timestamp
  fecha_inicio_produccion?: any; // Timestamp
  fecha_fin_real?: any; // Timestamp
  
  estado: OrderStatus;
  prioridad: number;
  total_monto: number;
  tipo_retiro: 'local' | 'envio';
  direccion_envio?: string;
  
  asignacion: {
    maquina_id: string | null;
    asignado_por: 'sistema' | 'manual_admin' | 'manual_operario';
    asignado_a_timestamp?: any;
    puede_moverse: boolean;
    horas_estimadas?: number;
  };
  
  tracking: {
    estado_pendiente: any;
    estado_en_cola?: any;
    estado_en_proceso?: any;
    estado_listo?: any;
  };
}

export interface Machine {
  id: string;
  nombre: string;
  estado: MachineStatus;
  pedido_actual_id: string | null;
  operario_id: string;
  operario_nombre: string;
  capacidad_diaria_puntadas: number;
  tiempo_ocupada_desde?: any;
  contador_pedidos_hoy: number;
  problema_reportado?: string;
}
