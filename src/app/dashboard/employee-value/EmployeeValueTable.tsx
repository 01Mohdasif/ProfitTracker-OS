"use client";

import { useState, useMemo } from 'react';
import { EmployeeFinancialData } from "@/app/dashboard/employee-value/employeeValueEngine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SortKey = keyof EmployeeFinancialData;

export function EmployeeValueTable({ data }: { data: EmployeeFinancialData[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('netValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString()}`;

  const SortableHead = ({ label, sortKey: key, className }: { label: string, sortKey: SortKey, className?: string }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => handleSort(key)} className="-ml-4 h-8 data-[active=true]:bg-muted">
        {label} <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="border rounded-xl overflow-x-auto bg-card shadow-sm">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-muted/50">
          <TableRow><SortableHead label="Employee" sortKey="name" /><SortableHead label="Designation" sortKey="designation" /><SortableHead label="Salary" sortKey="monthlySalary" /><SortableHead label="Projects" sortKey="projectsWorked" /><SortableHead label="Modules" sortKey="modulesAssigned" /><SortableHead label="Tasks" sortKey="tasksAssigned" /><SortableHead label="Days Assigned" sortKey="daysAssigned" /><SortableHead label="Total Cost" sortKey="totalCost" /><SortableHead label="Revenue Contrib." sortKey="revenueContribution" /><SortableHead label="Net Value" sortKey="netValue" /><SortableHead label="ROI" sortKey="roi" className="text-right" /></TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold whitespace-nowrap">{emp.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{emp.designation}</TableCell>
              <TableCell className="font-mono">{formatCurrency(emp.monthlySalary)}</TableCell>
              <TableCell>{emp.projectsWorked}</TableCell>
              <TableCell>{emp.modulesAssigned}</TableCell>
              <TableCell>{emp.tasksAssigned}</TableCell>
              <TableCell>{emp.daysAssigned}</TableCell>
              <TableCell className="font-mono text-destructive">{formatCurrency(emp.totalCost)}</TableCell>
              <TableCell className="font-mono text-green-500">{formatCurrency(emp.revenueContribution)}</TableCell>
              <TableCell className={cn("font-mono font-bold", emp.netValue >= 0 ? "text-green-500" : "text-destructive")}>{formatCurrency(emp.netValue)}</TableCell>
              <TableCell className={cn("font-mono text-right font-bold", emp.roi >= 0 ? "text-green-500" : "text-destructive")}>{emp.roi.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}