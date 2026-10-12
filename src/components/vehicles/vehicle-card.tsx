import type { VehicleWithId, VehicleStatus } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GaugeCircle, Wrench, AlertTriangle, X, Check, MinusSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VehicleCardProps {
  vehicle: VehicleWithId;
}

const formatMileage = (km?: number | null) => {
    if (km === undefined || km === null) return 'N/A';
    return new Intl.NumberFormat('es-CO').format(km);
};

export const statusConfig: Record<VehicleStatus, { icon: React.ElementType, color: string, label: string }> = {
  'Disponible': { icon: Check, color: 'bg-green-500', label: 'Disponible' },
  'En reparación': { icon: Wrench, color: 'bg-yellow-500', label: 'En Reparación' },
  'Dañado': { icon: AlertTriangle, color: 'bg-orange-500', label: 'Dañado' },
  'Decomisado': { icon: X, color: 'bg-red-600', label: 'Decomisado' },
  'Vendido': { icon: Tag, color: 'bg-gray-500', label: 'Vendido' },
  'No disponible': { icon: MinusSquare, color: 'bg-gray-400', label: 'No Disponible' },
};

const VehicleStatusBadge = ({ status }: { status: VehicleStatus }) => {
  const { icon: Icon, color, label } = statusConfig[status] || statusConfig['No disponible'];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
           <div className={cn(
            "absolute top-4 right-0 z-10 pl-3 pr-4 py-1 flex items-center gap-2 text-white text-xs font-semibold rounded-l-full shadow-lg",
            color
          )}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const currentStatus = vehicle.status || 'No disponible';

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block outline-none" tabIndex={0}>
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.1),_0_8px_16px_rgba(0,0,0,0.1),_0_12px_24px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 group-focus-visible:shadow-2xl group-focus-visible:-translate-y-2 group-focus-visible:ring-2 group-focus-visible:ring-primary ring-offset-2 ring-offset-background rounded-lg bg-card border relative overflow-hidden",
        vehicle.status === 'Vendido' && 'opacity-60 grayscale'
      )}>
        
        <CardHeader className="p-0 relative">
           <div className="absolute top-4 left-0 z-10 bg-secondary text-secondary-foreground px-3 py-1 rounded-r-full text-xs font-bold shadow-md">
            {vehicle.propertyCard.back.marca}
           </div>
           <VehicleStatusBadge status={currentStatus} />
          <div className="relative h-48 w-full">
            <Image
              src={vehicle.image.src}
              alt={vehicle.propertyCard.back.linea}
              data-ai-hint={vehicle.image.hint}
              fill
              className="object-cover rounded-t-md"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-4 flex flex-col justify-between">
          <div>
             <h2 className="font-headline text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">
              {vehicle.propertyCard.back.linea}
            </h2>
            <p className="text-muted-foreground text-sm">{vehicle.propertyCard.back.modelo}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <GaugeCircle className="h-3.5 w-3.5" />
                <span>{formatMileage(vehicle.maintenance.currentMileage)} km</span>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="bg-yellow-400 text-black border-2 border-black rounded-md px-3 py-1.5 shadow-sm transform group-hover:scale-105 transition-transform">
                <span className="font-mono text-xl font-bold tracking-wider">
                    {vehicle.propertyCard.back.placa}
                </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
