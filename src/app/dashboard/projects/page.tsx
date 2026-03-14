"use client";

import { useEffect, useState, useMemo } from 'react';
import { Store } from '@/lib/store';
import { Project, User, Task, Module, Assignment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Target, 
  Layout, 
  CheckSquare, 
  Search, 
  ChevronsUpDown, 
  Pencil,
  Info,
  TrendingUp,
  MoreVertical,
  X,
  MessageSquare,
  History,
  Send,
  Users,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MultiSelectEmployeeProps {
  employees: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

function MultiSelectEmployee({ employees, selectedIds, onChange, placeholder = "Select team..." }: MultiSelectEmployeeProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const toggleSelection = (id: string) => {
    const current = [...safeSelectedIds];
    if (current.includes(id)) {
      onChange(current.filter(i => i !== id));
    } else {
      onChange([...current, id]);
    }
  };

  const selectedEmployees = useMemo(() => {
    return employees.filter(e => safeSelectedIds.includes(e.id));
  }, [employees, safeSelectedIds]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-auto min-h-10 text-left font-normal bg-background hover:bg-background/80">
          <div className="flex flex-wrap gap-1 py-1">
            {selectedEmployees.length > 0 ? selectedEmployees.map(emp => (
              <Badge key={emp.id} variant="secondary" className="text-[10px] h-5 pr-1 gap-1 bg-primary/10 text-primary border-primary/20" onClick={(e) => { e.stopPropagation(); toggleSelection(emp.id); }}>
                {emp.name}<X className="w-3 h-3 hover:text-destructive" />
              </Badge>
            )) : <span className="text-muted-foreground">{placeholder}</span>}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl z-[60]" align="start">
        <div className="flex items-center border-b px-3 h-10 sticky top-0 bg-popover z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" placeholder="Search team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <ScrollArea className="h-60">
          <div className="p-1">
            {filteredEmployees.map((employee) => {
              const isSelected = safeSelectedIds.includes(employee.id);
              return (
                <div key={employee.id} className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent transition-colors", isSelected && "bg-accent/50")} onClick={() => toggleSelection(employee.id)}>
                  <Checkbox checked={isSelected} className="mr-3 pointer-events-none" />
                  <div className="flex flex-col gap-0.5"><span className="font-semibold">{employee.name}</span><span className="text-[10px] text-muted-foreground">{employee.designation}</span></div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default function ProjectsManagement() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToAnalyze, setProjectToAnalyze] = useState<Project | null>(null);
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'modules' | 'tasks' | 'team'>('modules');
  
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [adminFeedback, setAdminFeedback] = useState("");
  
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'module' | 'task' | 'project', title: string, taskCount?: number } | null>(null);
  const [removeEmployeeConfirm, setRemoveEmployeeConfirm] = useState<{ employeeId: string, employeeName: string, parentId: string, type: 'module' | 'task' } | null>(null);

  const [newProject, setNewProject] = useState({ 
    title: '', 
    revenue: 0, 
    status: 'Active',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [newModule, setNewModule] = useState({ title: '', assignedTo: [] as string[], dueDate: format(new Date(), 'yyyy-MM-dd') });
  const [newTask, setNewTask] = useState({ title: '', moduleId: '', assignedTo: [] as string[], dueDate: format(new Date(), 'yyyy-MM-dd') });

  const loadData = () => {
    const auth = Store.getAuth();
    if (auth) {
      setProjects(Store.getProjects().filter(p => p.tenantId === auth.tenantId));
      setEmployees(Store.getUsers().filter(u => u.tenantId === auth.tenantId && u.role === 'EMPLOYEE'));
      setAssignments(Store.getAssignments());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const auth = Store.getAuth();
    if (!auth) return;
    const proj: Project = {
      id: crypto.randomUUID(),
      title: newProject.title,
      revenue: Number(newProject.revenue),
      status: newProject.status as Project['status'],
      tenantId: auth.tenantId,
      startDate: newProject.startDate,
      endDate: newProject.endDate
    };
    Store.saveProject(proj);
    toast({ title: "Project Created" });
    setNewProject({ title: '', revenue: 0, status: 'Active', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') });
    setIsAddOpen(false);
    loadData();
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    Store.saveProject(editingProject);
    toast({ title: "Project Updated" });
    setEditingProject(null);
    loadData();
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const mod: Module = { id: crypto.randomUUID(), title: newModule.title, projectId: selectedProject.id, status: 'Pending', dueDate: newModule.dueDate };
    Store.saveModule(mod);
    Store.syncAssignments(selectedProject.id, mod.id, newModule.assignedTo, 'module');
    toast({ title: "Module Created" });
    setNewModule({ title: '', assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') });
    loadData();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const task: Task = { id: crypto.randomUUID(), title: newTask.title, moduleId: newTask.moduleId, projectId: selectedProject.id, status: 'Pending', dueDate: newTask.dueDate };
    Store.saveTask(task);
    Store.syncAssignments(selectedProject.id, task.id, newTask.assignedTo, 'task');
    toast({ title: "Task Created" });
    setNewTask({ title: '', moduleId: newTask.moduleId, assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') });
    loadData();
  };

  const handleUpdateTeam = (projectId: string, parentId: string, employeeIds: string[], type: 'module' | 'task') => {
    Store.syncAssignments(projectId, parentId, employeeIds, type);
    toast({ title: "Team Updated", description: "Assignments have been synchronized." });
    loadData();
  };

  const handleSendFeedback = () => {
    if (!feedbackTask) return;
    Store.saveTask({ ...feedbackTask, feedback: adminFeedback });
    toast({ title: "Feedback Sent", description: "The employee will see your feedback in their portal." });
    setFeedbackTask(null);
    setAdminFeedback("");
    loadData();
  };

  const handleReopenTask = (task: Task) => {
    Store.saveTask({ ...task, status: 'Working' });
    toast({ title: "Task Re-opened", description: "Status changed back to Working." });
    loadData();
  };

  const handleDeleteModule = (moduleId: string) => {
    const tasksInModule = projectTasks.filter(t => t.moduleId === moduleId);
    Store.deleteModule(moduleId);
    toast({ 
      title: "Module Deleted", 
      description: `Module and ${tasksInModule.length} task(s) removed. Historical work preserved.` 
    });
    setDeleteConfirm(null);
    setExpandedModuleId(null);
    loadData();
  };

  const handleDeleteTask = (taskId: string) => {
    Store.deleteTask(taskId);
    toast({ title: "Task Deleted", description: "Task removed. Historical work preserved." });
    setDeleteConfirm(null);
    setSelectedTaskId(null);
    loadData();
  };

  const handleDeleteProject = (projectId: string) => {
    Store.deleteProject(projectId);
    toast({ title: "Project Deleted", description: "Project removed. Historical work preserved for reports." });
    setDeleteConfirm(null);
    loadData();
  };

  const handleRemoveEmployee = () => {
    if (!removeEmployeeConfirm || !selectedProject) return;
    const { employeeId, parentId, type } = removeEmployeeConfirm;
    
    // Get current assignments and remove this employee
    const currentAssignments = assignments.filter(a => 
      !a.unassignedAt && 
      (type === 'module' ? a.moduleId === parentId : a.taskId === parentId)
    );
    const currentEmployeeIds = currentAssignments.map(a => a.employeeId);
    const updatedEmployeeIds = currentEmployeeIds.filter(id => id !== employeeId);
    
    // Sync assignments (this will set unassignedAt for removed employee)
    Store.syncAssignments(selectedProject.id, parentId, updatedEmployeeIds, type);
    
    toast({ title: "Employee Removed", description: "Work history preserved for financial reports." });
    setRemoveEmployeeConfirm(null);
    loadData();
  };

  const handleUpdateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    Store.saveModule(editingModule);
    toast({ title: "Module Updated" });
    setEditingModule(null);
    loadData();
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    Store.saveTask(editingTask);
    toast({ title: "Task Updated" });
    setEditingTask(null);
    loadData();
  };

  const projectModules = selectedProject ? Store.getModules().filter(m => m.projectId === selectedProject.id) : [];
  const projectTasks = selectedProject ? Store.getTasks().filter(t => t.projectId === selectedProject.id) : [];

  const analysis = useMemo(() => {
    if (!projectToAnalyze) return null;
    return Store.calculateProjectCost(projectToAnalyze.id);
  }, [projectToAnalyze, assignments]);

  const getAssignedEmployees = (parentId: string, type: 'module' | 'task') => {
    const itemAssignments = assignments.filter(a => 
      !a.unassignedAt && 
      (type === 'module' ? a.moduleId === parentId : a.taskId === parentId)
    );
    return itemAssignments.map(a => employees.find(e => e.id === a.employeeId)).filter(e => !!e) as User[];
  };

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold font-headline">Portfolio Management</h1><p className="text-muted-foreground">Track project revenue, scheduling, and delivery milestones.</p></div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setNewProject({ title: '', revenue: 0, status: 'Active', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') });
          }
        }}>
          <DialogTrigger asChild><Button className="bg-primary gap-2 h-11 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto"><Plus className="w-4 h-4" /> New Project</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader><DialogTitle>Launch New Project</DialogTitle></DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <form onSubmit={handleAddProject} className="space-y-4 py-4">
                <div className="space-y-2"><Label>Project Title</Label><Input required value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Date</Label><Input type="date" required value={newProject.startDate} onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} /></div>
                  <div className="space-y-2"><Label>End Date</Label><Input type="date" required value={newProject.endDate} onChange={(e) => setNewProject({...newProject, endDate: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Projected Revenue (₹)</Label><Input required type="number" value={newProject.revenue} onChange={(e) => setNewProject({...newProject, revenue: Number(e.target.value)})} /></div>
                <DialogFooter className="pt-4"><Button type="submit" className="w-full bg-primary">Create Project</Button></DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow><TableHead>Project Details</TableHead><TableHead>Timeline</TableHead><TableHead>Value (₹)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => (
              <TableRow key={proj.id} className="hover:bg-muted/30">
                <TableCell className="font-bold">{proj.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{proj.startDate && proj.endDate ? `${format(new Date(proj.startDate), 'MMM dd')} - ${format(new Date(proj.endDate), 'MMM dd, yyyy')}` : 'N/A'}</TableCell>
                <TableCell className="font-mono font-bold text-primary">₹{proj.revenue.toLocaleString()}</TableCell>
                <TableCell><Badge variant={proj.status === 'Active' ? 'default' : 'secondary'}>{proj.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingProject(proj)}><Pencil className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Project</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setProjectToAnalyze(proj)}><Info className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Financial Analysis</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProject(proj); setIsHierarchyOpen(true); }}><Layout className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Manage Hierarchy</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        const moduleCount = Store.getModules().filter(m => m.projectId === proj.id).length;
                        const taskCount = Store.getTasks().filter(t => t.projectId === proj.id).length;
                        setDeleteConfirm({ id: proj.id, type: 'project', title: proj.title, taskCount: moduleCount + taskCount });
                      }}><Trash2 className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Project</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {projects.map((proj) => (
          <Card key={proj.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start"><CardTitle className="text-lg">{proj.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingProject(proj)}>Edit Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setProjectToAnalyze(proj)}>Financial Analysis</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedProject(proj); setIsHierarchyOpen(true); }}>Hierarchy</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => {
                      const moduleCount = Store.getModules().filter(m => m.projectId === proj.id).length;
                      const taskCount = Store.getTasks().filter(t => t.projectId === proj.id).length;
                      setDeleteConfirm({ id: proj.id, type: 'project', title: proj.title, taskCount: moduleCount + taskCount });
                    }}>Delete Project</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent><div className="flex justify-between items-end"><div><p className="text-xs text-muted-foreground">{proj.startDate ? format(new Date(proj.startDate), 'MMM dd') : 'N/A'}</p><p className="text-lg font-mono font-bold text-primary">₹{proj.revenue.toLocaleString()}</p></div><Badge>{proj.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!projectToAnalyze} onOpenChange={(open) => !open && setProjectToAnalyze(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Financial Yield Analysis</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            {projectToAnalyze && analysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-primary/5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p><p className="text-xl font-bold text-primary">₹{projectToAnalyze.revenue.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl border bg-destructive/5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Calculated Cost</p><p className="text-xl font-bold text-destructive">₹{Math.round(analysis.totalCost).toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl border bg-green-500/5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Net Margin</p><p className="text-xl font-bold text-green-500">₹{Math.round(projectToAnalyze.revenue - analysis.totalCost).toLocaleString()}</p></div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">Employee Burn Breakdown</h4>
                  <div className="border rounded-xl overflow-x-auto">
                    <Table className="min-w-[400px]">
                      <TableHeader className="bg-muted/30"><TableRow><TableHead>Employee</TableHead><TableHead>Days</TableHead><TableHead className="text-right">Calculated Cost</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {analysis.breakdown.map(item => (
                          <TableRow key={item.employee.id}><TableCell className="text-sm">{item.employee.name}</TableCell><TableCell className="text-sm">{item.days}d</TableCell><TableCell className="text-right text-sm font-mono font-bold">₹{Math.round(item.cost).toLocaleString()}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isHierarchyOpen} onOpenChange={(open) => { 
        setIsHierarchyOpen(open); 
        if (!open) { 
          setExpandedModuleId(null); 
          setSelectedTaskId(null); 
          setMobileTab('modules'); 
          setNewModule({ title: '', assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') });
          setNewTask({ title: '', moduleId: '', assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') });
        } 
      }}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-4 md:p-6 border-b bg-muted/30 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl"><Target className="w-5 h-5 md:w-6 md:h-6 text-primary" /> {selectedProject?.title} Hierarchy</DialogTitle>
          </DialogHeader>
          
          {/* Desktop 3-Panel Layout */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Left Panel - Module Management */}
            <aside className="w-80 border-r bg-muted/10 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Layout className="w-3 h-3" /> New Module</h4>
                    <form onSubmit={handleAddModule} className="space-y-3">
                      <div className="space-y-1"><Label className="text-xs">Title</Label><Input required value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} className="h-8" /></div>
                      <div className="space-y-1"><Label className="text-xs">Deadline</Label><Input type="date" required value={newModule.dueDate} onChange={(e) => setNewModule({...newModule, dueDate: e.target.value})} className="h-8" /></div>
                      <div className="space-y-1"><Label className="text-xs">Team</Label><MultiSelectEmployee employees={employees} selectedIds={newModule.assignedTo} onChange={(ids) => setNewModule({...newModule, assignedTo: ids})} /></div>
                      <Button type="submit" size="sm" className="w-full">Add Module</Button>
                    </form>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Modules List</h4>
                    {projectModules.map(module => {
                      const assigned = getAssignedEmployees(module.id, 'module');
                      const isExpanded = expandedModuleId === module.id;
                      return (
                        <div key={module.id} className={cn("border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50", isExpanded && "border-primary bg-primary/5")}>
                          <div className="flex items-start justify-between gap-2" onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <ChevronsUpDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                                <span className="text-sm font-bold truncate">{module.title}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{assigned.length} team members</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant="outline" className="text-[9px]">{module.dueDate ? format(new Date(module.dueDate), 'MMM dd') : 'N/A'}</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingModule(module); }}><Pencil className="w-3 h-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: module.id, type: 'module', title: module.title }); }}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {projectModules.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">No modules yet</p>}
                  </div>
                </div>
              </ScrollArea>
            </aside>

            {/* Middle Panel - Tasks for Selected Module */}
            <main className="flex-1 border-r bg-background overflow-hidden flex flex-col">
              {expandedModuleId ? (
                <>
                  <div className="p-4 border-b bg-muted/20">
                    <h4 className="text-sm font-bold flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Tasks in {projectModules.find(m => m.id === expandedModuleId)?.title}</h4>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/10">
                        <h5 className="text-xs font-bold uppercase text-muted-foreground mb-3">Add New Task</h5>
                        <form onSubmit={(e) => { e.preventDefault(); if (expandedModuleId) { const task: Task = { id: crypto.randomUUID(), title: newTask.title, moduleId: expandedModuleId, projectId: selectedProject!.id, status: 'Pending', dueDate: newTask.dueDate }; Store.saveTask(task); Store.syncAssignments(selectedProject!.id, task.id, newTask.assignedTo, 'task'); toast({ title: "Task Created" }); setNewTask({ title: '', moduleId: expandedModuleId, assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') }); loadData(); } }} className="space-y-3">
                          <div className="space-y-1"><Label className="text-xs">Title</Label><Input required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="h-8" /></div>
                          <div className="space-y-1"><Label className="text-xs">Deadline</Label><Input type="date" required value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="h-8" /></div>
                          <div className="space-y-1"><Label className="text-xs">Workers</Label><MultiSelectEmployee employees={employees} selectedIds={newTask.assignedTo} onChange={(ids) => setNewTask({...newTask, assignedTo: ids})} /></div>
                          <Button type="submit" size="sm" variant="secondary" className="w-full">Add Task</Button>
                        </form>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {projectTasks.filter(t => t.moduleId === expandedModuleId).map(task => {
                          const taskAssigned = getAssignedEmployees(task.id, 'task');
                          const isSelected = selectedTaskId === task.id;
                          return (
                            <div key={task.id} className={cn("border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50", isSelected && "border-primary bg-primary/5")}>
                              <div className="flex items-start justify-between gap-2" onClick={() => setSelectedTaskId(isSelected ? null : task.id)}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckSquare className="w-3 h-3 text-accent" />
                                    <span className="text-sm font-semibold truncate">{task.title}</span>
                                    <Badge className={cn("text-[9px] h-4", task.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500')}>{task.status}</Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{taskAssigned.length} workers assigned</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Badge variant="outline" className="text-[9px]">{task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'N/A'}</Badge>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}><Pencil className="w-3 h-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: task.id, type: 'task', title: task.title }); }}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {projectTasks.filter(t => t.moduleId === expandedModuleId).length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">No tasks yet</p>}
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Layout className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm">Select a module to view tasks</p>
                  </div>
                </div>
              )}
            </main>

            {/* Right Panel - Assignment Details */}
            <aside className="w-80 bg-muted/10 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {selectedTaskId ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2"><Users className="w-3 h-3" /> Task Assignment</h4>
                      <div className="space-y-3">
                        {(() => {
                          const task = projectTasks.find(t => t.id === selectedTaskId);
                          const taskAssigned = getAssignedEmployees(selectedTaskId, 'task');
                          return (
                            <>
                              <div className="border rounded-lg p-3 bg-card">
                                <p className="text-xs font-bold mb-2">{task?.title}</p>
                                <div className="space-y-2">
                                  <Label className="text-xs">Assigned Workers</Label>
                                  <MultiSelectEmployee 
                                    employees={employees} 
                                    selectedIds={taskAssigned.map(e => e.id)} 
                                    onChange={(ids) => handleUpdateTeam(selectedProject!.id, selectedTaskId, ids, 'task')}
                                  />
                                </div>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <p className="text-xs font-bold">Team Members ({taskAssigned.length})</p>
                                {taskAssigned.map(emp => (
                                  <div key={emp.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card group">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{emp.name.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold truncate">{emp.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                      onClick={() => setRemoveEmployeeConfirm({ employeeId: emp.id, employeeName: emp.name, parentId: selectedTaskId, type: 'task' })}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                {taskAssigned.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">No workers assigned</p>}
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <p className="text-xs font-bold">Actions</p>
                                {task?.status === 'Completed' && (
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleReopenTask(task)}>
                                    <History className="w-3 h-3 mr-2" /> Re-open Task
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setFeedbackTask(task!)}>
                                  <MessageSquare className="w-3 h-3 mr-2" /> View Progress & Feedback
                                </Button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : expandedModuleId ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3 flex items-center gap-2"><Users className="w-3 h-3" /> Module Assignment</h4>
                      <div className="space-y-3">
                        {(() => {
                          const module = projectModules.find(m => m.id === expandedModuleId);
                          const assigned = getAssignedEmployees(expandedModuleId, 'module');
                          return (
                            <>
                              <div className="border rounded-lg p-3 bg-card">
                                <p className="text-xs font-bold mb-2">{module?.title}</p>
                                <div className="space-y-2">
                                  <Label className="text-xs">Assigned Team</Label>
                                  <MultiSelectEmployee 
                                    employees={employees} 
                                    selectedIds={assigned.map(e => e.id)} 
                                    onChange={(ids) => handleUpdateTeam(selectedProject!.id, expandedModuleId, ids, 'module')}
                                  />
                                </div>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <p className="text-xs font-bold">Team Members ({assigned.length})</p>
                                {assigned.map(emp => (
                                  <div key={emp.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card group">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{emp.name.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold truncate">{emp.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                      onClick={() => setRemoveEmployeeConfirm({ employeeId: emp.id, employeeName: emp.name, parentId: expandedModuleId, type: 'module' })}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                {assigned.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">No team assigned</p>}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
                    <div className="text-center space-y-2">
                      <Users className="w-12 h-12 mx-auto opacity-20" />
                      <p className="text-sm">Select a module or task<br />to view assignments</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </aside>
          </div>
          
          {/* Mobile Tabs Layout */}
          <div className="md:hidden flex-1 overflow-hidden flex flex-col">
            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)} className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-3 rounded-none">
                <TabsTrigger value="modules" className="text-xs">Modules</TabsTrigger>
                <TabsTrigger value="tasks" disabled={!expandedModuleId} className="text-xs">Tasks</TabsTrigger>
                <TabsTrigger value="team" disabled={!expandedModuleId && !selectedTaskId} className="text-xs">Team</TabsTrigger>
              </TabsList>
              
              <TabsContent value="modules" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="space-y-3 border rounded-lg p-3 bg-muted/10">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground">New Module</h4>
                      <form onSubmit={handleAddModule} className="space-y-2">
                        <Input required placeholder="Module Title" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} className="h-9" />
                        <Input type="date" required value={newModule.dueDate} onChange={(e) => setNewModule({...newModule, dueDate: e.target.value})} className="h-9" />
                        <MultiSelectEmployee employees={employees} selectedIds={newModule.assignedTo} onChange={(ids) => setNewModule({...newModule, assignedTo: ids})} />
                        <Button type="submit" size="sm" className="w-full">Add Module</Button>
                      </form>
                    </div>
                    <div className="space-y-2">
                      {projectModules.map(module => {
                        const assigned = getAssignedEmployees(module.id, 'module');
                        return (
                          <div key={module.id} className="border rounded-lg p-3 bg-card" onClick={() => { setExpandedModuleId(module.id); setMobileTab('tasks'); }}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{module.title}</p>
                                <p className="text-[10px] text-muted-foreground">{assigned.length} members • {module.dueDate ? format(new Date(module.dueDate), 'MMM dd') : 'N/A'}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingModule(module); }}><Pencil className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: module.id, type: 'module', title: module.title }); }}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {projectModules.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-8">No modules yet</p>}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 p-4">
                  {expandedModuleId && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3 bg-muted/10">
                        <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Add Task</h5>
                        <form onSubmit={(e) => { e.preventDefault(); if (expandedModuleId) { const task: Task = { id: crypto.randomUUID(), title: newTask.title, moduleId: expandedModuleId, projectId: selectedProject!.id, status: 'Pending', dueDate: newTask.dueDate }; Store.saveTask(task); Store.syncAssignments(selectedProject!.id, task.id, newTask.assignedTo, 'task'); toast({ title: "Task Created" }); setNewTask({ title: '', moduleId: expandedModuleId, assignedTo: [], dueDate: format(new Date(), 'yyyy-MM-dd') }); loadData(); } }} className="space-y-2">
                          <Input required placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="h-9" />
                          <Input type="date" required value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="h-9" />
                          <MultiSelectEmployee employees={employees} selectedIds={newTask.assignedTo} onChange={(ids) => setNewTask({...newTask, assignedTo: ids})} />
                          <Button type="submit" size="sm" className="w-full">Add Task</Button>
                        </form>
                      </div>
                      <div className="space-y-2">
                        {projectTasks.filter(t => t.moduleId === expandedModuleId).map(task => {
                          const taskAssigned = getAssignedEmployees(task.id, 'task');
                          return (
                            <div key={task.id} className="border rounded-lg p-3 bg-card" onClick={() => { setSelectedTaskId(task.id); setMobileTab('team'); }}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold truncate">{task.title}</p>
                                    <Badge className={cn("text-[9px] h-4", task.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500')}>{task.status}</Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{taskAssigned.length} workers • {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'N/A'}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}><Pencil className="w-3 h-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: task.id, type: 'task', title: task.title }); }}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {projectTasks.filter(t => t.moduleId === expandedModuleId).length === 0 && <p className="text-xs text-muted-foreground italic text-center py-8">No tasks yet</p>}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="team" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 p-4">
                  {selectedTaskId ? (
                    <div className="space-y-4">
                      {(() => {
                        const task = projectTasks.find(t => t.id === selectedTaskId);
                        const taskAssigned = getAssignedEmployees(selectedTaskId, 'task');
                        return (
                          <>
                            <div className="border rounded-lg p-3 bg-card">
                              <p className="text-xs font-bold mb-2">{task?.title}</p>
                              <MultiSelectEmployee employees={employees} selectedIds={taskAssigned.map(e => e.id)} onChange={(ids) => handleUpdateTeam(selectedProject!.id, selectedTaskId, ids, 'task')} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-bold">Team ({taskAssigned.length})</p>
                              {taskAssigned.map(emp => (
                                <div key={emp.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{emp.name.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{emp.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setRemoveEmployeeConfirm({ employeeId: emp.id, employeeName: emp.name, parentId: selectedTaskId, type: 'task' })}><X className="w-3 h-3" /></Button>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              {task?.status === 'Completed' && <Button variant="outline" size="sm" className="w-full" onClick={() => handleReopenTask(task)}><History className="w-3 h-3 mr-2" />Re-open</Button>}
                              <Button variant="outline" size="sm" className="w-full" onClick={() => setFeedbackTask(task!)}><MessageSquare className="w-3 h-3 mr-2" />Feedback</Button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : expandedModuleId ? (
                    <div className="space-y-4">
                      {(() => {
                        const module = projectModules.find(m => m.id === expandedModuleId);
                        const assigned = getAssignedEmployees(expandedModuleId, 'module');
                        return (
                          <>
                            <div className="border rounded-lg p-3 bg-card">
                              <p className="text-xs font-bold mb-2">{module?.title}</p>
                              <MultiSelectEmployee employees={employees} selectedIds={assigned.map(e => e.id)} onChange={(ids) => handleUpdateTeam(selectedProject!.id, expandedModuleId, ids, 'module')} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-bold">Team ({assigned.length})</p>
                              {assigned.map(emp => (
                                <div key={emp.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{emp.name.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{emp.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setRemoveEmployeeConfirm({ employeeId: emp.id, employeeName: emp.name, parentId: expandedModuleId, type: 'module' })}><X className="w-3 h-3" /></Button>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!feedbackTask} onOpenChange={(open) => {
        if (!open) {
          setFeedbackTask(null);
          setAdminFeedback("");
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle>Task Collaboration</DialogTitle>
            <DialogDescription>Review progress updates and provide feedback to the employee.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            {feedbackTask && (
              <div className="space-y-6 pt-2">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Employee's Progress Description</p>
                    <p className="text-sm italic">{feedbackTask.employeeNote || "No progress note provided yet."}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2"><Send className="w-3 h-3" /> My Feedback</Label>
                    <Textarea 
                      placeholder="Provide guidance or requests for this task..."
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="p-6 border-t shrink-0">
            <Button variant="outline" onClick={() => setFeedbackTask(null)}>Close</Button>
            <Button onClick={handleSendFeedback} disabled={!adminFeedback.trim()}>Send Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle>Edit Project Metadata</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            {editingProject && (
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input required value={editingProject.title} onChange={(e) => setEditingProject({...editingProject, title: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Date</Label><Input type="date" required value={editingProject.startDate || ''} onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})} /></div>
                  <div className="space-y-2"><Label>End Date</Label><Input type="date" required value={editingProject.endDate || ''} onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Revenue (₹)</Label><Input required type="number" value={editingProject.revenue} onChange={(e) => setEditingProject({...editingProject, revenue: Number(e.target.value)})} /></div>
              </form>
            )}
          </ScrollArea>
          <DialogFooter className="p-6 border-t shrink-0">
            <Button type="submit" onClick={(e) => { e.preventDefault(); handleUpdateProject(e as any); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Module</DialogTitle></DialogHeader>
          {editingModule && (
            <form onSubmit={handleUpdateModule} className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={editingModule.title} onChange={(e) => setEditingModule({...editingModule, title: e.target.value})} /></div>
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" required value={editingModule.dueDate || ''} onChange={(e) => setEditingModule({...editingModule, dueDate: e.target.value})} /></div>
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {editingTask && (
            <form onSubmit={handleUpdateTask} className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} /></div>
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" required value={editingTask.dueDate || ''} onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})} /></div>
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm?.type === 'module' ? 'Module' : deleteConfirm?.type === 'task' ? 'Task' : 'Project'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'module' 
                ? `This will permanently delete "${deleteConfirm.title}" and all its tasks. Employee work history will be preserved for financial reports.`
                : deleteConfirm?.type === 'task'
                ? `This will permanently delete "${deleteConfirm?.title}". Employee work history will be preserved for financial reports.`
                : `This will permanently delete "${deleteConfirm?.title}" including ${deleteConfirm?.taskCount || 0} module(s) and task(s). Employee work history will be preserved for financial reports.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm?.type === 'module') {
                  handleDeleteModule(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'task') {
                  handleDeleteTask(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'project') {
                  handleDeleteProject(deleteConfirm.id);
                }
              }} 
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!removeEmployeeConfirm} onOpenChange={(open) => !open && setRemoveEmployeeConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {removeEmployeeConfirm?.employeeName} from this {removeEmployeeConfirm?.type}? Their work history will be preserved for financial reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveEmployee} className="bg-destructive">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
