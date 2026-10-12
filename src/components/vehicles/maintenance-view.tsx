'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { VehicleWithId, MaintenanceTask } from '@/lib/types';
import { GaugeCircle, CalendarDays, PlusCircle, Loader2, Edit } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface MaintenanceViewProps {
  vehicle: VehicleWithId;
}

const NewTaskSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
});

const AddMileageSchema = z.object({
    mileageToAdd: z.number(), // Permitir números negativos
});

const UpdateTaskSchema = z.object({
  lastServiceMileage: z.number().nullable(),
  lastServiceDate: z.string().nullable(),
});

const formatMileage = (km?: number | null) => {
  if (km === undefined || km === null) return 'N/A';
  return new Intl.NumberFormat('es-CO').format(km);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return 'Fecha inválida';
  }
};


const Odometer = ({ mileage }: { mileage: number }) => {
  // Pad the number to 6 digits with leading zeros
  const paddedMileage = String(mileage).padStart(6, '0');

  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex bg-gray-900/80 p-2 rounded-lg shadow-inner">
        {paddedMileage.split('').map((digit, index) => (
          <div
            key={index}
            className="flex items-center justify-center w-10 h-14 bg-gray-800/90 text-white text-4xl font-mono font-bold rounded-md mx-1 border-t border-b border-gray-900/50 shadow-md"
          >
            {digit}
          </div>
        ))}
      </div>
       <span className="text-2xl font-bold text-muted-foreground">km</span>
    </div>
  );
};


const UpdateTaskDialog = ({ vehicle, task, taskIndex }: { vehicle: VehicleWithId; task: MaintenanceTask; taskIndex: number; }) => {
    const [open, setOpen] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(UpdateTaskSchema),
        defaultValues: {
            lastServiceMileage: vehicle.maintenance.currentMileage,
            lastServiceDate: new Date().toISOString().split('T')[0],
        }
    });

    const onSubmit = async (data: z.infer<typeof UpdateTaskSchema>) => {
        if (!firestore) return;
        const currentTasks = vehicle.maintenance.tasks;
        const nextServiceMileage = task.lastServiceMileage && task.nextServiceMileage 
            ? data.lastServiceMileage! + (task.nextServiceMileage - task.lastServiceMileage) 
            : null;

        const updatedTask = {
            ...task,
            lastServiceMileage: data.lastServiceMileage,
            lastServiceDate: data.lastServiceDate,
            nextServiceMileage: nextServiceMileage,
        };

        const newTasks = [...currentTasks];
        newTasks[taskIndex] = updatedTask;

        try {
            const vehicleRef = doc(firestore, 'vehicles', vehicle.id);
            await updateDoc(vehicleRef, { 'maintenance.tasks': newTasks });
            toast({ title: '¡Tarea actualizada!', description: `Se ha registrado el servicio para '${task.name}'.` });
            setOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la tarea.' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-2" />Actualizar Servicio</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Actualizar Tarea: {task.name}</DialogTitle>
                    <DialogDescription>Registra el último servicio realizado para esta tarea.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="lastServiceMileage" render={({ field }) => (
                            <FormItem><FormLabel>Kilometraje del Servicio</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} /></FormControl>
                            <FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastServiceDate" render={({ field }) => (
                            <FormItem><FormLabel>Fecha del Servicio</FormLabel>
                                <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage /></FormItem>)} />
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export function MaintenanceView({ vehicle }: MaintenanceViewProps) {
  const { maintenance, id: vehicleId } = vehicle;
  const [isMileageDialogOpen, setIsMileageDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const mileageForm = useForm({
    resolver: zodResolver(AddMileageSchema),
    defaultValues: { mileageToAdd: 0 }
  });

  const taskForm = useForm({
    resolver: zodResolver(NewTaskSchema),
    defaultValues: { name: '' }
  });

  const handleMileageUpdate = async (data: z.infer<typeof AddMileageSchema>) => {
    if (!firestore) return;

    const newMileage = (maintenance.currentMileage || 0) + data.mileageToAdd;

    if (newMileage < 0) {
      mileageForm.setError('mileageToAdd', { type: 'manual', message: 'El kilometraje total no puede ser negativo.' });
      return;
    }
    
    try {
        const vehicleRef = doc(firestore, 'vehicles', vehicleId);
        await updateDoc(vehicleRef, { 'maintenance.currentMileage': newMileage });
        toast({ title: '¡Éxito!', description: 'Kilometraje actualizado correctamente.' });
        setIsMileageDialogOpen(false);
        mileageForm.reset({ mileageToAdd: 0 });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el kilometraje.' });
    }
  };

  const handleAddTask = async (data: z.infer<typeof NewTaskSchema>) => {
    if (!firestore) return;
    const newTask: MaintenanceTask = {
        name: data.name,
        lastServiceDate: null,
        lastServiceMileage: null,
        nextServiceDate: null,
        nextServiceMileage: null,
    };
    try {
        const vehicleRef = doc(firestore, 'vehicles', vehicleId);
        await updateDoc(vehicleRef, { 'maintenance.tasks': arrayUnion(newTask) });
        toast({ title: '¡Éxito!', description: `Tarea '${data.name}' añadida.` });
        setIsTaskDialogOpen(false);
        taskForm.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo añadir la tarea.' });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Seguimiento de Mantenimiento</CardTitle>
          <CardDescription>Kilometraje actual y próximos servicios recomendados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center bg-accent/20 p-6 rounded-lg relative space-y-4">
             <div>
                <p className="text-sm text-muted-foreground mb-2">Kilometraje Actual</p>
                <Odometer mileage={maintenance.currentMileage} />
             </div>
             <Dialog open={isMileageDialogOpen} onOpenChange={setIsMileageDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Actualizar Kilometraje</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir o Restar Kilometraje</DialogTitle>
                        <DialogDescription>Introduce los kilómetros a añadir (usa un número negativo para restar).</DialogDescription>
                    </DialogHeader>
                    <Form {...mileageForm}>
                        <form onSubmit={mileageForm.handleSubmit(handleMileageUpdate)} className="space-y-4 py-4">
                            <FormField control={mileageForm.control} name="mileageToAdd" render={({ field }) => (
                                <FormItem><FormLabel>Kilómetros a Añadir/Restar</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                                <FormMessage/></FormItem>
                            )}/>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsMileageDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={mileageForm.formState.isSubmitting}>
                                    {mileageForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Actualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">Próximos Mantenimientos</h4>
            <div className="space-y-6">
              {maintenance.tasks.map((task, index) => {
                const hasMileageTracking =
                  task.lastServiceMileage != null && task.nextServiceMileage != null && task.nextServiceMileage > task.lastServiceMileage;

                let progressPercentage = 0;
                if (hasMileageTracking) {
                  const totalRange = task.nextServiceMileage! - task.lastServiceMileage!;
                  const currentProgress = maintenance.currentMileage - task.lastServiceMileage!;
                  progressPercentage = Math.min(Math.max((currentProgress / totalRange) * 100, 0), 100);
                }

                return (
                  <div key={task.name} className="bg-card p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="font-medium text-foreground">{task.name}</p>
                             {task.lastServiceDate && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    <span>Último: {formatDate(task.lastServiceDate)}</span>
                                </div>
                            )}
                        </div>
                        <UpdateTaskDialog vehicle={vehicle} task={task} taskIndex={index} />
                    </div>

                    {hasMileageTracking ? (
                      <>
                        <div className="flex justify-between items-end mb-1 text-xs text-muted-foreground">
                          <span>{formatMileage(task.lastServiceMileage!)} km</span>
                          <span>{formatMileage(task.nextServiceMileage!)} km</span>
                        </div>
                        <Progress value={progressPercentage} />
                        <p className="text-xs text-right mt-1 text-muted-foreground">
                          Progreso: {Math.round(progressPercentage)}%
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No hay seguimiento de kilometraje para esta tarea. Registra un servicio para comenzar.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Tarea de Mantenimiento
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Tarea</DialogTitle>
                        <DialogDescription>Crea una nueva tarea de mantenimiento para tu vehículo.</DialogDescription>
                    </DialogHeader>
                     <Form {...taskForm}>
                        <form onSubmit={taskForm.handleSubmit(handleAddTask)} className="space-y-4 py-4">
                            <FormField control={taskForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nombre de la Tarea</FormLabel>
                                <FormControl><Input placeholder="Ej: Cambio de llantas" {...field} /></FormControl>
                                <FormMessage/></FormItem>
                            )}/>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsTaskDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={taskForm.formState.isSubmitting}>
                                    {taskForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Añadir
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </>
  );
}
