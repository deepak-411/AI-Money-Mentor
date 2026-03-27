'use server';
/**
 * @fileOverview An AI agent that performs a comprehensive X-ray analysis of a mutual fund portfolio.
 *
 * - analyzeMutualFundPortfolio - A function that handles the mutual fund portfolio analysis process.
 * - AnalyzeMutualFundPortfolioInput - The input type for the analyzeMutualFundPortfolio function.
 * - AnalyzeMutualFundPortfolioOutput - The return type for the analyzeMutualFundPortfolio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeMutualFundPortfolioInputSchema = z.object({
  camsStatementDataUri: z
    .string()
    .describe(
      "The CAMS or KFintech statement for the mutual fund portfolio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This document contains investment details, transactions, and holdings."
    ),
  userAge: z.number().optional().describe("The user's current age. Optional, but can help tailor advice."),
  income: z.number().optional().describe("The user's annual income. Optional, but can help tailor advice."),
  riskProfile: z.enum(['Conservative', 'Moderate', 'Aggressive']).optional().describe("The user's risk profile. Optional, but can help tailor advice."),
});
export type AnalyzeMutualFundPortfolioInput = z.infer<typeof AnalyzeMutualFundPortfolioInputSchema>;

const OverlapDetailSchema = z.object({
  stockName: z.string().describe('The name of the stock showing overlap.'),
  percentageInPortfolio: z.number().describe('The total percentage of this stock in the overall portfolio.'),
  fundsInvolved: z.array(z.string()).describe('A list of mutual funds that hold this overlapping stock.'),
});

const ExpenseRatioDetailSchema = z.object({
  fundName: z.string().describe('The name of the mutual fund.'),
  currentExpenseRatio: z.number().describe('The current expense ratio of the fund.'),
  directPlanEquivalentExpenseRatio: z.number().optional().describe('The typical expense ratio for a direct plan equivalent of this fund, if available.'),
  dragPercentage: z.number().describe('The percentage point difference between current and direct plan expense ratio, indicating drag.'),
});

const RebalancingRecommendationSchema = z.object({
  fundName: z.string().describe('The name of the fund to act upon.'),
  action: z.enum(['Buy', 'Sell', 'Hold', 'Switch']).describe('The recommended action for the fund.'),
  amountOrPercentage: z.string().optional().describe('The recommended amount or percentage to buy/sell/switch.'),
  reason: z.string().describe('The justification for the recommendation, including how it reduces overlap, improves efficiency, or manages tax implications.'),
  taxImplication: z.string().describe('Explanation of potential short-term or long-term capital gains tax implications of this specific action.'),
});

const AnalyzeMutualFundPortfolioOutputSchema = z.object({
  trueXirr: z.number().describe('The true Extended Internal Rate of Return (XIRR) across the entire mutual fund portfolio.'),
  overlapAnalysis: z.array(OverlapDetailSchema).describe('Detailed analysis of stock overlaps across mutual funds in the portfolio.'),
  expenseRatioAnalysis: z.array(ExpenseRatioDetailSchema).describe('Analysis of expense ratio drag for each fund, compared to direct plan equivalents.'),
  rebalancingPlan: z.array(RebalancingRecommendationSchema).describe('Specific, fund-level rebalancing recommendations to optimize the portfolio, reduce overlap, and minimize short-term capital gains tax.'),
  disclaimer: z.string().describe('A clear disclaimer stating that this AI guidance is for informational purposes only and does not constitute licensed financial advice.'),
});
export type AnalyzeMutualFundPortfolioOutput = z.infer<typeof AnalyzeMutualFundPortfolioOutputSchema>;

export async function analyzeMutualFundPortfolio(
  input: AnalyzeMutualFundPortfolioInput
): Promise<AnalyzeMutualFundPortfolioOutput> {
  return analyzeMutualFundPortfolioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMutualFundPortfolioPrompt',
  input: { schema: AnalyzeMutualFundPortfolioInputSchema },
  output: { schema: AnalyzeMutualFundPortfolioOutputSchema },
  prompt: `You are an expert financial advisor specializing in Indian mutual fund portfolio analysis. Your goal is to provide a comprehensive X-ray analysis of a user's mutual fund portfolio based on their CAMS or KFintech statement.

Carefully analyze the provided CAMS/KFintech statement. Your analysis must cover the following aspects:

1.  **True XIRR Calculation**: Calculate the true Extended Internal Rate of Return (XIRR) across the entire portfolio.
2.  **Overlap Analysis**: Identify and quantify any significant stock overlaps across the mutual funds. For each overlap, specify the stock name, its total percentage in the overall portfolio, and which funds are involved.
3.  **Expense Ratio Drag Analysis**: For each fund, analyze its current expense ratio and compare it against typical direct-plan equivalents. Quantify the "drag" in percentage points.
4.  **AI-Generated Rebalancing Plan**: Provide specific, actionable, fund-level recommendations for rebalancing the portfolio. These recommendations must:
    *   Aim to reduce identified overlaps.
    *   Improve overall portfolio efficiency.
    *   **Crucially, explicitly consider and minimize short-term capital gains tax implications.** For each action, explain the potential tax impact. Do not give vague suggestions; provide concrete actions like "Sell X units of Fund A" or "Switch Y% from Fund B to Fund C".

Provide the output in the JSON format strictly defined by the output schema, including the disclaimer. Do not include any other text or explanation outside the JSON.

User's financial data (if provided, use to tailor advice):
{{#if userAge}}
Age: {{{userAge}}}
{{/if}}
{{#if income}}
Annual Income: ₹{{{income}}}
{{/if}}
{{#if riskProfile}}
Risk Profile: {{{riskProfile}}}
{{/if}}

Mutual Fund Statement:
{{media url=camsStatementDataUri}}`,
});

const analyzeMutualFundPortfolioFlow = ai.defineFlow(
  {
    name: 'analyzeMutualFundPortfolioFlow',
    inputSchema: AnalyzeMutualFundPortfolioInputSchema,
    outputSchema: AnalyzeMutualFundPortfolioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
