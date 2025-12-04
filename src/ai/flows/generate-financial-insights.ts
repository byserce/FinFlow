'use server';

/**
 * @fileOverview A flow to generate financial insights and a summary of spending habits.
 *
 * - generateFinancialInsights - A function that generates insights based on transaction data.
 * - FinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInsightsInputSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      type: z.enum(['income', 'expense']),
      category: z.string(),
      date: z.string(), // ISO String
      note: z.string().optional(),
    })
  ).describe('An array of transaction objects.'),
});
export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

const FinancialInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s spending habits.'),
  insights: z.array(z.string()).describe('A list of insights about the user\'s spending habits.'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function generateFinancialInsights(input: FinancialInsightsInput): Promise<FinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transactions and provide a summary of the user's spending habits and a list of key insights.

Transactions:
{{#each transactions}}
- Date: {{date}}, Type: {{type}}, Amount: {{amount}}, Category: {{category}}, Note: {{note}}
{{/each}}

Summary:
{{{summary}}}

Insights:
{{#each insights}}
- {{{this}}}
{{/each}}
`,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
