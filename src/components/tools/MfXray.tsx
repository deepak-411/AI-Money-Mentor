'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getMfPortfolioAnalysis } from '@/lib/actions';
import type { AnalyzeMutualFundPortfolioOutput } from '@/ai/flows/analyze-mutual-fund-portfolio-flow';
import { Loader2, RefreshCw, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  camsStatement: z.any().refine(file => file?.length == 1, 'File is required.'),
  riskProfile: z.enum(['Conservative', 'Moderate', 'Aggressive']),
});

const formatPercent = (value: number) => new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 2 }).format(value);

export default function MfXray() {
  const [result, setResult] = useState<AnalyzeMutualFundPortfolioOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { riskProfile: 'Moderate' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('camsStatement', event.target.files);
    } else {
      setFileName('');
      form.setValue('camsStatement', null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const file = values.camsStatement[0];
      const dataUri = await fileToDataUri(file);
      const response = await getMfPortfolioAnalysis({ 
          camsStatementDataUri: dataUri,
          riskProfile: values.riskProfile,
       });
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
        <h2 className="text-xl font-semibold">Analyzing Your Portfolio...</h2>
        <p className="text-muted-foreground">Our AI is performing an X-Ray on your portfolio. This may take a moment.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Portfolio XIRR: <span className="text-primary">{formatPercent(result.trueXirr)}</span></CardTitle>
                <CardDescription>Your portfolio's true Extended Internal Rate of Return (XIRR).</CardDescription>
            </CardHeader>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Stock Overlap Analysis</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Stock</TableHead><TableHead>Portfolio %</TableHead><TableHead>Funds Involved</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {result.overlapAnalysis.map(overlap => (
                            <TableRow key={overlap.stockName}>
                                <TableCell>{overlap.stockName}</TableCell>
                                <TableCell>{formatPercent(overlap.percentageInPortfolio / 100)}</TableCell>
                                <TableCell>{overlap.fundsInvolved.join(', ')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Expense Ratio Drag</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Fund</TableHead><TableHead>Current Ratio</TableHead><TableHead>Direct Plan Ratio</TableHead><TableHead>Drag</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {result.expenseRatioAnalysis.map(fund => (
                            <TableRow key={fund.fundName}>
                                <TableCell>{fund.fundName}</TableCell>
                                <TableCell>{formatPercent(fund.currentExpenseRatio)}</TableCell>
                                <TableCell>{fund.directPlanEquivalentExpenseRatio ? formatPercent(fund.directPlanEquivalentExpenseRatio) : 'N/A'}</TableCell>
                                <TableCell className="text-destructive font-medium">{formatPercent(fund.dragPercentage)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Rebalancing Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {result.rebalancingPlan.map(rec => (
                    <Card key={rec.fundName}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-4">{rec.fundName} <Badge variant={rec.action === 'Sell' ? 'destructive' : 'secondary'}>{rec.action}</Badge></CardTitle>
                            {rec.amountOrPercentage && <CardDescription>Amount/Percentage: {rec.amountOrPercentage}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">{rec.reason}</p>
                            <p className="text-xs text-muted-foreground"><strong>Tax Implication:</strong> {rec.taxImplication}</p>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>

        <Card variant="destructive" className="bg-destructive/10 border-destructive/50">
            <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-destructive-foreground">{result.disclaimer}</p></CardContent>
        </Card>
        
        <Button onClick={() => {
            setResult(null); 
            setFileName('');
            if(fileInputRef.current) fileInputRef.current.value = '';
            form.reset();
        }} className="w-full md:w-auto"><RefreshCw className="mr-2 h-4 w-4" />Start Over</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Statement</CardTitle>
        <CardDescription>Upload your CAMS or KFintech PDF statement to begin analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="camsStatement" render={({ field }) => (
              <FormItem>
                <FormLabel>CAMS/KFintech Statement</FormLabel>
                <FormControl>
                  <div 
                    className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF document</p>
                    <Input {...field} ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </div>
                </FormControl>
                {fileName && <div className="flex items-center gap-2 p-2 mt-2 border rounded-md bg-muted"><FileText className="h-5 w-5" /><p className="text-sm">{fileName}</p></div>}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="riskProfile" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Your Risk Profile</FormLabel><FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Conservative" /></FormControl><FormLabel className="font-normal">Conservative</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Moderate" /></FormControl><FormLabel className="font-normal">Moderate</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Aggressive" /></FormControl><FormLabel className="font-normal">Aggressive</FormLabel></FormItem>
                    </RadioGroup>
                </FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Run X-Ray Analysis'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
