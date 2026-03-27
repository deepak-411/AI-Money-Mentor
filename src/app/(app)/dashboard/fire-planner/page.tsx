import FirePlanner from "@/components/tools/FirePlanner";

export default function FirePlannerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">FIRE Path Planner</h1>
        <p className="text-muted-foreground">
          Your complete, month-by-month financial roadmap to financial independence.
        </p>
      </div>
      <FirePlanner />
    </div>
  );
}
