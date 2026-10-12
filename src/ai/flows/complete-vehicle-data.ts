'use server';

/**
 * @fileOverview A flow to complete vehicle data using AI.
 *
 * - completeVehicleData - A function that takes partial vehicle data and completes it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
  CompleteVehicleDataInputSchema, 
  type CompleteVehicleDataInput, 
  VehicleSchema, 
  type Vehicle 
} from '@/ai/flows/vehicle-schemas';


export async function completeVehicleData(input: CompleteVehicleDataInput): Promise<Vehicle> {
  return completeVehicleDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'completeVehicleDataPrompt',
  input: { schema: z.object({ propertyCardJson: z.string() }) },
  output: { schema: VehicleSchema },
  prompt: `You are an expert on Colombian vehicles and documentation. Your task is to complete the information for a vehicle object based on the partial data provided by the user.

You must fill in ALL empty or missing fields with realistic and coherent data based on the provided information (marca, linea, modelo).
- Generate all IDs and numbers with realistic Colombian formats.
- For 'firmaMatriculador', generate a name following this exact format: "GenericName I. LastName - Mat. SM-XXXX", where XXXX is a random 4-digit number. For example: "Carlos A. Ramirez - Mat. SM-6219". Use a different generic name each time.
- For 'numMotor', 'numSerie', 'numChasis', generate a complex, non-sequential, 17-character alphanumeric string. These should look like unique, random factory codes. DO NOT use simple patterns, alphabetic sequences (like ABCDE), numeric sequences (like 12345), or include obvious keywords like 'MOTOR', 'SERIE', or the vehicle's make/model. Example of a good serial: "9FG13X478KMN002P1". Example of a bad serial: "MAZDA-MOTOR-12345" or "A1B2C3D4E5F6G7H8I".
- For 'numeroLicencia', 'numeroPoliza', 'numeroCertificado', generate long, realistic-looking alphanumeric codes (e.g., 'A00345912', '4588123901', 'RNC8821033A'). Do not use simple numbers.
- For 'declaracion' and 'numero' of importacion, generate realistic alphanumeric codes like 'IMP-BOG-2023-00567' or 'DECL789123-C'.
- For 'placa', create a realistic Colombian license plate (e.g., ABC-123).
- For 'propietario.telefono', generate a 10-digit Colombian mobile number starting with '3' (e.g., 3101234567).
- For dates, use YYYY-MM-DD format.
- 'propietario': Use the owner data provided in the input.
- 'avaluoComercial': Provide a realistic market value in Colombian Pesos (COP) without formatting.
- The 'slug' should be in kebab-case, based on marca and linea.
- 'image.src' should be a URL from picsum.photos, like 'https://picsum.photos/seed/car<RANDOM_NUMBER>/600/400'.
- The 'image.hint' should describe the vehicle type (e.g., 'sedan car', 'suv car').
- For 'maintenance.tasks', create a few standard tasks (e.g., 'Cambio de Aceite', 'Revisión de Frenos'), but leave 'lastServiceMileage', 'nextServiceMileage', 'lastServiceDate', and 'nextServiceDate' as null.
- 'currentMileage' should be a low number, like under 1000, if it's a new model year.
- If you generate data for SOAT or Tecnomecanica, you MUST set "isStored": true. If you do not generate data for them, set "isStored": false.
- Set both 'documents.manual.url' and 'documents.fichaTecnica.url' to null and their 'isStored' to false.
- **Set the 'status' field to 'Disponible' by default.**

User's partial data:
{{{propertyCardJson}}}

Complete JSON object:
`,
});

const completeVehicleDataFlow = ai.defineFlow(
  {
    name: 'completeVehicleDataFlow',
    inputSchema: CompleteVehicleDataInputSchema,
    outputSchema: VehicleSchema,
  },
  async (input) => {
    const propertyCardJson = JSON.stringify(input.propertyCard);
    const { output } = await prompt({ propertyCardJson });
    return output!;
  }
);
