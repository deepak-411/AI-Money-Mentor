import MoneyHealthScore from "@/components/tools/MoneyHealthScore";

export default function MoneyHealthScorePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Money Health Score</h1>
        <p className="text-muted-foreground">
          A 5-minute flow to get a comprehensive financial wellness score across 6 key dimensions.
        </p>
      </div>
      <MoneyHealthScore />
    </div>
  );
}
