import type { Vehicle } from './types';

// This data is now for fallback/demo purposes and will not be the primary source.
// This is not a `VehicleWithId` because the `userId` is not available at build time.
export const vehicles: Vehicle[] = [
  {
    userId: 'DEMO_USER_ID_1',
    slug: 'mazda-3-touring',
    image: {
      src: 'https://picsum.photos/seed/car1/600/400',
      hint: 'sedan car',
    },
    propertyCard: {
      front: {
        numeroLicencia: '123456789',
        fechaExpedicion: '2022-01-15',
        organismoTransito: 'Bogotá D.C.',
        propietario: {
          nombre: 'Alexandra Xark',
          documento: '1098752030',
          direccion: 'Calle 10B # 2-12 Cliff',
          ciudad: 'Bogotá D.C.',
          telefono: '3152257628',
        },
        limitacionesPropiedad: 'Ninguna',
        firmaMatriculador: 'Firma Autorizada',
      },
      back: {
        placa: 'FVK459',
        marca: 'Mazda',
        linea: '3 Touring',
        cilindraje: '1998 cc',
        modelo: '2023',
        claseVehiculo: 'Automóvil',
        color: 'Gris Profundo',
        servicio: 'Particular',
        carroceria: 'Sedán',
        numPuertas: 4,
        numMotor: 'MTR12345',
        numSerie: 'SERIE67890',
        numChasis: 'CHASISABCDE',
        capacidad: '5 pasajeros',
        pesoBruto: '1.8 Ton',
        avaluoComercial: 95000000,
        importacion: {
          declaracion: 'DI12345',
          numero: 'IMP678',
          ciudad: 'Cartagena',
          fecha: '2021-11-20',
        },
      },
    },
    documents: {
      soat: {
        numeroPoliza: 'SOAT-98765',
        aseguradora: 'Aseguradora Global',
        fechaInicioVigencia: '2024-01-01',
        fechaFinVigencia: '2025-01-01',
        isStored: true,
      },
      tecnomecanica: {
        numeroCertificado: 'TECNO-54321',
        cda: 'CDA Diagnosticar',
        fechaExpedicion: '2024-01-10',
        fechaVencimiento: '2025-01-10',
        isStored: true,
      },
      manual: {
        nombre: 'Manual del Propietario Mazda 3',
        isStored: true,
      },
      fichaTecnica: {
        nombre: 'Ficha Técnica Mazda 3 2023',
        isStored: true,
      },
    },
    maintenance: {
      currentMileage: 15500,
      tasks: [
        {
          name: 'Cambio de Aceite',
          lastServiceMileage: 10000,
          nextServiceMileage: 20000,
          lastServiceDate: '2024-02-20',
        },
        {
          name: 'Revisión de Frenos',
          lastServiceMileage: 10000,
          nextServiceMileage: 30000,
        },
        {
          name: 'Rotación de Llantas',
          lastServiceMileage: 12000,
          nextServiceMileage: 22000,
          lastServiceDate: '2024-04-01',
        },
      ],
    },
  },
  {
    userId: 'DEMO_USER_ID_2',
    slug: 'toyota-fortuner-sw4',
    image: {
      src: 'https://picsum.photos/seed/car2/600/400',
      hint: 'suv car',
    },
    propertyCard: {
      front: {
        numeroLicencia: '987654321',
        fechaExpedicion: '2021-08-20',
        organismoTransito: 'Medellín',
        propietario: {
          nombre: 'Alexandra Xark',
          documento: '1098752030',
          direccion: 'Calle 10B # 2-12 Cliff',
          ciudad: 'Medellín',
          telefono: '3152257628',
        },
        limitacionesPropiedad: 'Prenda a favor de Banco Local',
        firmaMatriculador: 'Firma Autorizada',
      },
      back: {
        placa: 'HJG781',
        marca: 'Toyota',
        linea: 'Fortuner SW4',
        cilindraje: '2755 cc',
        modelo: '2022',
        claseVehiculo: 'Camioneta',
        color: 'Blanco Perlado',
        servicio: 'Particular',
        carroceria: 'Wagon',
        numPuertas: 5,
        numMotor: 'MTR67890',
        numSerie: 'SERIE54321',
        numChasis: 'CHASISFGHIJ',
        capacidad: '7 pasajeros',
        pesoBruto: '2.7 Ton',
        avaluoComercial: 180000000,
        importacion: {
          declaracion: 'DI67890',
          numero: 'IMP123',
          ciudad: 'Buenaventura',
          fecha: '2021-06-15',
        },
      },
    },
    documents: {
      soat: {
        numeroPoliza: 'SOAT-12345',
        aseguradora: 'Seguros Confianza',
        fechaInicioVigencia: '2024-08-15',
        fechaFinVigencia: '2025-08-15',
        isStored: true,
      },
      tecnomecanica: {
        numeroCertificado: 'TECNO-67890',
        cda: 'CDA Antioquia',
        fechaExpedicion: '2024-08-25',
        fechaVencimiento: '2025-08-25',
        isStored: false,
      },
      manual: {
        nombre: 'Manual del Usuario Fortuner',
        isStored: true,
      },
      fichaTecnica: {
        nombre: 'Ficha Técnica Toyota Fortuner',
        isStored: false,
      },
    },
    maintenance: {
      currentMileage: 48000,
      tasks: [
        {
          name: 'Cambio de Aceite',
          lastServiceMileage: 45000,
          nextServiceMileage: 55000,
          lastServiceDate: '2024-05-10',
        },
        {
          name: 'Revisión General (50k)',
          lastServiceMileage: 0,
          nextServiceMileage: 50000,
        },
        {
          name: 'Cambio de Llantas',
          lastServiceMileage: 0,
          nextServiceMileage: 60000,
        },
      ],
    },
  },
];
