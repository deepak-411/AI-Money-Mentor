'use server';

import { 
  generateMoneyHealthScore, 
  GenerateMoneyHealthScoreInput, 
  GenerateMoneyHealthScoreOutput 
} from '@/ai/flows/generate-money-health-score-flow';
import {
  generateFIREPlan,
  FIREPathPlannerInput,
  FIREPathPlannerOutput
} from '@/ai/flows/generate-fire-plan-flow';
import {
  optimizeTaxPlanning,
  OptimizeTaxPlanningInput,
  OptimizeTaxPlanningOutput
} from '@/ai/flows/optimize-tax-planning-flow';
import {
  analyzeMutualFundPortfolio,
  AnalyzeMutualFundPortfolioInput,
  AnalyzeMutualFundPortfolioOutput
} from '@/ai/flows/analyze-mutual-fund-portfolio-flow';

export async function getMoneyHealthScore(data: GenerateMoneyHealthScoreInput): Promise<GenerateMoneyHealthScoreOutput> {
  try {
    const result = await generateMoneyHealthScore(data);
    return result;
  } catch (error) {
    console.error("Error generating money health score:", error);
    throw new Error("Failed to generate Money Health Score. Please try again.");
  }
}

export async function getFirePlan(data: FIREPathPlannerInput): Promise<FIREPathPlannerOutput> {
  try {
    const result = await generateFIREPlan(data);
    return result;
  } catch (error) {
    console.error("Error generating FIRE plan:", error);
    throw new Error("Failed to generate FIRE Plan. Please try again.");
  }
}

export async function getTaxOptimization(data: OptimizeTaxPlanningInput): Promise<OptimizeTaxPlanningOutput> {
    try {
      const result = await optimizeTaxPlanning(data);
      return result;
    } catch (error) {
      console.error("Error generating tax optimization:", error);
      throw new Error("Failed to generate Tax Optimization. Please try again.");
    }
  }
  
  export async function getMfPortfolioAnalysis(data: AnalyzeMutualFundPortfolioInput): Promise<AnalyzeMutualFundPortfolioOutput> {
    try {
      const result = await analyzeMutualFundPortfolio(data);
      return result;
    } catch (error) {
      console.error("Error generating MF portfolio analysis:", error);
      throw new Error("Failed to generate MF Portfolio Analysis. Please try again.");
    }
  }