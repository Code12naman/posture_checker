'use server';

import { summarizePostureAnalysis } from '@/ai/flows/summarize-posture-analysis';

export async function getPostureSummary(report: string) {
  try {
    const result = await summarizePostureAnalysis({ summaryReport: report });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error('Error in getPostureSummary:', error);
    return { success: false, error: 'Failed to generate AI summary. Please try again.' };
  }
}
