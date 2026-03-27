'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getFirePlan } from '@/lib/actions';
import type { FIREPathPlannerOutput } from '@/ai/flows/generate-fire-plan-flow';
import { Loader2, PlusCircle, RefreshCw, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const investmentSchema = z.object({
  name: z.string().min(1, 'Investment name is required'),
  value: z.coerce.number().positive('Value must be positive'),
  type: z.string().min(1, 'Type is required'),
});

const formSchema = z.object({
  age: z.coerce.number().int().min(18, "Age must be at least 18."),
  income: z.coerce.number().positive("Annual income must be positive."),
  expenses: z.coerce.number().positive("Annual expenses must be positive."),
  existingInvestments: z.array(investmentSchema),
  retirementAge: z.coerce.number().min(18, "Retirement age must be at least 18."),
  targetMonthlyCorpusTodayValue: z.coerce.number().positive("Target corpus must be positive."),
  expectedInflationRate: z.coerce.number().min(0).max(1, "Rate must be between 0 and 1."),
  expectedInvestmentReturnRate: z.coerce.number().min(0).max(1, "Rate must be between 0 and 1."),
});

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function FirePlanner() {
  const [result, setResult] = useState<FIREPathPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 34,
      income: 2400000,
      expenses: 800000,
      existingInvestments: [
        { name: 'Equity MF', value: 1800000, type: 'Mutual Fund' },
        { name: 'PPF', value: 600000, type: 'PPF' },
      ],
      retirementAge: 50,
      targetMonthlyCorpusTodayValue: 150000,
      expectedInflationRate: 0.06,
      expectedInvestmentReturnRate: 0.12,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "existingInvestments",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getFirePlan(values);
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
        <h2 className="text-xl font-semibold">Generating Your FIRE Plan...</h2>
        <p className="text-muted-foreground">Our AI is building your financial roadmap. This may take a moment.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your FIRE Path to Retirement</CardTitle>
            <CardDescription>Estimated Retirement Date: <strong>{new Date(result.estimatedRetirementDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader><CardTitle>Target Corpus</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{formatCurrency(result.targetCorpusAtRetirement)}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Total Monthly SIP</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{formatCurrency(result.monthlySIPRecommendation.totalSIP)}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Emergency Fund</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{formatCurrency(result.emergencyFundTarget)}</p></CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Asset Class</TableHead><TableHead className="text-right">Percentage</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {result.assetAllocationRecommendation.map(asset => (
                                <TableRow key={asset.assetClass}>
                                    <TableCell>{asset.assetClass}</TableCell>
                                    <TableCell className="text-right font-medium">{asset.percentage}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Insurance Gap Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Life Insurance Needed</h4>
                        <p>{formatCurrency(result.insuranceGapAnalysis.lifeInsuranceNeeded)}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Health Insurance Needed</h4>
                        <p>{formatCurrency(result.insuranceGapAnalysis.healthInsuranceNeeded)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.insuranceGapAnalysis.notes}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Monthly Roadmap Summary</CardTitle></CardHeader>
          <CardContent><p>{result.monthlyRoadmapSummary}</p></CardContent>
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
        <CardTitle>Plan Your Financial Independence</CardTitle>
        <CardDescription>Fill in your details to generate a personalized roadmap.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="income" render={({ field }) => <FormItem><FormLabel>Annual Income (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="expenses" render={({ field }) => <FormItem><FormLabel>Annual Expenses (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="retirementAge" render={({ field }) => <FormItem><FormLabel>Desired Retirement Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="targetMonthlyCorpusTodayValue" render={({ field }) => <FormItem><FormLabel>Target Monthly Corpus (Today's Value)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="expectedInflationRate" render={({ field }) => <FormItem><FormLabel>Expected Inflation Rate (e.g., 0.06 for 6%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="expectedInvestmentReturnRate" render={({ field }) => <FormItem><FormLabel>Expected Return Rate (e.g., 0.12 for 12%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Existing Investments</h3>
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start p-4 border rounded-lg">
                        <FormField control={form.control} name={`existingInvestments.${index}.name`} render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name={`existingInvestments.${index}.type`} render={({ field }) => <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name={`existingInvestments.${index}.value`} render={({ field }) => <FormItem><FormLabel>Value (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-8"><Trash className="h-4 w-4" /></Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', value: 0, type: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Investment</Button>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Generate FIRE Plan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
