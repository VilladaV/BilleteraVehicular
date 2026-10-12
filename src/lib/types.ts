import { z } from 'zod';
import { VehicleSchema, VehicleStatusSchema } from '@/ai/flows/vehicle-schemas';

// The base Vehicle type is now derived from the Zod schema to ensure consistency.
export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;


// We add an optional 'id' for Firestore document identification.
export interface VehicleWithId extends Vehicle {
  id: string;
}


// These types remain as they were, as they are components of the main Vehicle schema.
export interface PropertyCard {
  front: {
    numeroLicencia: string;
    fechaExpedicion: string;
    organismoTransito: string;
    propietario: Propietario;
    limitacionesPropiedad: string;
    firmaMatriculador: string;
  };
  back: {
    placa: string;
    marca: string;
    linea: string;
    cilindraje: string;
    modelo: string;
    claseVehiculo: string;
    color: string;
    servicio: string;
    carroceria: string;
    numPuertas: number;
    numMotor: string;
    numSerie: string;
    numChasis: string;
    capacidad: string;
    pesoBruto: string;
    avaluoComercial: number;
    importacion: Importacion;
  };
}

export interface Propietario {
  nombre: string;
  documento: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

export interface Importacion {
  declaracion: string;
  numero: string;
  ciudad: string;
  fecha: string;
}

export interface Soat {
  numeroPoliza?: string;
  aseguradora?: string;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
  isStored: boolean;
}

export interface Tecnomecanica {
  numeroCertificado?: string;
  cda?: string;
  fechaExpedicion?: string;
  fechaVencimiento?: string;
  isStored: boolean;
}

export interface VehicleDocument {
  nombre: string;
  url?: string | null;
  isStored: boolean;
}

export interface MaintenanceTask {
  name: string;
  lastServiceMileage?: number | null;
  nextServiceMileage?: number | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
}
