'use server';

/**
 * @fileOverview Summarizes posture analysis results, providing personalized feedback.
 *
 * - summarizePostureAnalysis - A function to generate a summary of posture analysis.
 * - SummarizePostureAnalysisInput - The input type for the summarizePostureAnalysis function.
 * - SummarizePostureAnalysisOutput - The return type for the summarizePostureAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePostureAnalysisInputSchema = z.object({
  summaryReport: z.string().describe('The posture analysis results in JSON format.'),
});
export type SummarizePostureAnalysisInput = z.infer<typeof SummarizePostureAnalysisInputSchema>;

const SummarizePostureAnalysisOutputSchema = z.object({
  summary: z.string().describe('A GenAI-generated summary of the posture analysis results.'),
});
export type SummarizePostureAnalysisOutput = z.infer<typeof SummarizePostureAnalysisOutputSchema>;

export async function summarizePostureAnalysis(input: SummarizePostureAnalysisInput): Promise<SummarizePostureAnalysisOutput> {
  return summarizePostureAnalysisFlow(input);
}

const summarizePostureAnalysisPrompt = ai.definePrompt({
  name: 'summarizePostureAnalysisPrompt',
  input: {schema: SummarizePostureAnalysisInputSchema},
  output: {schema: SummarizePostureAnalysisOutputSchema},
  prompt: `You are an AI assistant that specializes in summarizing posture analysis reports.

  Based on the posture analysis report provided, generate a summary that highlights key areas of improvement and potential risks.
  Provide personalized feedback based on the data collected, focusing on specific instances of poor posture and their potential impact.

  Posture Analysis Report: {{{summaryReport}}} `,
});

const summarizePostureAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizePostureAnalysisFlow',
    inputSchema: SummarizePostureAnalysisInputSchema,
    outputSchema: SummarizePostureAnalysisOutputSchema,
  },
  async input => {
    const {output} = await summarizePostureAnalysisPrompt(input);
    return output!;
  }
);
