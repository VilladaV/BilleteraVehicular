'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { completeVehicleData } from '@/ai/flows/complete-vehicle-data';
import type { CompleteVehicleDataInput, Vehicle } from '@/ai/flows/vehicle-schemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VehicleReviewForm } from '@/components/vehicles/vehicle-review-form';
import { useFirestore, useStorage } from '@/firebase';

const formSchema = z.object({
  marca: z.string().min(1, 'La marca es requerida'),
  linea: z.string().min(1, 'La línea es requerida'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  placa: z.string().optional(),
  color: z.string().optional(),
  cilindraje: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Helper to convert a file to a data URI for preview
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to clean undefined values from the vehicle data object before saving to Firestore.
const cleanDataForFirestore = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  } else if (data !== null && typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value !== undefined) {
          newData[key] = cleanDataForFirestore(value);
        } else {
          // Firestore does not support 'undefined'. Convert to 'null'.
          newData[key] = null;
        }
      }
    }
    return newData;
  }
  return data;
};


export default function NewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedData, setCompletedData] = useState<Vehicle | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const firestore = useFirestore();
  const storage = useStorage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: '',
      linea: '',
      modelo: '',
      placa: '',
      color: '',
      cilindraje: '',
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const dataUri = await fileToDataUri(file);
        setImagePreview(dataUri);
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
            variant: 'destructive',
            title: 'Error al procesar la imagen',
            description: 'Hubo un problema al cargar la imagen. Inténtalo de nuevo.',
        });
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setCompletedData(null);

    const input: CompleteVehicleDataInput = {
      propertyCard: {
        back: {
          marca: data.marca,
          linea: data.linea,
          modelo: data.modelo,
          placa: data.placa || undefined,
          color: data.color || undefined,
          cilindraje: data.cilindraje || undefined,
        },
        front: {
            propietario: {
                nombre: "Alexandra Xark",
                documento: "1098752030",
                direccion: "Calle 10B # 2-12 Cliff",
                telefono: "3152257628",
                ciudad: "Bogota D.C."
            }
        }
      },
    };

    try {
      const result = await completeVehicleData(input);
      
      if (imagePreview) {
          result.image.src = imagePreview;
      }

      setCompletedData(result);
      toast({
        title: '¡Datos Completados!',
        description: 'La IA ha rellenado la información faltante. Revisa y guarda.',
      });
    } catch (error) {
      console.error('Error completing vehicle data:', error);
      toast({
        variant: 'destructive',
        title: 'Error de IA',
        description:
          'No se pudo completar la información del vehículo. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveVehicle = async (data: Vehicle) => {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error de Conexión', description: 'Firebase no está disponible. Revisa la conexión.' });
      return;
    }

    setIsSaving(true);
    toast({ title: 'Paso 1/4: Iniciando guardado...', description: 'Preparando datos para guardar.' });
    console.log('[DEBUG] Step 1/4: Starting save...');

    try {
      let finalData = { ...data };

      if (imageFile) {
        toast({ title: 'Paso 2/4: Subiendo imagen...', description: 'Tu imagen se está subiendo a Firebase Storage.' });
        const storageRef = ref(storage, `vehicle-images/${Date.now()}-${imageFile.name}`);
        console.log('[DEBUG] Step 2/4: Created storage reference:', storageRef.fullPath);
        
        const uploadResult = await uploadBytes(storageRef, imageFile);
        console.log('[DEBUG] uploadBytes completed successfully.', uploadResult);
        toast({ title: '¡Éxito! Imagen Subida', description: 'La imagen se subió correctamente.' });
        
        toast({ title: 'Paso 3/4: Obteniendo URL...', description: 'La imagen se subió. Obteniendo enlace.' });
        console.log('[DEBUG] Step 3/4: Getting download URL...');
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log('[DEBUG] Got download URL:', downloadURL);
        
        finalData.image.src = downloadURL;
      }

      toast({ title: 'Paso 4/4: Guardando en Base de Datos...', description: 'Guardando la información del vehículo en Firestore.' });
      console.log('[DEBUG] Step 4/4: Saving to Firestore...');
      const cleanedData = cleanDataForFirestore(finalData);
      const docRef = await addDoc(collection(firestore, 'vehicles'), cleanedData);
      console.log('[DEBUG] Saved to Firestore with doc ID:', docRef.id);

      toast({
        title: '¡Vehículo Guardado!',
        description: 'Tu nuevo vehículo ha sido añadido a tu billetera.',
      });
      router.push(`/vehicles/${docRef.id}`);

    } catch (error: any) {
      console.error('[CRITICAL] Error saving vehicle:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: `Ocurrió un error: ${error.message}. Revisa la consola para más detalles.`,
        duration: 9000,
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Vehículos
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        {!completedData && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nuevo Vehículo</CardTitle>
                  <CardDescription>
                    Ingresa los datos principales y sube una foto. La IA completará el resto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormItem>
                    <FormLabel>Foto del Vehículo</FormLabel>
                    <FormControl>
                       <label htmlFor="image-upload" className="block cursor-pointer border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                        {imagePreview ? (
                          <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Vista previa del vehículo" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8" />
                            <span>Haz clic para subir una imagen</span>
                            <span className="text-xs">(Opcional)</span>
                          </div>
                        )}
                        <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Mazda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Línea*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 3 Touring" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo (Año)*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="placa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="cilindraje"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cilindraje</FormLabel>
                            <FormControl>
                              <Input placeholder="Opcional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Completar con IA
              </Button>
            </form>
          </Form>
        )}
        
        {completedData && (
          <div className="mt-8">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>¡Datos Completados por IA!</AlertTitle>
              <AlertDescription>
                Revisa y edita la información si es necesario antes de guardar.
              </AlertDescription>
            </Alert>
            <VehicleReviewForm 
              vehicleData={completedData}
              onSave={handleSaveVehicle}
              isSaving={isSaving}
            />
          </div>
        )}

      </div>
    </div>
  );
}
