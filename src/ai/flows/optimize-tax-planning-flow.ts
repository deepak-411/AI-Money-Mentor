'use server';
/**
 * @fileOverview An AI agent that helps users optimize their tax planning by analyzing salary structure or Form 16 data,
 * calculating tax liability under both old and new regimes, identifying missed deductions, and suggesting personalized
 * tax-saving investments.
 *
 * - optimizeTaxPlanning - A function that handles the tax planning optimization process.
 * - OptimizeTaxPlanningInput - The input type for the optimizeTaxPlanning function.
 * - OptimizeTaxPlanningOutput - The return type for the optimizeTaxPlanning function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeTaxPlanningInputSchema = z.object({
  baseSalaryLacs: z
    .number()
    .describe('Base salary in Lakhs (e.g., 18 for ₹18,00,000).'),
  hraComponentLacs: z
    .number()
    .describe('House Rent Allowance (HRA) component in Lakhs.'),
  investments80CLacs: z
    .number()
    .describe('Investments under Section 80C in Lakhs.'),
  npsContributionLacs: z
    .number()
    .describe('National Pension System (NPS) contribution in Lakhs.'),
  homeLoanInterestLacs: z
    .number()
    .describe('Home loan interest deduction in Lakhs.'),
  otherIncomeLacs: z
    .number()
    .optional()
    .describe(
      'Optional: Any other income (e.g., from rent, interest) in Lakhs.'
    ),
  riskProfile: z
    .enum(['conservative', 'moderate', 'aggressive'])
    .describe('User\'s risk profile for investment suggestions.'),
  liquidityNeeds: z
    .enum(['low', 'medium', 'high'])
    .describe('User\'s liquidity needs for investment suggestions.'),
  form16Content: z
    .string()
    .optional()
    .describe(
      'Optional: Textual content from Form 16 if available (e.g., after OCR processing).'
    ),
});
export type OptimizeTaxPlanningInput = z.infer<typeof OptimizeTaxPlanningInputSchema>;

const InvestmentSuggestionSchema = z.object({
  name: z.string().describe('Name of the tax-saving investment instrument.'),
  description:
    z.string().describe('Brief description of the investment instrument.'),
  risk: z
    .enum(['low', 'medium', 'high'])
    .describe('Risk profile of the investment (low, medium, high).'),
  liquidity: z
    .enum(['low', 'medium', 'high'])
    .describe('Liquidity of the investment (low, medium, high).'),
  estimatedTaxSavingsLacs:
    z.number().describe('Estimated tax savings from this investment in Lakhs.'),
});

const OptimizeTaxPlanningOutputSchema = z.object({
  oldRegimeTaxLacs: z
    .number()
    .describe('Estimated tax liability under the Old Tax Regime in Lakhs.'),
  newRegimeTaxLacs: z
    .number()
    .describe('Estimated tax liability under the New Tax Regime in Lakhs.'),
  optimalRegime: z
    .enum(['old', 'new', 'equal'])
    .describe('The optimal tax regime (old, new, or equal).'),
  stepByStepCalculationsOldRegime:
    z.string().describe('Detailed step-by-step calculation under the Old Tax Regime.'),
  stepByStepCalculationsNewRegime:
    z.string().describe('Detailed step-by-step calculation under the New Tax Regime.'),
  missedDeductions:
    z.array(z.string()).describe('List of potential missed deductions.'),
  suggestedInvestments: z
    .array(InvestmentSuggestionSchema)
    .describe('Personalized tax-saving investment suggestions.'),
  disclaimer: z
    .string()
    .describe(
      'Important disclaimer regarding the AI-generated financial guidance.'
    ),
});
export type OptimizeTaxPlanningOutput = z.infer<typeof OptimizeTaxPlanningOutputSchema>;

const optimizeTaxPlanningPrompt = ai.definePrompt({
  name: 'optimizeTaxPlanningPrompt',
  input: { schema: OptimizeTaxPlanningInputSchema },
  output: { schema: OptimizeTaxPlanningOutputSchema },
  prompt: `You are an expert financial advisor specializing in Indian income tax and personal finance, particularly for individuals in India.
Your goal is to help users optimize their tax planning by providing accurate calculations, identifying opportunities, and suggesting personalized investments.

***Important Disclaimer:*** The guidance provided is for informational purposes only and does not constitute licensed financial advice. Consult a qualified financial advisor for personalized advice.

Here is the user's financial data:
- Base Salary: ₹{{{baseSalaryLacs}}} Lakhs
- HRA Component: ₹{{{hraComponentLacs}}} Lakhs
- Existing 80C Investments: ₹{{{investments80CLacs}}} Lakhs
- NPS Contribution: ₹{{{npsContributionLacs}}} Lakhs
- Home Loan Interest Deduction: ₹{{{homeLoanInterestLacs}}} Lakhs
{{#if otherIncomeLacs}}- Other Income: ₹{{{otherIncomeLacs}}} Lakhs{{/if}}

User's Investment Preferences:
- Risk Profile: {{{riskProfile}}}
- Liquidity Needs: {{{liquidityNeeds}}}

{{#if form16Content}}
Here is additional content from Form 16, if available:
"""
{{{form16Content}}}
"""
{{/if}}

Your tasks are as follows:

1.  **Calculate Tax Liability (Old Tax Regime)**:
    Calculate the estimated tax liability under the Old Tax Regime for the current financial year. Provide a step-by-step breakdown of how this is calculated, including applicable deductions and exemptions, leading to the final tax amount.

2.  **Calculate Tax Liability (New Tax Regime)**:
    Calculate the estimated tax liability under the New Tax Regime for the current financial year. Provide a step-by-step breakdown of how this is calculated, noting that most deductions are not available under this regime, leading to the final tax amount.

3.  **Determine Optimal Regime**:
    Based on your calculations, clearly state which of the two regimes (Old or New) is optimal for the user to minimize their tax burden. If they are equal, state 'equal'.

4.  **Identify Missed Deductions**:
    Review the provided financial data and identify any potential deductions or exemptions under the Old Regime that the user might be missing or underutilizing based on typical Indian tax laws.

5.  **Suggest Tax-Saving Investments**:
    Suggest 2-3 additional tax-saving investment instruments (e.g., ELSS, PPF, NSC, specific insurance plans, etc.) tailored to the user's risk profile ({{{riskProfile}}}) and liquidity needs ({{{liquidityNeeds}}}). For each suggestion, provide:
    -   Its name
    -   A brief description
    -   Its risk profile (low, medium, high)
    -   Its liquidity (low, medium, high)
    -   An estimated potential tax savings in Lakhs.

Ensure your output adheres strictly to the 'OptimizeTaxPlanningOutputSchema' structure, providing all fields, especially the step-by-step calculations for both regimes and the mandatory disclaimer.
`,
});

const optimizeTaxPlanningFlow = ai.defineFlow(
  {
    name: 'optimizeTaxPlanningFlow',
    inputSchema: OptimizeTaxPlanningInputSchema,
    outputSchema: OptimizeTaxPlanningOutputSchema,
  },
  async (input) => {
    const { output } = await optimizeTaxPlanningPrompt(input);
    return output!;
  }
);

export async function optimizeTaxPlanning(
  input: OptimizeTaxPlanningInput
): Promise<OptimizeTaxPlanningOutput> {
  return optimizeTaxPlanningFlow(input);
}
