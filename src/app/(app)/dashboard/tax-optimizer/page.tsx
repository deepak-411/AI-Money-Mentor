import TaxOptimizer from "@/components/tools/TaxOptimizer";

export default function TaxOptimizerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Tax Optimizer</h1>
        <p className="text-muted-foreground">
          Identify deductions, compare tax regimes, and get personalized tax-saving investment suggestions.
        </p>
      </div>
      <TaxOptimizer />
    </div>
  );
}
