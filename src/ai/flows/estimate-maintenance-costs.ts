'use server';

/**
 * @fileOverview A flow to estimate vehicle maintenance costs based on vehicle details.
 *
 * - estimateMaintenanceCosts - Estimates the maintenance costs for a vehicle.
 * - EstimateMaintenanceCostsInput - The input type for the estimateMaintenanceCosts function.
 * - EstimateMaintenanceCostsOutput - The return type for the estimateMaintenanceCosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateMaintenanceCostsInputSchema = z.object({
  make: z.string().describe('The make of the vehicle (e.g., Toyota, Honda).'),
  model: z.string().describe('The model of the vehicle (e.g., Camry, Civic).'),
  mileage: z.number().describe('The current mileage of the vehicle.'),
  usage: z.string().describe('How the vehicle is typically used (e.g., daily commute, long trips).'),
});

export type EstimateMaintenanceCostsInput = z.infer<
  typeof EstimateMaintenanceCostsInputSchema
>;

const EstimateMaintenanceCostsOutputSchema = z.object({
  estimatedCost: z
    .string()
    .describe('Estimated maintenance costs for the vehicle.'),
  suggestedShops: z.string().describe('Suggested nearby mechanic shops.'),
});

export type EstimateMaintenanceCostsOutput = z.infer<
  typeof EstimateMaintenanceCostsOutputSchema
>;

export async function estimateMaintenanceCosts(
  input: EstimateMaintenanceCostsInput
): Promise<EstimateMaintenanceCostsOutput> {
  return estimateMaintenanceCostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateMaintenanceCostsPrompt',
  input: {schema: EstimateMaintenanceCostsInputSchema},
  output: {schema: EstimateMaintenanceCostsOutputSchema},
  prompt: `You are an expert mechanic, who helps estimate costs of maintenance for vehicles.

Based on the make, model, mileage, and usage of the vehicle, estimate the maintenance costs and suggest nearby mechanic shops.

Make: {{{make}}}
Model: {{{model}}}
Mileage: {{{mileage}}}
Usage: {{{usage}}}

Estimate:
`,
});

const estimateMaintenanceCostsFlow = ai.defineFlow(
  {
    name: 'estimateMaintenanceCostsFlow',
    inputSchema: EstimateMaintenanceCostsInputSchema,
    outputSchema: EstimateMaintenanceCostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
