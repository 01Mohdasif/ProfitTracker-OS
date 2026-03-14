"use client";

import { EmployeeFinancialData } from "@/app/dashboard/employee-value/employeeValueEngine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmployeeLeaderboard({ data }: { data: EmployeeFinancialData[] }) {
  // Data is already sorted by ROI descending in the engine
  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString()}`;

  const getCategoryBadge = (category: string) => {
    if (category === 'TOP') return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><ArrowUpCircle className="w-3 h-3" /> Top Performer</Badge>;
    if (category === 'AVERAGE') return <Badge variant="secondary" className="gap-1 text-yellow-600 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"><MinusCircle className="w-3 h-3" /> Average</Badge>;
    return <Badge variant="destructive" className="gap-1"><ArrowDownCircle className="w-3 h-3" /> Underperformer</Badge>;
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm mt-8">
      <div className="bg-muted/30 p-4 border-b flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-lg">Profitability Leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Revenue Contrib.</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Net Value</TableHead>
              <TableHead className="text-right">ROI %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((emp, index) => (
              <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center font-bold text-muted-foreground">#{index + 1}</TableCell>
                <TableCell className="font-semibold whitespace-nowrap">{emp.name}</TableCell>
                <TableCell>{getCategoryBadge(emp.rankCategory)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(emp.revenueContribution)}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(emp.totalCost)}</TableCell>
                <TableCell className={cn("text-right font-mono font-bold", emp.netValue >= 0 ? "text-green-500" : "text-destructive")}>{formatCurrency(emp.netValue)}</TableCell>
                <TableCell className={cn("text-right font-mono font-bold text-lg", emp.roi >= 0 ? "text-green-500" : "text-destructive")}>{emp.roi.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No data available.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}