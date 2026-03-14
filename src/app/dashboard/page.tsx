
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Store } from '@/lib/store';
import { User, Project, FinancialStats, Task } from '@/lib/types';
import { KPICard } from '@/components/dashboard/kpi-card';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  FileText,
  IndianRupee,
  MessageSquare,
  Send,
  PieChart as LucidePieChart,
  ArrowRight,
  Trophy,
  Star,
  Printer,
  ChevronRight,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CHART_COLORS = ['#67A6E4', '#2E2EB8', '#9B51E0', '#FF8B3E', '#27AE60'];

export default function DashboardHome() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReportProject, setSelectedReportProject] = useState<string>("all");
  
  const [updateTask, setUpdateTask] = useState<{ task: Task, newStatus: Task['status'] } | null>(null);
  const [progressNote, setProgressNote] = useState("");

  const loadData = () => {
    const auth = Store.getAuth();
    if (auth) {
      setUser(auth);
      const tenantProjects = Store.getProjects().filter(p => p.tenantId === auth.tenantId);
      setProjects(tenantProjects);
      setStats(Store.calculateFinancials(auth.tenantId));
      setEmployees(Store.getUsers().filter(u => u.tenantId === auth.tenantId && u.role === 'EMPLOYEE'));
      
      const allAssignments = Store.getAssignments().filter(a => a.employeeId === auth.id && a.taskId);
      const taskIds = allAssignments.map(a => a.taskId);
      setTasks(Store.getTasks().filter(t => taskIds.includes(t.id)));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = () => {
    if (!updateTask) return;
    const { task, newStatus } = updateTask;
    
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      employeeNote: progressNote
    };

    Store.saveTask(updatedTask);
    toast({ title: "Status Updated", description: `Task is now ${newStatus}.` });
    setUpdateTask(null);
    setProgressNote("");
    loadData();
  };

  const handlePrint = () => {
    window.print();
  };

  const topEmployees = useMemo(() => {
    if (user?.role !== 'TENANT') return [];

    const employeeRevenueMap: Record<string, { user: User; revenue: number }> = {};

    projects.forEach(project => {
      const { totalCost, breakdown } = Store.calculateProjectCost(project.id);
      if (totalCost === 0) return;

      breakdown.forEach(item => {
        const shareOfRevenue = (item.cost / totalCost) * project.revenue;
        
        if (!employeeRevenueMap[item.employee.id]) {
          employeeRevenueMap[item.employee.id] = { user: item.employee, revenue: 0 };
        }
        employeeRevenueMap[item.employee.id].revenue += shareOfRevenue;
      });
    });

    return Object.values(employeeRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [projects, user]);

  const reportData = useMemo(() => {
    if (selectedReportProject === "all") {
      const projectBreakdown = projects.map(p => {
        const { totalCost } = Store.calculateProjectCost(p.id);
        return {
          id: p.id,
          title: p.title,
          revenue: p.revenue,
          cost: totalCost,
          margin: p.revenue - totalCost
        };
      });

      const aggregatedCost = projectBreakdown.reduce((sum, item) => sum + item.cost, 0);
      const aggregatedRevenue = projectBreakdown.reduce((sum, item) => sum + item.revenue, 0);

      return {
        type: "all",
        title: "Organization Global Report",
        totalRevenue: aggregatedRevenue,
        cost: aggregatedCost,
        efficiency: aggregatedCost > 0 ? (aggregatedRevenue / aggregatedCost).toFixed(2) : "0",
        breakdown: projectBreakdown
      };
    } else {
      const proj = projects.find(p => p.id === selectedReportProject);
      if (!proj) return null;

      const { totalCost, breakdown } = Store.calculateProjectCost(proj.id);
      return {
        type: "project",
        title: `Project Analysis: ${proj.title}`,
        revenue: proj.revenue,
        cost: totalCost,
        margin: proj.revenue - totalCost,
        efficiency: (proj.revenue / (totalCost || 1)).toFixed(2),
        breakdown: breakdown.map(b => ({
          name: b.employee.name,
          designation: b.employee.designation,
          days: b.days,
          cost: b.cost
        }))
      };
    }
  }, [selectedReportProject, projects, stats]);

  if (!user) return null;

  if (user.role === 'TENANT') {
    const chartData = projects.map(p => {
      const { totalCost } = Store.calculateProjectCost(p.id);
      return {
        name: p.title,
        revenue: p.revenue,
        cost: Math.round(totalCost)
      };
    });

    const pieData = projects.map((p, idx) => ({
      name: p.title,
      value: p.revenue,
      fill: CHART_COLORS[idx % CHART_COLORS.length]
    })).filter(p => p.value > 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Enterprise Overview</h1>
            <p className="text-muted-foreground">Monitor your organization's health and financial velocity.</p>
          </div>
          <Button 
            className="bg-primary gap-2 h-11 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto"
            onClick={() => setIsReportOpen(true)}
          >
            <FileText className="w-4 h-4" /> Generate Financial Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total Employees" 
            value={employees.length} 
            icon={<Users className="w-6 h-6" />} 
          />
          <KPICard 
            title="Active Projects" 
            value={projects.length} 
            icon={<Briefcase className="w-6 h-6" />} 
          />
          <KPICard 
            title="Total Contract Value" 
            value={`₹${(stats?.projectContribution || 0).toLocaleString()}`} 
            icon={<TrendingUp className="w-6 h-6" />} 
            // trend={{ value: 5, isUp: true }} 
          />
          <KPICard 
            title="Estimated Profit" 
            value={`₹${(stats?.employeeNetValue || 0).toLocaleString()}`} 
            icon={<IndianRupee className="w-6 h-6" />} 
            // trend={{ value: 2, isUp: stats ? stats.employeeNetValue > 0 : false }} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card/40 border-white/5 shadow-xl">
            <CardHeader><CardTitle>Project Profitability</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A23', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="revenue" name="Deal Value" fill="#67A6E4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Est. Cost" fill="#2E2EB8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="bg-card/40 border-white/5 shadow-xl">
            <CardHeader><CardTitle>Revenue Mix</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A23', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground text-xs">No project data available.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-card/40 border-white/5 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Top Revenue Drivers</CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">Attributed Value</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {topEmployees.map((item, idx) => (
                <div key={item.user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={`https://picsum.photos/seed/${item.user.id}/48/48`} />
                        <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {idx === 0 && <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{item.user.name}</p>
                      <p className="text-xs text-muted-foreground">{item.user.designation || 'Specialist'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary font-mono">₹{Math.round(item.revenue).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Revenue Unlocked</p>
                  </div>
                </div>
              ))}
              {topEmployees.length === 0 && (
                <p className="text-center py-10 text-muted-foreground italic text-sm">Assign employees to revenue projects to see data.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/5 shadow-xl">
            <CardHeader><CardTitle>Project Velocity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {projects.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div><p className="font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">Deal Value: ₹{p.revenue.toLocaleString()}</p></div>
                  </div>
                  <Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              /* Extra pages aur blank space rokne ke liye bg elements hide kar rahe hain */
              header, aside, footer { display: none !important; }
              div[class*="bg-black"] { display: none !important; }
              
              /* 100vh height wale containers ko collapse kar rahe hain taaki extra blank page na aaye */
              body, html, .min-h-screen, .min-h-svh, .h-screen, .h-svh, main {
                height: auto !important;
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
              }

              body { overflow: visible !important; background: white !important; }
            }
          `}} />
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl print:!static print:!transform-none print:!w-full print:!max-w-none print:!h-auto print:!overflow-visible print:border-none print:shadow-none print:bg-white print:text-black">
            <DialogHeader className="p-4 border-b bg-muted/30 print:hidden shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <LucidePieChart className="w-5 h-5 text-primary" /> Financial Yield Analysis
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Generate professional yield analysis reports.
                  </DialogDescription>
                </div>
                <div className="w-full sm:w-64">
                  <Select value={selectedReportProject} onValueChange={setSelectedReportProject}>
                    <SelectTrigger className="bg-background border-primary/20 h-9">
                      <SelectValue placeholder="Select Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Entire Organization</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 bg-background overflow-y-auto relative print:overflow-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="p-4 sm:p-8 space-y-6 print:space-y-8 print:p-8 print:max-w-4xl print:mx-auto">
                
                {/* Professional Print Header */}
                <div className="hidden print:flex justify-between items-end border-b-2 print:!border-black pb-6 mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 print:!text-black">
                      <Target className="w-8 h-8" />
                      <span className="text-3xl font-bold tracking-tight font-headline">ProfitTracker OS</span>
                    </div>
                    <p className="text-sm font-medium print:!text-gray-600">Automated Financial Intelligence</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-bold uppercase tracking-widest print:!text-black">{reportData?.title}</p>
                    <p className="text-sm font-medium print:!text-gray-600">Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-8 print:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/10 shadow-none print:!border-black print:!border-2 print:!bg-white print:break-inside-avoid">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2 print:!text-black">Target Revenue</p>
                      <p className="text-3xl font-bold text-primary font-mono print:!text-black">₹{(reportData?.type === 'all' ? reportData.totalRevenue : reportData?.revenue)?.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/5 border-destructive/10 shadow-none print:!border-black print:!border-2 print:!bg-white print:break-inside-avoid">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2 print:!text-black">Calculated Burn Cost</p>
                      <p className="text-3xl font-bold text-destructive font-mono print:!text-red-600">₹{Math.round(reportData?.cost || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-green-500/10 shadow-none print:!border-black print:!border-2 print:!bg-white print:break-inside-avoid">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2 print:!text-black">Efficiency Factor</p>
                      <p className="text-3xl font-bold text-green-500 print:!text-green-600">{reportData?.efficiency}x</p>
                      <p className="text-[10px] text-muted-foreground mt-1 print:!text-gray-600">Revenue multiplier per ₹1 spent</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 print:mt-10">
                  <h4 className="text-sm font-bold flex items-center gap-2 print:!text-xl print:!text-black print:border-b print:!border-black print:pb-3 print:mb-4">
                    {reportData?.type === 'all' ? <Briefcase className="w-4 h-4 text-primary print:w-5 print:h-5 print:!text-black" /> : <Users className="w-4 h-4 text-primary print:w-5 print:h-5 print:!text-black" />}
                    {reportData?.type === 'all' ? 'Project Profitability Breakdown' : 'Resource Allocation & Burn Analysis'}
                  </h4>
                  
                  <div className="border rounded-xl bg-card overflow-hidden print:!border-black print:!border-2 print:shadow-none print:rounded-none">
                    <div className="overflow-x-auto w-full print:overflow-visible">
                      <Table className="min-w-[700px] print:min-w-full print:w-full">
                        <TableHeader className="bg-muted/50 print:!bg-gray-100">
                          <TableRow className="print:!border-black border-b">
                            {reportData?.type === 'all' ? (
                              <>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Project Name</TableHead>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Total Revenue</TableHead>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Total Burn</TableHead>
                                <TableHead className="h-10 text-right text-[11px] print:!text-sm print:!text-black print:!font-bold">Net Margin</TableHead>
                              </>
                            ) : (
                              <>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Team Member</TableHead>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Designation</TableHead>
                                <TableHead className="h-10 text-[11px] print:!text-sm print:!text-black print:!font-bold">Effort (Days)</TableHead>
                                <TableHead className="h-10 text-right text-[11px] print:!text-sm print:!text-black print:!font-bold">Burn Cost Allocation</TableHead>
                              </>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData?.breakdown.map((item: any, idx: number) => (
                            <TableRow key={idx} className="print:border-b print:!border-black print:break-inside-avoid">
                              {reportData?.type === 'all' ? (
                                <>
                                  <TableCell className="py-2 text-sm font-bold whitespace-nowrap print:!text-black">{item.title}</TableCell>
                                  <TableCell className="py-2 text-sm font-mono whitespace-nowrap print:!text-black">₹{item.revenue.toLocaleString()}</TableCell>
                                  <TableCell className="py-2 text-sm font-mono text-destructive whitespace-nowrap print:!text-red-600">₹{Math.round(item.cost).toLocaleString()}</TableCell>
                                  <TableCell className={cn(
                                    "py-2 text-right font-bold font-mono text-sm whitespace-nowrap",
                                    item.margin >= 0 ? "text-green-500 print:!text-green-600" : "text-destructive print:!text-red-600"
                                  )}>
                                    ₹{Math.round(item.margin).toLocaleString()}
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="py-2 text-sm font-bold whitespace-nowrap print:!text-black">{item.name}</TableCell>
                                  <TableCell className="py-2 whitespace-nowrap"><Badge variant="outline" className="text-[10px] print:!border-black print:!text-black">{item.designation || 'Staff'}</Badge></TableCell>
                                  <TableCell className="py-2 text-xs whitespace-nowrap print:!text-black">{item.days} Days</TableCell>
                                  <TableCell className="py-2 text-right font-mono text-sm font-semibold whitespace-nowrap print:!text-black">₹{Math.round(item.cost).toLocaleString()}</TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                          {reportData?.breakdown.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic text-xs">No data available for the selected scope.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="hidden print:block mt-16 pt-8 border-t print:!border-black text-center text-xs print:!text-gray-600 print:break-inside-avoid">
                  <p className="font-bold mb-1 print:!text-black">STRICTLY CONFIDENTIAL - DO NOT DISTRIBUTE</p>
                  <p>This report contains proprietary financial data generated via ProfitTracker OS.</p>
                </div>
              </div>
            </div>

            <DialogFooter className="p-3 border-t bg-muted/10 print:hidden shrink-0 flex items-center justify-between sm:justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsReportOpen(false)}>Close</Button>
              <Button onClick={handlePrint} size="sm" className="gap-2 bg-primary">
                <Printer className="w-4 h-4" /> Print/Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground">Here is the status of your current assignments.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Active Tasks" value={tasks.filter(t => t.status !== 'Completed').length} icon={<Clock className="w-6 h-6" />} />
        <KPICard title="Completed" value={tasks.filter(t => t.status === 'Completed').length} icon={<CheckCircle2 className="w-6 h-6" />} />
        <KPICard title="Blocked Tasks" value={tasks.filter(t => t.status === 'Blocked').length} icon={<AlertCircle className="w-6 h-6 text-destructive" />} />
      </div>
      <Card className="bg-card/40 border-white/5 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Assigned Tasks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 group transition-all">
                <div className="space-y-2 flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">{task.title}</h4>
                    <Badge className={cn("text-[10px] h-5", task.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500')}>{task.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Project ID: {task.projectId}</p>
                    {task.dueDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  </div>
                  {task.feedback && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mt-2">
                      <p className="text-[10px] font-bold text-primary uppercase flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Admin Feedback</p>
                      <p className="text-xs italic mt-1">{task.feedback}</p>
                    </div>
                  )}
                  {task.employeeNote && (
                    <div className="p-2 bg-muted/40 rounded-lg mt-1 border border-border/50">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">My Last Note</p>
                      <p className="text-[11px] mt-0.5">{task.employeeNote}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-2 h-9">Update Status <MoreVertical className="w-3 h-3" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setUpdateTask({ task, newStatus: 'Working' })}>Working</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUpdateTask({ task, newStatus: 'Completed' })}>Completed</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUpdateTask({ task, newStatus: 'Blocked' })} className="text-destructive">Blocked</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm italic">No active tasks assigned to you.</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!updateTask} onOpenChange={(open) => !open && setUpdateTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Progress Update</DialogTitle>
            <DialogDescription>
              Changing status to <strong>{updateTask?.newStatus}</strong>. Please describe what you have done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What I have done:</label>
              <Textarea 
                placeholder="e.g. Completed the wireframes and initial documentation..."
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateTask(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!progressNote.trim()} className="gap-2">
              <Send className="w-4 h-4" /> Send Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
