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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VehicleWithId, Soat, Tecnomecanica } from '@/lib/types';
import {
  CheckCircle2,
  FileText,
  Shield,
  Wrench,
  XCircle,
  AlertTriangle,
  BookOpen,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays, isValid, parseISO } from 'date-fns';
import { InteractiveDocumentView } from './interactive-document-view';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface DocumentsViewProps {
  vehicle: VehicleWithId;
}

const SoatSchema = z.object({
  numeroPoliza: z.string().min(1, 'Requerido'),
  aseguradora: z.string().min(1, 'Requerido'),
  fechaInicioVigencia: z.string().min(1, 'Requerido'),
  fechaFinVigencia: z.string().min(1, 'Requerido'),
});

const TecnomecanicaSchema = z.object({
  numeroCertificado: z.string().min(1, 'Requerido'),
  cda: z.string().min(1, 'Requerido'),
  fechaExpedicion: z.string().min(1, 'Requerido'),
  fechaVencimiento: z.string().min(1, 'Requerido'),
});


const getStatus = (endDate?: string) => {
  if (!endDate || !isValid(parseISO(endDate))) {
    return {
      text: 'No registrado',
      color: 'text-muted-foreground',
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
    };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = parseISO(endDate);

    const daysRemaining = differenceInDays(end, today);

    if (daysRemaining < 0) {
      return {
        text: `Vencido hace ${Math.abs(daysRemaining)} días`,
        color: 'text-destructive',
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      };
    }
    if (daysRemaining <= 30) {
      return {
        text: `Vence en ${daysRemaining} días`,
        color: 'text-yellow-500',
        icon: <CheckCircle2 className="h-5 w-5 text-yellow-500" />,
      };
    }
    return {
      text: `Vigente (vence en ${daysRemaining} días)`,
      color: 'text-green-500',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    };
  } catch (e) {
    return {
      text: 'Fecha inválida',
      color: 'text-destructive',
      icon: <XCircle className="h-5 w-5 text-destructive" />,
    };
  }
};

const formatDate = (dateString?: string | null) => {
  if (!dateString || !isValid(parseISO(dateString))) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return 'Fecha inválida';
  }
};

const AddDocumentUrlDialog = ({
  vehicleId,
  docType,
  onOpenChange,
  open,
}: {
  vehicleId: string;
  docType: 'manual' | 'fichaTecnica';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!url) {
      toast({ variant: 'destructive', title: 'URL Vacía', description: 'Por favor, ingresa una URL.' });
      return;
    }
    if (!firestore) return;
    setIsSaving(true);
    try {
      const vehicleRef = doc(firestore, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        [`documents.${docType}.url`]: url,
      });
      toast({ title: '¡Éxito!', description: 'La URL del documento ha sido guardada.' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving document URL: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la URL.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir URL del {docType === 'manual' ? 'Manual' : 'Ficha Técnica'}</DialogTitle>
          <DialogDescription>
            Pega la URL pública de tu archivo PDF. Puedes subirlo a Firebase Storage y usar esa URL.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="doc-url">URL del PDF</Label>
          <Input id="doc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground mt-2">
            URL de ejemplo: https://firebasestorage.googleapis.com/v0/b/studio-4029964056-2280c.appspot.com/o/sample-manual.pdf?alt=media&token=355209a3-7647-4613-9fb4-2e20b0821a41
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocumentItem = ({
  vehicleId,
  document,
  title,
  description,
  docType,
}: {
  vehicleId: string;
  document: VehicleWithId['documents']['manual'];
  title: string;
  description: string;
  docType: 'manual' | 'fichaTecnica';
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FileText className="h-5 w-5 text-primary" /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {document?.url ? (
            <InteractiveDocumentView documentUrl={document.url} documentName={document.nombre}>
              <div className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:underline">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>Abrir Manual Interactivo</span>
              </div>
            </InteractiveDocumentView>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Documento
            </Button>
          )}
        </CardContent>
      </Card>
      <AddDocumentUrlDialog vehicleId={vehicleId} docType={docType} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};

const EditDocumentDialog = ({
  vehicleId,
  docType,
  currentData,
  children,
}: {
  vehicleId: string;
  docType: 'soat' | 'tecnomecanica';
  currentData?: Soat | Tecnomecanica;
  children: React.ReactNode;
}) => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const isSoat = docType === 'soat';
    const schema = isSoat ? SoatSchema : TecnomecanicaSchema;
    const defaultValues = currentData || (isSoat ? { numeroPoliza: '', aseguradora: '', fechaInicioVigencia: '', fechaFinVigencia: '' } : { numeroCertificado: '', cda: '', fechaExpedicion: '', fechaVencimiento: '' });

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const onSubmit = async (data: any) => {
        if (!firestore) return;
        try {
            const vehicleRef = doc(firestore, 'vehicles', vehicleId);
            await updateDoc(vehicleRef, {
                [`documents.${docType}`]: { ...data, isStored: true },
            });
            toast({ title: '¡Éxito!', description: `El documento ${isSoat ? 'SOAT' : 'Tecnomecánica'} ha sido guardado.` });
            setOpen(false);
        } catch (error) {
            console.error(`Error saving ${docType}: `, error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la información.' });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir / Editar {isSoat ? 'SOAT' : 'Tecnomecánica'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {isSoat ? (
                            <>
                                <FormField control={form.control} name="numeroPoliza" render={({ field }) => (<FormItem><FormLabel>No. Póliza</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="aseguradora" render={({ field }) => (<FormItem><FormLabel>Aseguradora</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fechaInicioVigencia" render={({ field }) => (<FormItem><FormLabel>Fecha Inicio Vigencia</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fechaFinVigencia" render={({ field }) => (<FormItem><FormLabel>Fecha Fin Vigencia</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </>
                        ) : (
                            <>
                                <FormField control={form.control} name="numeroCertificado" render={({ field }) => (<FormItem><FormLabel>No. Certificado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="cda" render={({ field }) => (<FormItem><FormLabel>CDA</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fechaExpedicion" render={({ field }) => (<FormItem><FormLabel>Fecha Expedición</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fechaVencimiento" render={({ field }) => (<FormItem><FormLabel>Fecha Vencimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </>
                        )}
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

export function DocumentsView({ vehicle }: DocumentsViewProps) {
  const { documents, id: vehicleId } = vehicle;
  const soatStatus = getStatus(documents.soat?.fechaFinVigencia);
  const tecnoStatus = getStatus(documents.tecnomecanica?.fechaVencimiento);

  const hasSoat = documents.soat && documents.soat.isStored;
  const hasTecno = documents.tecnomecanica && documents.tecnomecanica.isStored;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Shield className="h-5 w-5 text-primary" /> SOAT
          </CardTitle>
          <CardDescription>Seguro Obligatorio de Accidentes de Tránsito</CardDescription>
        </CardHeader>
        {hasSoat ? (
          <CardContent className="space-y-2 flex-grow">
            <p><span className="font-semibold">Aseguradora:</span> {documents.soat.aseguradora || 'N/A'}</p>
            <p><span className="font-semibold">No. Póliza:</span> {documents.soat.numeroPoliza || 'N/A'}</p>
            <p><span className="font-semibold">Vencimiento:</span> {formatDate(documents.soat.fechaFinVigencia)}</p>
            <div className="flex items-center gap-2 pt-2">
              {soatStatus.icon}
              <span className={soatStatus.color}>{soatStatus.text}</span>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos del SOAT.</p>
          </CardContent>
        )}
        <CardFooter>
            <EditDocumentDialog vehicleId={vehicleId} docType="soat" currentData={documents.soat}>
                <Button variant="secondary" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {hasSoat ? 'Actualizar SOAT' : 'Añadir SOAT'}
                </Button>
            </EditDocumentDialog>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Wrench className="h-5 w-5 text-primary" /> Tecnomecánica
          </CardTitle>
          <CardDescription>Revisión Técnico Mecánica y de Emisiones Contaminantes</CardDescription>
        </CardHeader>
        {hasTecno ? (
          <CardContent className="space-y-2 flex-grow">
            <p><span className="font-semibold">CDA:</span> {documents.tecnomecanica.cda || 'N/A'}</p>
            <p><span className="font-semibold">No. Certificado:</span> {documents.tecnomecanica.numeroCertificado || 'N/A'}</p>
            <p><span className="font-semibold">Vencimiento:</span> {formatDate(documents.tecnomecanica.fechaVencimiento)}</p>
            <div className="flex items-center gap-2 pt-2">
              {tecnoStatus.icon}
              <span className={tecnoStatus.color}>{tecnoStatus.text}</span>
            </div>
          </CardContent>
        ) : (
            <CardContent className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos de la Tecnomecánica.</p>
            </CardContent>
        )}
        <CardFooter>
            <EditDocumentDialog vehicleId={vehicleId} docType="tecnomecanica" currentData={documents.tecnomecanica}>
                 <Button variant="secondary" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {hasTecno ? 'Actualizar Tecnomecánica' : 'Añadir Tecnomecánica'}
                </Button>
            </EditDocumentDialog>
        </CardFooter>
      </Card>

      <DocumentItem
        vehicleId={vehicleId}
        document={documents.manual}
        title="Manual del Vehículo"
        description="Manual oficial del propietario."
        docType="manual"
      />

      <DocumentItem
        vehicleId={vehicleId}
        document={documents.fichaTecnica}
        title="Ficha Técnica"
        description="Especificaciones detalladas del vehículo."
        docType="fichaTecnica"
      />
    </div>
  );
}
