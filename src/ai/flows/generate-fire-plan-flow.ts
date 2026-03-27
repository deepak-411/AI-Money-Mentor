'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a Financial Independence, Retire Early (FIRE) plan.
 *
 * - generateFIREPlan - A function that handles the FIRE plan generation process.
 * - FIREPathPlannerInput - The input type for the generateFIREPlan function.
 * - FIREPathPlannerOutput - The return type for the generateFIREPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FIREPathPlannerInputSchema = z.object({
  age: z.number().min(18).describe('Current age of the user.'),
  income: z.number().min(0).describe('Current annual income of the user.'),
  expenses: z.number().min(0).describe('Current annual expenses of the user.'),
  existingInvestments: z.array(
    z.object({
      name: z.string().describe('Name of the investment (e.g., MF, PPF).'),
      value: z.number().min(0).describe('Current value of the investment.'),
      type: z.string().describe('Type of investment (e.g., Mutual Fund, PPF, Stocks).'),
    })
  ).describe('List of existing investments with their value and type.'),
  retirementAge: z.number().min(18).describe('Desired retirement age.'),
  targetMonthlyCorpusTodayValue: z.number().min(0).describe('Desired monthly corpus at retirement, in today\'s value (inflation-adjusted).'),
  expectedInflationRate: z.number().min(0).max(1).describe('Expected annual inflation rate (e.g., 0.05 for 5%).'),
  expectedInvestmentReturnRate: z.number().min(0).max(1).describe('Expected annual investment return rate (e.g., 0.12 for 12%).'),
});

export type FIREPathPlannerInput = z.infer<typeof FIREPathPlannerInputSchema>;

const FIREPathPlannerOutputSchema = z.object({
  estimatedRetirementDate: z.string().describe('The estimated date of achieving FIRE based on the plan (YYYY-MM-DD).'),
  targetCorpusAtRetirement: z.number().describe('The target corpus needed at retirement, adjusted for inflation.'),
  monthlySIPRecommendation: z.object({
    totalSIP: z.number().describe('Recommended total monthly SIP amount.'),
    goalSIPs: z.array(z.object({
      goal: z.string().describe('Specific goal for the SIP (e.g., retirement, child education).'),
      monthlyAmount: z.number().describe('Monthly SIP amount allocated to this goal.'),
    })).describe('Breakdown of monthly SIP amounts by specific goals.'),
  }).describe('Recommended total monthly SIP and breakdown by goal.'),
  assetAllocationRecommendation: z.array(
    z.object({
      assetClass: z.string().describe('Asset class (e.g., Equity, Debt, Gold).'),
      percentage: z.number().min(0).max(100).describe('Recommended percentage allocation for this asset class.'),
    })
  ).describe('Recommended asset allocation percentages across different asset classes.'),
  insuranceGapAnalysis: z.object({
    lifeInsuranceNeeded: z.number().describe('Recommended life insurance coverage needed.'),
    healthInsuranceNeeded: z.number().describe('Recommended health insurance coverage needed.'),
    notes: z.string().describe('Additional notes or recommendations regarding insurance.'),
  }).describe('Analysis of insurance gaps, specifying life and health insurance amounts needed.'),
  emergencyFundTarget: z.number().describe('Target amount for the emergency fund.'),
  monthlyRoadmapSummary: z.string().describe('A summary of the month-by-month financial roadmap, highlighting key milestones and actions.'),
  disclaimer: z.string().describe('A disclaimer stating that this is AI guidance and not licensed financial advice.'),
});

export type FIREPathPlannerOutput = z.infer<typeof FIREPathPlannerOutputSchema>;

export async function generateFIREPlan(input: FIREPathPlannerInput): Promise<FIREPathPlannerOutput> {
  return generateFIREPlanFlow(input);
}

const firePathPlannerPrompt = ai.definePrompt({
  name: 'firePathPlannerPrompt',
  input: { schema: FIREPathPlannerInputSchema },
  output: { schema: FIREPathPlannerOutputSchema },
  prompt: `You are an AI-powered personal finance mentor, specializing in Financial Independence, Retire Early (FIRE) planning for the Indian context. Your goal is to turn confused savers into confident investors by providing a comprehensive, month-by-month financial roadmap.

Based on the user's current financial situation and retirement goals, generate a detailed FIRE plan. Provide specific, actionable recommendations for SIP amounts, asset allocation shifts, insurance gaps, and emergency fund targets. Ensure all calculations are robust and recommendations are tailored.

User's current financial situation:
- Current Age: {{{age}}} years
- Annual Income: ₹{{{income}}}
- Annual Expenses: ₹{{{expenses}}}
- Existing Investments:
{{#each existingInvestments}}
  - {{this.name}} ({{this.type}}): ₹{{this.value}}
{{/each}}

User's retirement goals:
- Desired Retirement Age: {{{retirementAge}}} years
- Target Monthly Corpus (today's value, inflation-adjusted): ₹{{{targetMonthlyCorpusTodayValue}}}
- Expected Annual Inflation Rate: {{{expectedInflationRate}}}
- Expected Annual Investment Return Rate: {{{expectedInvestmentReturnRate}}}

Generate the FIRE plan following these steps and format the output as per the provided schema:

1.  **Calculate Target Corpus at Retirement**: Adjust the 'targetMonthlyCorpusTodayValue' for inflation until the 'retirementAge' and multiply by a reasonable withdrawal multiple (e.g., 25 years or 300 months for a 4% withdrawal rate) to get the total target corpus. Calculate the equivalent annual corpus needed after inflation.
2.  **Estimate Retirement Date**: Based on the current trajectory and recommended SIPs, estimate the earliest possible retirement date if different from the desired one. Start with the assumption of reaching the desired retirement age first.
3.  **Calculate Emergency Fund Target**: Recommend an emergency fund target, typically 6-12 months of annual expenses.
4.  **Recommend Monthly SIPs**: Calculate the total monthly SIP required to reach the 'targetCorpusAtRetirement' by the 'retirementAge', considering existing investments and expected investment returns. Break down the total SIP into conceptual goals (e.g., 'Retirement', 'Other Long-Term Goals').
5.  **Suggest Asset Allocation**: Provide asset allocation percentages (e.g., Equity, Debt, Gold) suitable for the user's age and time horizon, considering a balanced approach for FIRE.
6.  **Analyze Insurance Gaps**: Identify potential gaps in life and health insurance. For life insurance, suggest coverage of 10-15 times annual income. For health insurance, recommend a suitable sum based on family size and location.
7.  **Summarize Monthly Roadmap**: Provide a high-level summary of the monthly roadmap, emphasizing consistency in SIPs, regular review of asset allocation, and topping up the emergency fund.
8.  **Add Disclaimer**: Include a clear disclaimer.

Ensure all numerical outputs are precise and realistic. Always include the disclaimer as the last field.
`,
});

const generateFIREPlanFlow = ai.defineFlow(
  {
    name: 'generateFIREPlanFlow',
    inputSchema: FIREPathPlannerInputSchema,
    outputSchema: FIREPathPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await firePathPlannerPrompt(input);
    return output!;
  }
);
