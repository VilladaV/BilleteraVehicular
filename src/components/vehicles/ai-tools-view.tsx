'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { VehicleWithId } from '@/lib/types';
import {
  estimateMaintenanceCosts,
  type EstimateMaintenanceCostsOutput,
} from '@/ai/flows/estimate-maintenance-costs';
import { useToast } from '@/hooks/use-toast';

interface AiToolsViewProps {
  vehicle: VehicleWithId;
}

export function AiToolsView({ vehicle }: AiToolsViewProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState('Uso mixto, ciudad y carretera fines de semana.');
  const [estimation, setEstimation] = useState<EstimateMaintenanceCostsOutput | null>(null);

  const handleEstimate = async () => {
    setIsLoading(true);
    setEstimation(null);

    try {
      const result = await estimateMaintenanceCosts({
        make: vehicle.propertyCard.back.marca,
        model: vehicle.propertyCard.back.linea,
        mileage: vehicle.maintenance.currentMileage,
        usage: usage,
      });
      setEstimation(result);
    } catch (error) {
      console.error('Error estimating costs:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Estimación',
        description: 'No se pudo obtener la estimación. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Asistente Inteligente
          </CardTitle>
          <CardDescription>
            Utiliza IA para obtener estimaciones y recomendaciones para tu vehículo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
              <Wand2 className="mr-2 h-4 w-4" />
              Estimar Costos de Mantenimiento
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Estimar Costos de Mantenimiento</DialogTitle>
            <DialogDescription>
              Describe cómo usas tu vehículo para obtener una estimación más precisa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usage">Uso del Vehículo</Label>
              <Textarea
                id="usage"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                placeholder="Ej: Conducción diaria en ciudad, viajes largos en carretera..."
              />
            </div>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Calculando...</p>
              </div>
            )}
            {estimation && (
              <Card className="bg-accent/30">
                <CardHeader>
                  <CardTitle className="text-base">Resultado de la Estimación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">Costo Estimado:</p>
                    <p className="text-muted-foreground">{estimation.estimatedCost}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Talleres Sugeridos:</p>
                    <p className="text-muted-foreground">{estimation.suggestedShops}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleEstimate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {estimation ? 'Volver a Estimar' : 'Estimar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
