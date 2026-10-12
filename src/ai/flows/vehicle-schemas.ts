import { z } from 'zod';

// Define the possible vehicle statuses
export const VehicleStatusSchema = z.enum([
  'Disponible', 
  'En reparación', 
  'Dañado', 
  'Decomisado', 
  'Vendido', 
  'No disponible'
]);

export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;

// Using a simplified version of the main types for the AI input.
// Making most fields optional for the input.
const PropietarioInputSchema = z.object({
  nombre: z.string().optional(),
  documento: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  telefono: z.string().optional(),
});

const ImportacionInputSchema = z.object({
  declaracion: z.string().optional(),
  numero: z.string().optional(),
  ciudad: z.string().optional(),
  fecha: z.string().optional(),
});

const PropertyCardInputSchema = z.object({
  front: z.object({
    numeroLicencia: z.string().optional(),
    fechaExpedicion: z.string().optional(),
    organismoTransito: z.string().optional(),
    propietario: PropietarioInputSchema.optional(),
    limitacionesPropiedad: z.string().optional(),
    firmaMatriculador: z.string().optional(),
  }),
  back: z.object({
    placa: z.string().optional(),
    marca: z.string(),
    linea: z.string(),
    cilindraje: z.string().optional(),
    modelo: z.string(),
    claseVehiculo: z.string().optional(),
    color: z.string().optional(),
    servicio: z.string().optional(),
    carroceria: z.string().optional(),
    numPuertas: z.number().optional(),
    numMotor: z.string().optional(),
    numSerie: z.string().optional(),
    numChasis: z.string().optional(),
    capacidad: z.string().optional(),
    pesoBruto: z.string().optional(),
    avaluoComercial: z.number().optional(),
    importacion: ImportacionInputSchema.optional(),
  }),
});

export const CompleteVehicleDataInputSchema = z.object({
  propertyCard: PropertyCardInputSchema,
});

export type CompleteVehicleDataInput = z.infer<typeof CompleteVehicleDataInputSchema>;


// Using the full Vehicle schema from the app's types for the output.
const PropietarioSchema = z.object({
  nombre: z.string(),
  documento: z.string(),
  direccion: z.string(),
  ciudad: z.string(),
  telefono: z.string(),
});

const ImportacionSchema = z.object({
  declaracion: z.string(),
  numero: z.string(),
  ciudad: z.string(),
  fecha: z.string(),
});

const PropertyCardSchema = z.object({
  front: z.object({
    numeroLicencia: z.string(),
    fechaExpedicion: z.string(),
    organismoTransito: z.string(),
    propietario: PropietarioSchema,
    limitacionesPropiedad: z.string(),
    firmaMatriculador: z.string(),
  }),
  back: z.object({
    placa: z.string(),
    marca: z.string(),
    linea: z.string(),
    cilindraje: z.string(),
    modelo: z.string(),
    claseVehiculo: z.string(),
    color: z.string(),
    servicio: z.string(),
    carroceria: z.string(),
    numPuertas: z.number(),
    numMotor: z.string(),
    numSerie: z.string(),
    numChasis: z.string(),
    capacidad: z.string(),
    pesoBruto: z.string(),
    avaluoComercial: z.number(),
    importacion: ImportacionSchema,
  }),
});

const VehicleDocumentSchema = z.object({
  nombre: z.string(),
  url: z.string().nullable().optional(),
  isStored: z.boolean(),
});

const SoatSchema = z.object({
  numeroPoliza: z.string().optional(),
  aseguradora: z.string().optional(),
  fechaInicioVigencia: z.string().optional(),
  fechaFinVigencia: z.string().optional(),
  isStored: z.boolean(),
});

const TecnomecanicaSchema = z.object({
  numeroCertificado: z.string().optional(),
  cda: z.string().optional(),
  fechaExpedicion: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  isStored: z.boolean(),
});

const MaintenanceTaskSchema = z.object({
  name: z.string(),
  lastServiceMileage: z.number().nullable().optional(),
  nextServiceMileage: z.number().nullable().optional(),
  lastServiceDate: z.string().nullable().optional(),
  nextServiceDate: z.string().nullable().optional(),
});

export const VehicleSchema = z.object({
  slug: z.string(),
  status: VehicleStatusSchema.optional(), // Make status optional
  image: z.object({
    src: z.string(),
    hint: z.string(),
  }),
  propertyCard: PropertyCardSchema,
  documents: z.object({
    soat: SoatSchema,
    tecnomecanica: TecnomecanicaSchema,
    manual: VehicleDocumentSchema,
    fichaTecnica: VehicleDocumentSchema,
  }),
  maintenance: z.object({
    currentMileage: z.number(),
    tasks: z.array(MaintenanceTaskSchema),
  }),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type MaintenanceTask = z.infer<typeof MaintenanceTaskSchema>;
