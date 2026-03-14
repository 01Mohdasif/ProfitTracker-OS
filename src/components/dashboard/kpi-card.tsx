import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, icon, trend, className }: KPICardProps) {
  return (
    <Card className={cn("bg-card/40 border-white/5 backdrop-blur-md", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold font-headline">{value}</h3>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-accent">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}