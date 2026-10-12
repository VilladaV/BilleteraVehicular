'use client';

import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { useVehicles } from '@/hooks/use-vehicles';
import { VehicleWithId } from '@/lib/types';

const statusOrder = {
  'Disponible': 1,
  'En reparación': 2,
  'No disponible': 3,
  'Dañado': 4,
  'Decomisado': 5,
  'Vendido': 6,
};

export default function Home() {
  const { vehicles, loading } = useVehicles();

  const sortedVehicles = (vehicles || []).slice().sort((a, b) => {
    const statusA = a.status || 'No disponible';
    const statusB = b.status || 'No disponible';
    const orderA = statusOrder[statusA] || 99;
    const orderB = statusOrder[statusB] || 99;
    return orderA - orderB;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">
          Mis Vehículos
        </h1>
        <Button asChild>
          <Link href="/vehicles/new">
            <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {sortedVehicles.length === 0 ? (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold text-foreground">No tienes vehículos</h2>
                <p className="text-muted-foreground mt-2">Agrega tu primer vehículo para empezar a gestionarlo.</p>
                <Button asChild className="mt-4">
                  <Link href="/vehicles/new">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
                  </Link>
                </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
