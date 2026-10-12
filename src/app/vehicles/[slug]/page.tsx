'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wrench,
  FileText,
  User,
  Sparkles,
  Loader2,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PropertyCardView } from '@/components/vehicles/property-card-view';
import { DocumentsView } from '@/components/vehicles/documents-view';
import { MaintenanceView } from '@/components/vehicles/maintenance-view';
import { AiToolsView } from '@/components/vehicles/ai-tools-view';
import { useVehicle } from '@/hooks/use-vehicles';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { VehicleStatus, VehicleStatusSchema } from '@/ai/flows/vehicle-schemas';
import { statusConfig } from '@/components/vehicles/vehicle-card';
import { cn } from '@/lib/utils';

export default function VehiclePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const vehicleId = params.slug as string;
  const { vehicle, loading } = useVehicle(vehicleId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDeleteVehicle = async () => {
    if (!firestore || !vehicle) return;

    setIsDeleting(true);
    try {
      const vehicleRef = doc(firestore, 'vehicles', vehicle.id);
      await deleteDoc(vehicleRef);
      toast({
        title: 'Vehículo Eliminado',
        description: `${vehicle.propertyCard.back.marca} ${vehicle.propertyCard.back.linea} ha sido eliminado.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Error deleting vehicle: ", error);
      toast({
        variant: 'destructive',
        title: 'Error al Eliminar',
        description: 'No se pudo eliminar el vehículo. Inténtalo de nuevo.',
      });
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: VehicleStatus) => {
    if (!firestore || !vehicle || vehicle.status === newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const vehicleRef = doc(firestore, 'vehicles', vehicle.id);
      await updateDoc(vehicleRef, { status: newStatus });
      toast({
        title: 'Estado Actualizado',
        description: `El vehículo ahora está '${newStatus}'.`,
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      toast({
        variant: 'destructive',
        title: 'Error al Actualizar',
        description: 'No se pudo cambiar el estado del vehículo.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    notFound();
  }

  const currentStatus = vehicle.status || 'No disponible';
  const { icon: CurrentStatusIcon, color: currentStatusColor, label: currentStatusLabel } = statusConfig[currentStatus];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Vehículos
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Vehículo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <AlertTriangle className="inline-block mr-2 text-destructive" />
                ¿Estás seguro de que quieres eliminar este vehículo?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                el vehículo y todos sus datos asociados de la base de datos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteVehicle} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sí, Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="lg:w-1/3">
          <div className="relative aspect-[3/2] w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={vehicle.image.src}
              alt={vehicle.propertyCard.back.linea}
              data-ai-hint={vehicle.image.hint}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="lg:w-2/3 space-y-4">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
              {vehicle.propertyCard.back.marca} {vehicle.propertyCard.back.linea}
            </h1>
            <p className="text-xl text-muted-foreground mt-1">
              {vehicle.propertyCard.back.modelo}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-mono text-2xl font-semibold tracking-wider bg-card text-foreground border rounded-md px-4 py-2">
              {vehicle.propertyCard.back.placa}
            </span>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-base" disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CurrentStatusIcon className={cn("mr-2 h-4 w-4", currentStatusColor.replace('bg-', 'text-'))} />
                  )}
                  {currentStatusLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {VehicleStatusSchema.options.map((status) => {
                  const { icon: Icon, label } = statusConfig[status];
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={status === currentStatus}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="property-card" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
          <TabsTrigger value="property-card">
            <User className="mr-2 h-4 w-4" />
            Tarjeta Propiedad
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="mr-2 h-4 w-4" />
            Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="ai-tools">
            <Sparkles className="mr-2 h-4 w-4" />
            Herramientas IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property-card" className="mt-6">
          <PropertyCardView propertyCard={vehicle.propertyCard} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsView vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
          {vehicle.maintenance && <MaintenanceView vehicle={vehicle} />}
        </TabsContent>
        <TabsContent value="ai-tools" className="mt-6">
          <AiToolsView vehicle={vehicle} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
