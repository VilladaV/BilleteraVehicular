'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import type { VehicleWithId } from '@/lib/types';
import { VehicleSchema } from '@/ai/flows/vehicle-schemas';

// Hook to get all vehicles. No longer needs user context.
export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vehicles'));
  }, [firestore]);

  useEffect(() => {
    if (!vehiclesQuery) {
      setLoading(true); // Still loading if firestore is not ready
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      vehiclesQuery,
      (querySnapshot) => {
        const vehiclesData: VehicleWithId[] = [];
        querySnapshot.forEach((doc) => {
          const validation = VehicleSchema.safeParse(doc.data());
          if (validation.success) {
            vehiclesData.push({
              ...validation.data,
              id: doc.id,
            });
          } else {
            console.warn(`Invalid vehicle data in document ${doc.id}:`, validation.error.format());
          }
        });
        setVehicles(vehiclesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching vehicles:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vehiclesQuery]);

  return { vehicles, loading };
}


// Hook to get a single vehicle by its Firestore document ID.
export function useVehicle(id: string | undefined) {
    const [vehicle, setVehicle] = useState<VehicleWithId | null>(null);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!id || !firestore) {
            setLoading(true);
            return;
        }

        setLoading(true);
        const docRef = doc(firestore, 'vehicles', id);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const validation = VehicleSchema.safeParse(docSnap.data());
                if (validation.success) {
                    setVehicle({ ...validation.data, id: docSnap.id });
                } else {
                    console.warn(`Invalid vehicle data in document ${docSnap.id}:`, validation.error.format());
                    setVehicle(null);
                }
            } else {
                console.log("No such document!");
                setVehicle(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching vehicle:", error);
            setVehicle(null);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [firestore, id]);


    return { vehicle, loading };
}
