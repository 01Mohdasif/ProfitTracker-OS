"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { EmployeeFinancialData } from "@/app/dashboard/employee-value/employeeValueEngine";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EmployeeValueChart({ data }: { data: EmployeeFinancialData[] }) {
  // 1. Top 5 Most Valuable
  const top5 = [...data].sort((a, b) => b.netValue - a.netValue).slice(0, 5);

  // 2. Most Expensive
  const mostExpensive = [...data].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

  // 3. Loss Generating
  const losses = data.filter(d => d.netValue < 0).sort((a, b) => a.netValue - b.netValue);

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top 5 Chart */}
      <Card className="lg:col-span-2 shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top 5 Most Valuable Employees
          </CardTitle>
          <CardDescription>Based on Net Value Generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {top5.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Net Value"]}
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="netValue" radius={[4, 4, 0, 0]}>
                    {top5.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.netValue > 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No data available to display chart.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Widgets */}
      <div className="space-y-6 flex flex-col">
        {/* Most Expensive */}
        <Card className="flex-1 shadow-sm border-border bg-card">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Most Expensive</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mostExpensive.length > 0 ? mostExpensive.map(emp => (
              <div key={emp.id} className="flex justify-between items-center"><div className="flex flex-col min-w-0 pr-4"><span className="text-sm font-semibold truncate">{emp.name}</span><span className="text-xs text-muted-foreground truncate">{emp.designation}</span></div><span className="font-mono text-sm text-destructive font-bold">{formatCurrency(emp.totalCost)}</span></div>
            )) : <p className="text-sm text-muted-foreground italic">No data yet.</p>}
          </CardContent>
        </Card>

        {/* Loss Generating */}
        <Card className="flex-1 shadow-sm border-border bg-card">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="w-4 h-4 text-destructive" /> Generating Loss</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {losses.length > 0 ? losses.map(emp => (
              <div key={emp.id} className="flex justify-between items-center"><span className="text-sm font-medium truncate pr-4">{emp.name}</span><Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-md shrink-0">{formatCurrency(emp.netValue)}</Badge></div>
            )) : (
              <div className="flex items-center gap-2 text-sm text-green-500 font-medium p-2 bg-green-500/10 rounded-md">No employees are generating loss!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}