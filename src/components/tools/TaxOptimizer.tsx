'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTaxOptimization } from '@/lib/actions';
import type { OptimizeTaxPlanningOutput } from '@/ai/flows/optimize-tax-planning-flow';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  baseSalaryLacs: z.coerce.number().positive("Base salary must be positive."),
  hraComponentLacs: z.coerce.number().min(0, "HRA cannot be negative."),
  investments80CLacs: z.coerce.number().min(0, "80C investments cannot be negative."),
  npsContributionLacs: z.coerce.number().min(0, "NPS contribution cannot be negative."),
  homeLoanInterestLacs: z.coerce.number().min(0, "Home loan interest cannot be negative."),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  liquidityNeeds: z.enum(['low', 'medium', 'high']),
});

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value * 100000);

export default function TaxOptimizer() {
  const [result, setResult] = useState<OptimizeTaxPlanningOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        baseSalaryLacs: 18,
        hraComponentLacs: 3.6,
        investments80CLacs: 1.5,
        npsContributionLacs: 0.5,
        homeLoanInterestLacs: 0.4,
        riskProfile: 'moderate',
        liquidityNeeds: 'medium',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getTaxOptimization(values);
      setResult(response);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border bg-card">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Optimizing Your Taxes...</h2>
        <p className="text-muted-foreground">Our AI is crunching the numbers. Please wait a moment.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Optimal Tax Regime: <span className="text-primary capitalize">{result.optimalRegime}</span></CardTitle>
                <CardDescription>Based on our analysis, the {result.optimalRegime} regime is more beneficial for you.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold">Old Regime Tax</h3>
                    <p className="text-3xl font-bold">{formatCurrency(result.oldRegimeTaxLacs)}</p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold">New Regime Tax</h3>
                    <p className="text-3xl font-bold">{formatCurrency(result.newRegimeTaxLacs)}</p>
                </div>
            </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Step-by-Step Calculations</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Old Regime Calculation</CardTitle></CardHeader>
                <CardContent><pre className="whitespace-pre-wrap text-sm">{result.stepByStepCalculationsOldRegime}</pre></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>New Regime Calculation</CardTitle></CardHeader>
                <CardContent><pre className="whitespace-pre-wrap text-sm">{result.stepByStepCalculationsNewRegime}</pre></CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card>
            <CardHeader><CardTitle>Missed Deductions</CardTitle></CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-1">
                    {result.missedDeductions.map((deduction, index) => <li key={index}>{deduction}</li>)}
                </ul>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Suggested Tax-Saving Investments</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.suggestedInvestments.map(investment => (
                    <Card key={investment.name} className="bg-muted">
                        <CardHeader>
                            <CardTitle>{investment.name}</CardTitle>
                            <CardDescription>Est. Savings: {formatCurrency(investment.estimatedTaxSavingsLacs)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">{investment.description}</p>
                            <div className="text-xs space-y-1">
                                <p><strong>Risk:</strong> <span className="capitalize">{investment.risk}</span></p>
                                <p><strong>Liquidity:</strong> <span className="capitalize">{investment.liquidity}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>

        <Card variant="destructive" className="bg-destructive/10 border-destructive/50">
            <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-destructive-foreground">{result.disclaimer}</p></CardContent>
        </Card>
        
        <Button onClick={() => setResult(null)} className="w-full md:w-auto"><RefreshCw className="mr-2 h-4 w-4" />Start Over</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your Financial Details</CardTitle>
        <CardDescription>Provide your salary and investment details for tax optimization.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField control={form.control} name="baseSalaryLacs" render={({ field }) => <FormItem><FormLabel>Base Salary (in Lacs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="hraComponentLacs" render={({ field }) => <FormItem><FormLabel>HRA Component (in Lacs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="investments80CLacs" render={({ field }) => <FormItem><FormLabel>80C Investments (in Lacs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="npsContributionLacs" render={({ field }) => <FormItem><FormLabel>NPS Contribution (in Lacs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="homeLoanInterestLacs" render={({ field }) => <FormItem><FormLabel>Home Loan Interest (in Lacs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <FormField control={form.control} name="riskProfile" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Risk Profile</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="conservative" /></FormControl><FormLabel className="font-normal">Conservative</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="moderate" /></FormControl><FormLabel className="font-normal">Moderate</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="aggressive" /></FormControl><FormLabel className="font-normal">Aggressive</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="liquidityNeeds" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Liquidity Needs</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="low" /></FormControl><FormLabel className="font-normal">Low</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="medium" /></FormControl><FormLabel className="font-normal">Medium</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="high" /></FormControl><FormLabel className="font-normal">High</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Optimize Taxes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
