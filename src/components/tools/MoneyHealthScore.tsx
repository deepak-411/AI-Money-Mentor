'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getMoneyHealthScore } from '@/lib/actions';
import type { GenerateMoneyHealthScoreOutput } from '@/ai/flows/generate-money-health-score-flow';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '../ui/progress';

const formSchema = z.object({
  age: z.coerce.number().int().min(18, "Age must be at least 18."),
  annualIncome: z.coerce.number().positive("Annual income must be positive."),
  monthlyExpenses: z.coerce.number().positive("Monthly expenses must be positive."),
  liquidSavings: z.coerce.number().min(0, "Liquid savings cannot be negative."),
  totalInvestments: z.coerce.number().min(0, "Total investments cannot be negative."),
  hasLifeInsurance: z.boolean(),
  hasHealthInsurance: z.boolean(),
  totalDebt: z.coerce.number().min(0, "Total debt cannot be negative."),
  retirementAgeGoal: z.coerce.number().int().min(50, "Retirement age must be at least 50.").max(70),
  riskTolerance: z.enum(['low', 'medium', 'high']),
});

export default function MoneyHealthScore() {
  const [result, setResult] = useState<GenerateMoneyHealthScoreOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      annualIncome: 1200000,
      monthlyExpenses: 50000,
      liquidSavings: 200000,
      totalInvestments: 500000,
      hasLifeInsurance: true,
      hasHealthInsurance: true,
      totalDebt: 100000,
      retirementAgeGoal: 60,
      riskTolerance: 'medium',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getMoneyHealthScore(values);
      setResult(response);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border bg-card">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Calculating Your Score...</h2>
        <p className="text-muted-foreground">Our AI is analyzing your financial data. Please wait a moment.</p>
      </div>
    );
  }

  if (result) {
    const dimensions = Object.entries(result.dimensions);
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Your Financial Wellness Report</CardTitle>
                    <CardDescription>
                        Here's your comprehensive money health score and personalized insights.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="h-48 w-48 rounded-full flex items-center justify-center bg-muted">
                            <span className="text-5xl font-bold text-primary">{result.overallScore}</span>
                        </div>
                        <p className="text-center mt-2 font-semibold">Overall Score</p>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                        {dimensions.map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-sm font-medium text-primary">{value.score}/100</span>
                                </div>
                                <Progress value={value.score} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dimensions.map(([key, value]) => (
                    <Card key={key}>
                        <CardHeader>
                            <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                            <div className="flex items-center gap-2 pt-2">
                                <Progress value={value.score} className="w-1/3" />
                                <span className="font-bold text-primary">{value.score}/100</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{value.insights}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>General Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{result.generalInsights}</p>
                </CardContent>
            </Card>

            <Card variant="destructive" className="bg-destructive/10 border-destructive/50">
                <CardHeader>
                    <CardTitle>Disclaimer</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive-foreground">{result.disclaimer}</p>
                </CardContent>
            </Card>

            <Button onClick={() => setResult(null)} className="w-full md:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Over
            </Button>
        </div>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Enter Your Financial Details</CardTitle>
            <CardDescription>Provide the following information to generate your score. Your data is not stored.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="annualIncome" render={({ field }) => (
                        <FormItem><FormLabel>Annual Income (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                        <FormItem><FormLabel>Monthly Expenses (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="liquidSavings" render={({ field }) => (
                        <FormItem><FormLabel>Liquid Savings (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="totalInvestments" render={({ field }) => (
                        <FormItem><FormLabel>Total Investments (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="totalDebt" render={({ field }) => (
                        <FormItem><FormLabel>Total Debt (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="retirementAgeGoal" render={({ field }) => (
                        <FormItem><FormLabel>Retirement Age Goal</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="riskTolerance" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Risk Tolerance</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="low" /></FormControl><FormLabel className="font-normal">Low</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="medium" /></FormControl><FormLabel className="font-normal">Medium</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="high" /></FormControl><FormLabel className="font-normal">High</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="hasLifeInsurance" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Do you have Life Insurance?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="hasHealthInsurance" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Do you have Health Insurance?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Generate Score'}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
