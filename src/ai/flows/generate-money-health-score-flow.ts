'use server';
/**
 * @fileOverview An AI agent for generating a comprehensive financial wellness score and insights.
 *
 * - generateMoneyHealthScore - A function that handles the money health score generation process.
 * - GenerateMoneyHealthScoreInput - The input type for the generateMoneyHealthScore function.
 * - GenerateMoneyHealthScoreOutput - The return type for the generateMoneyHealthScore function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateMoneyHealthScoreInputSchema = z.object({
  age: z.number().int().min(18).describe('The user\'s current age in years.'),
  annualIncome: z.number().positive().describe('The user\'s annual income in Indian Rupees (INR).'),
  monthlyExpenses: z.number().positive().describe('The user\'s total monthly expenses in Indian Rupees (INR).'),
  liquidSavings: z.number().min(0).describe('The amount of liquid savings (e.g., in a savings account or easily accessible fixed deposit) in INR.'),
  totalInvestments: z.number().min(0).describe('The total value of all existing investments (e.g., mutual funds, stocks, PPF) in INR.'),
  hasLifeInsurance: z.boolean().describe('Whether the user has life insurance.'),
  hasHealthInsurance: z.boolean().describe('Whether the user has health insurance.'),
  totalDebt: z.number().min(0).describe('The total outstanding debt (e.g., home loan, personal loan, credit card debt) in INR.'),
  retirementAgeGoal: z.number().int().min(50).max(70).describe('The age at which the user aims to retire.'),
  riskTolerance: z.enum(['low', 'medium', 'high']).describe('The user\'s risk tolerance for investments.'),
});
export type GenerateMoneyHealthScoreInput = z.infer<typeof GenerateMoneyHealthScoreInputSchema>;

// Output Schema
const DimensionScoreSchema = z.object({
  score: z.number().int().min(0).max(100).describe('A score for this dimension, ranging from 0 to 100.'),
  insights: z.string().describe('Detailed insights and recommendations for this dimension.'),
});

const GenerateMoneyHealthScoreOutputSchema = z.object({
  overallScore: z.number().int().min(0).max(100).describe('The overall financial wellness score, ranging from 0 to 100.'),
  dimensions: z.object({
    emergencyPrepared preparedness: DimensionScoreSchema.describe('Score and insights for emergency preparedness.'),
    insuranceCoverage: DimensionScoreSchema.describe('Score and insights for insurance coverage.'),
    investmentDiversification: DimensionScoreSchema.describe('Score and insights for investment diversification.'),
    debtHealth: DimensionScoreSchema.describe('Score and insights for debt health.'),
    taxEfficiency: DimensionScoreSchema.describe('Score and insights for tax efficiency.'),
    retirementReadiness: DimensionScoreSchema.describe('Score and insights for retirement readiness.'),
  }).describe('Scores and insights for each financial wellness dimension.'),
  generalInsights: z.string().describe('Overall summary and actionable advice based on the financial health assessment.'),
  disclaimer: z.string().describe('A disclaimer stating that this is AI guidance and not licensed financial advice.'),
});
export type GenerateMoneyHealthScoreOutput = z.infer<typeof GenerateMoneyHealthScoreOutputSchema>;

// Wrapper function
export async function generateMoneyHealthScore(input: GenerateMoneyHealthScoreInput): Promise<GenerateMoneyHealthScoreOutput> {
  return generateMoneyHealthScoreFlow(input);
}

// Prompt definition
const prompt = ai.definePrompt({
  name: 'generateMoneyHealthScorePrompt',
  input: { schema: GenerateMoneyHealthScoreInputSchema },
  output: { schema: GenerateMoneyHealthScoreOutputSchema },
  prompt: `You are an AI-powered personal finance mentor named AI Money Mentor, specializing in providing financial wellness assessments and initial insights for users in India. Your goal is to help users understand their financial health across key dimensions and offer actionable, general guidance.\n\nPlease analyze the following financial details provided by the user and generate a comprehensive financial wellness score, scores and insights for each of the 6 key dimensions, general insights, and a clear disclaimer.\n\nIndian Financial Context: Keep in mind Indian financial products, tax laws (general awareness, not specific calculations), and common financial goals.\n\nUser Financial Details:\n- Age: {{{age}}} years\n- Annual Income: INR {{{annualIncome}}}\n- Monthly Expenses: INR {{{monthlyExpenses}}}\n- Liquid Savings: INR {{{liquidSavings}}}\n- Total Investments: INR {{{totalInvestments}}}\n- Life Insurance: {{#if hasLifeInsurance}}Yes{{else}}No{{/if}}\n- Health Insurance: {{#if hasHealthInsurance}}Yes{{else}}No{{/if}}\n- Total Debt: INR {{{totalDebt}}}\n- Retirement Age Goal: {{{retirementAgeGoal}}} years\n- Risk Tolerance: {{{riskTolerance}}}\n\nGuidelines for Assessment:\n1.  **Emergency Preparedness**: Assess based on liquid savings relative to monthly expenses (e.g., aiming for 3-6 months of expenses).\n2.  **Insurance Coverage**: Assess based on presence of life and health insurance. Provide general advice on adequate coverage.\n3.  **Investment Diversification**: Assess based on total investments and implicitly, the need for diversification based on age and goals (even without specific details, you can recommend diversification).\n4.  **Debt Health**: Assess based on total debt relative to income and general principles of healthy debt management.\n5.  **Tax Efficiency**: Provide general insights on potential tax-saving instruments (e.g., 80C, NPS, ELSS) relevant to India, given the income level. Note that specific tax calculations are out of scope.\n6.  **Retirement Readiness**: Assess based on age, income, existing investments, and retirement goal. Provide general guidance on increasing retirement corpus.\n\nGenerate a score from 0-100 for each dimension, and for the overall financial health. For each dimension, provide detailed, actionable insights.\n\nEnsure the output is strictly in JSON format matching the provided schema.\nInclude the following disclaimer as part of your output:\n"Disclaimer: The information provided by AI Money Mentor is for educational and informational purposes only and does not constitute financial advice. It is recommended to consult with a SEBI registered financial advisor for personalized financial planning."
`,
});

// Flow definition
const generateMoneyHealthScoreFlow = ai.defineFlow(
  {
    name: 'generateMoneyHealthScoreFlow',
    inputSchema: GenerateMoneyHealthScoreInputSchema,
    outputSchema: GenerateMoneyHealthScoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate money health score output.');
    }
    return output;
  }
);
