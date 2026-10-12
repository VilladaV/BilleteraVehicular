'use client';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VehicleSchema, type Vehicle, VehicleStatusSchema } from '@/ai/flows/vehicle-schemas';
import { Loader2, Save, X } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VehicleReviewFormProps {
  vehicleData: Vehicle;
  onSave: (data: Vehicle) => void;
  isSaving: boolean;
}

export function VehicleReviewForm({ vehicleData, onSave, isSaving }: VehicleReviewFormProps) {

  const form = useForm<Vehicle>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: vehicleData,
  });
  
  const { fields } = useFieldArray({
    control: form.control,
    name: 'maintenance.tasks',
  });
  
  const imageSrc = form.watch('image.src');

  const onSubmit = (data: Vehicle) => {
    // Before saving, determine if SOAT/Tecno data exists and set isStored accordingly.
    const soatHasData = data.documents.soat.numeroPoliza || data.documents.soat.aseguradora;
    const tecnoHasData = data.documents.tecnomecanica.numeroCertificado || data.documents.tecnomecanica.cda;

    data.documents.soat.isStored = !!soatHasData;
    data.documents.tecnomecanica.isStored = !!tecnoHasData;

    onSave(data);
  };
  
  const renderField = (name: any, label: string, type: 'text' | 'number' | 'date' = 'text') => {
    return (
      <FormField
        control={form.control}
        name={name as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input 
                {...field}
                type={type}
                value={field.value ?? ''}
                onChange={e => {
                  const value = e.target.value;
                  if (type === 'number') {
                    // Allow empty string for clearing the field, otherwise parse as number
                    field.onChange(value === '' ? undefined : parseInt(value, 10));
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const handleClearSoat = () => {
    form.setValue('documents.soat.numeroPoliza', undefined);
    form.setValue('documents.soat.aseguradora', undefined);
    form.setValue('documents.soat.fechaInicioVigencia', undefined);
    form.setValue('documents.soat.fechaFinVigencia', undefined);
    form.setValue('documents.soat.isStored', false);
  }

  const handleClearTecno = () => {
    form.setValue('documents.tecnomecanica.numeroCertificado', undefined);
    form.setValue('documents.tecnomecanica.cda', undefined);
    form.setValue('documents.tecnomecanica.fechaExpedicion', undefined);
    form.setValue('documents.tecnomecanica.fechaVencimiento', undefined);
    form.setValue('documents.tecnomecanica.isStored', false);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Revisa y Edita el Vehículo</CardTitle>
            <CardDescription>
              Ajusta cualquier campo que necesites antes de guardar. Los campos de documentos como SOAT/Tecnomecánica pueden dejarse vacíos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['general', 'propertyCard', 'documents', 'maintenance']} className="w-full">
              
              <AccordionItem value="general">
                <AccordionTrigger>Información General, Estado e Imagen</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden border p-2">
                     <Image src={imageSrc} alt="Vista previa del vehículo" fill className="object-cover rounded-md" />
                   </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('slug', 'Slug')}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VehicleStatusSchema.options.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {renderField('image.src', 'URL de Imagen (o Data URI)')}
                  {renderField('image.hint', 'Pista de Imagen (para IA)')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="propertyCard">
                <AccordionTrigger>Tarjeta de Propiedad</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <h4 className="font-semibold">Frente</h4>
                  <Separator/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    {renderField('propertyCard.front.numeroLicencia', 'Número Licencia')}
                    {renderField('propertyCard.front.fechaExpedicion', 'Fecha Expedición', 'date')}
                    {renderField('propertyCard.front.organismoTransito', 'Organismo de Tránsito')}
                    {renderField('propertyCard.front.limitacionesPropiedad', 'Limitaciones a la Propiedad')}
                    {renderField('propertyCard.front.firmaMatriculador', 'Firma Matriculador')}
                    {renderField('propertyCard.front.propietario.nombre', 'Nombre Propietario')}
                    {renderField('propertyCard.front.propietario.documento', 'Documento Propietario')}
                    {renderField('propertyCard.front.propietario.direccion', 'Dirección Propietario')}
                    {renderField('propertyCard.front.propietario.ciudad', 'Ciudad Propietario')}
                    {renderField('propertyCard.front.propietario.telefono', 'Teléfono Propietario')}
                  </div>

                  <h4 className="font-semibold mt-6">Reverso</h4>
                  <Separator/>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    {renderField('propertyCard.back.placa', 'Placa')}
                    {renderField('propertyCard.back.marca', 'Marca')}
                    {renderField('propertyCard.back.linea', 'Línea')}
                    {renderField('propertyCard.back.cilindraje', 'Cilindraje')}
                    {renderField('propertyCard.back.modelo', 'Modelo')}
                    {renderField('propertyCard.back.claseVehiculo', 'Clase de Vehículo')}
                    {renderField('propertyCard.back.color', 'Color')}
                    {renderField('propertyCard.back.servicio', 'Servicio')}
                    {renderField('propertyCard.back.carroceria', 'Carrocería')}
                    {renderField('propertyCard.back.numPuertas', 'Num. Puertas', 'number')}
                    {renderField('propertyCard.back.numMotor', 'Num. Motor')}
                    {renderField('propertyCard.back.numSerie', 'Num. Serie')}
                    {renderField('propertyCard.back.numChasis', 'Num. Chasis')}
                    {renderField('propertyCard.back.capacidad', 'Capacidad')}
                    {renderField('propertyCard.back.pesoBruto', 'Peso Bruto')}
                    {renderField('propertyCard.back.avaluoComercial', 'Avalúo Comercial (COP)', 'number')}
                    {renderField('propertyCard.back.importacion.declaracion', 'Declaración Importación')}
                    {renderField('propertyCard.back.importacion.numero', 'Número Importación')}
                    {renderField('propertyCard.back.importacion.ciudad', 'Ciudad Importación')}
                    {renderField('propertyCard.back.importacion.fecha', 'Fecha Importación', 'date')}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="documents">
                <AccordionTrigger>Documentos</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">SOAT</h4>
                    <Button variant="ghost" size="sm" type="button" onClick={handleClearSoat}>
                      <X className="mr-2 h-4 w-4" /> Limpiar
                    </Button>
                  </div>
                   <Separator/>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                      {renderField('documents.soat.numeroPoliza', 'Número de Póliza')}
                      {renderField('documents.soat.aseguradora', 'Aseguradora')}
                      {renderField('documents.soat.fechaInicioVigencia', 'Inicio Vigencia', 'date')}
                      {renderField('documents.soat.fechaFinVigencia', 'Fin Vigencia', 'date')}
                   </div>

                  <div className="flex justify-between items-center mt-6">
                    <h4 className="font-semibold">Tecnomecánica</h4>
                     <Button variant="ghost" size="sm" type="button" onClick={handleClearTecno}>
                      <X className="mr-2 h-4 w-4" /> Limpiar
                    </Button>
                  </div>
                   <Separator/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                      {renderField('documents.tecnomecanica.numeroCertificado', 'Número de Certificado')}
                      {renderField('documents.tecnomecanica.cda', 'CDA')}
                      {renderField('documents.tecnomecanica.fechaExpedicion', 'Fecha Expedición', 'date')}
                      {renderField('documents.tecnomecanica.fechaVencimiento', 'Fecha Vencimiento', 'date')}
                   </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="maintenance">
                <AccordionTrigger>Mantenimiento</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    {renderField('maintenance.currentMileage', 'Kilometraje Actual', 'number')}
                  <Separator/>
                  <h4 className="font-semibold mt-4">Tareas de Mantenimiento</h4>
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md space-y-4">
                        <FormField
                            control={form.control}
                            name={`maintenance.tasks.${index}.name`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Tarea</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`maintenance.tasks.${index}.lastServiceDate`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Última Fecha (YYYY-MM-DD)</FormLabel>
                                    <FormControl>
                                    <Input type="date" placeholder="Opcional" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`maintenance.tasks.${index}.nextServiceDate`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Próxima Fecha (YYYY-MM-DD)</FormLabel>
                                    <FormControl>
                                    <Input type="date" placeholder="Opcional" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`maintenance.tasks.${index}.lastServiceMileage`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Último KM</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Opcional" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`maintenance.tasks.${index}.nextServiceMileage`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Próximo KM</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Opcional" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar Vehículo
        </Button>
      </form>
    </FormProvider>
  );
}
