import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Goal, HeartPulse, Receipt, FileSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Money Health Score",
    description: "Get a comprehensive wellness score for your finances.",
    icon: HeartPulse,
    href: "/dashboard/health-score",
    color: "text-red-500",
  },
  {
    title: "FIRE Path Planner",
    description: "Plan your journey to Financial Independence, Retire Early.",
    icon: Goal,
    href: "/dashboard/fire-planner",
    color: "text-green-500",
  },
  {
    title: "Tax Optimizer",
    description: "Analyze tax regimes and find saving opportunities.",
    icon: Receipt,
    href: "/dashboard/tax-optimizer",
    color: "text-blue-500",
  },
  {
    title: "MF Portfolio X-Ray",
    description: "Deep-dive analysis of your mutual fund portfolio.",
    icon: FileSearch,
    href: "/dashboard/mf-xray",
    color: "text-purple-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome, Investor!</h1>
        <p className="text-muted-foreground">
          Your journey to financial clarity starts here. Choose a tool to begin.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-3 bg-muted rounded-lg`}>
                <tool.icon className={`h-8 w-8 ${tool.color}`} />
              </div>
              <div>
                <CardTitle className="font-headline">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <div className="p-6 pt-0">
               <Button asChild className="w-full group">
                 <Link href={tool.href}>
                   Open Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                 </Link>
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
