"use client";

import { useEffect, useState, useMemo } from 'react';
import { Store } from '@/lib/store';
import { User, Module, Task, Project } from '@/lib/types';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Briefcase, 
  Layout, 
  CheckSquare, 
  XCircle, 
  Pencil, 
  Target, 
  Search, 
  UserX,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EmployeesManagement() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewAssignmentsOpen, setIsViewAssignmentsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [unassignConfirm, setUnassignConfirm] = useState<{ id: string, type: 'module' | 'task' } | null>(null);
  
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    monthlySalary: '' as number | string, 
    designation: '', 
    joiningDate: format(new Date(), 'yyyy-MM-dd') 
  });

  const [editEmployee, setEditEmployee] = useState<Omit<Partial<User>, 'monthlySalary'> & { newPassword?: string, confirmNewPassword?: string, monthlySalary?: number | string }>({});

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  const [employeeHierarchy, setEmployeeHierarchy] = useState<{
    project: Project;
    modules: {
      module: Module;
      tasks: Task[];
    }[];
  }[]>([]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  const newPasswordsMatch = newEmployee.password === newEmployee.confirmPassword;
  const hasNewConfirmValue = newEmployee.confirmPassword.length > 0;

  const editPasswordsMatch = editEmployee.newPassword === editEmployee.confirmNewPassword;
  const hasEditConfirmValue = (editEmployee.confirmNewPassword?.length || 0) > 0;
  const hasEditPasswordValue = (editEmployee.newPassword?.length || 0) > 0;

  const newPasswordValid = newEmployee.password.length === 0 || newEmployee.password.length >= 6;
  const editPasswordValid = !hasEditPasswordValue || editEmployee.newPassword!.length >= 6;

  const loadData = () => {
    const auth = Store.getAuth();
    if (auth) {
      const all = Store.getUsers();
      setEmployees(all.filter(u => u.tenantId === auth.tenantId && u.role === 'EMPLOYEE'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const auth = Store.getAuth();
    if (!auth) return;

    if (!newPasswordsMatch) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The passwords do not match." });
      return;
    }

    if (newEmployee.password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters long." });
      return;
    }

    if (!newEmployee.monthlySalary || Number(newEmployee.monthlySalary) <= 0) {
      toast({ variant: "destructive", title: "Invalid Salary", description: "Employee cannot be created with ₹0 or empty salary." });
      return;
    }

    const employee: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployee.name,
      email: newEmployee.email,
      password: newEmployee.password,
      role: 'EMPLOYEE',
      tenantId: auth.tenantId,
      monthlySalary: Number(newEmployee.monthlySalary),
      designation: newEmployee.designation,
      joiningDate: newEmployee.joiningDate,
    };

    Store.saveUser(employee);
    toast({ title: "Employee Added", description: `${employee.name} has been created.` });
    setNewEmployee({ 
      name: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      monthlySalary: '', 
      designation: '', 
      joiningDate: format(new Date(), 'yyyy-MM-dd') 
    });
    setIsAddOpen(false);
    loadData();
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee.id) return;

    if ((hasEditPasswordValue || hasEditConfirmValue) && !editPasswordsMatch) {
      toast({ variant: "destructive", title: "Update Failed", description: "New passwords do not match." });
      return;
    }

    if (hasEditPasswordValue && editEmployee.newPassword!.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "New password must be at least 6 characters long." });
      return;
    }

    if (editEmployee.monthlySalary === '' || Number(editEmployee.monthlySalary) <= 0) {
      toast({ variant: "destructive", title: "Invalid Salary", description: "Employee salary cannot be ₹0 or empty." });
      return;
    }

    const { newPassword, confirmNewPassword, ...dataToSave } = editEmployee;
    
    if (hasEditPasswordValue && newPassword) {
      dataToSave.password = newPassword;
    }

    dataToSave.monthlySalary = Number(dataToSave.monthlySalary);

    Store.saveUser(dataToSave as User);
    
    toast({ title: "Profile Updated", description: "Employee details have been saved." });
    setIsEditOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    Store.deleteUser(id);
    toast({ title: "Employee Removed", description: "The employee record was deleted." });
    loadData();
  };

  const handleViewAssignments = (emp: User) => {
    setSelectedEmployee(emp);
    
    const activeAssignments = Store.getAssignments().filter(a => a.employeeId === emp.id && !a.unassignedAt);
    const allProjects = Store.getProjects();
    const allModules = Store.getModules();
    const allTasks = Store.getTasks();

    const hierarchy = allProjects
      .map(proj => {
        const projAssignments = activeAssignments.filter(a => a.projectId === proj.id);
        
        const moduleIds = projAssignments.filter(a => a.moduleId).map(a => a.moduleId);
        const taskIds = projAssignments.filter(a => a.taskId).map(a => a.taskId);

        const modules = allModules.filter(m => moduleIds.includes(m.id));
        const tasks = allTasks.filter(t => taskIds.includes(t.id));

        const moduleHierarchy = modules.map(m => ({
          module: m,
          tasks: tasks.filter(t => t.moduleId === m.id)
        }));

        const otherModulesWithTasks = Array.from(new Set(tasks.map(t => t.moduleId)))
          .filter(modId => !modules.find(m => m.id === modId))
          .map(modId => {
            const mod = allModules.find(m => m.id === modId);
            return mod ? {
              module: mod,
              tasks: tasks.filter(t => t.moduleId === modId)
            } : null;
          })
          .filter(item => item !== null) as any[];

        const finalModules = [...moduleHierarchy, ...otherModulesWithTasks];

        if (finalModules.length > 0) {
          return { project: proj, modules: finalModules };
        }
        return null;
      })
      .filter(item => item !== null) as any[];

    setEmployeeHierarchy(hierarchy);
    setIsViewAssignmentsOpen(true);
  };

  const handleOpenEdit = (emp: User) => {
    setEditEmployee({ ...emp, newPassword: '', confirmNewPassword: '' });
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setIsEditOpen(true);
  };

  const unassign = (parentId: string, type: 'module' | 'task') => {
    if (!selectedEmployee) return;
    const assigns = Store.getAssignments();
    const target = assigns.find(a => 
      !a.unassignedAt &&
      a.employeeId === selectedEmployee.id && 
      (type === 'module' ? a.moduleId === parentId : a.taskId === parentId)
    );
    if (target) {
      Store.unassignEmployeeFromTask(target.id);
      toast({ title: "Unassigned", description: `Employee removed from ${type}. Contributions are preserved.` });
      handleViewAssignments(selectedEmployee);
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Employee Directory</h1>
          <p className="text-muted-foreground">Manage team profiles, roles, and project assignments.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-card/50 border-border/50"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setNewEmployee({ 
                name: '', email: '', password: '', confirmPassword: '',
                monthlySalary: '', designation: '', joiningDate: format(new Date(), 'yyyy-MM-dd') 
              });
              setShowNewPassword(false);
              setShowNewConfirmPassword(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary gap-2 h-11 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Hire New Employee</DialogTitle>
                <DialogDescription>Fill in the professional details for the new staff member.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg flex items-start gap-3 mt-2 text-sm">
                  <Info className="w-5 h-5 mt-0.5 shrink-0" />
                  <p><strong>Note:</strong> This email and password will be used for employee login, so please remember them.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input required value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Designation</Label><Input required value={newEmployee.designation} onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Work Email</Label><Input required type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input required type={showNewPassword ? "text" : "password"} className={cn("pr-10", !newPasswordValid && "border-destructive focus-visible:ring-destructive")} value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {!newPasswordValid && (
                      <div className="flex items-center gap-2 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 pt-1">
                        <AlertCircle className="w-3.5 h-3.5" /><span>Password must be at least 6 characters.</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Input required type={showNewConfirmPassword ? "text" : "password"} className={cn(
                        "transition-colors pr-10",
                        hasNewConfirmValue && !newPasswordsMatch && "border-destructive focus-visible:ring-destructive",
                        hasNewConfirmValue && newPasswordsMatch && "border-green-500 focus-visible:ring-green-500"
                      )} value={newEmployee.confirmPassword} onChange={(e) => setNewEmployee({...newEmployee, confirmPassword: e.target.value})} />
                      <button type="button" onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{showNewConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {hasNewConfirmValue && (
                      <div className={cn(
                        "flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1 pt-1",
                        newPasswordsMatch ? "text-green-500" : "text-destructive"
                      )}>
                        {newPasswordsMatch ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /><span>Passwords match!</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5" /><span>Passwords do not match yet.</span></>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Monthly Salary (₹)</Label><Input required type="number" value={newEmployee.monthlySalary} onChange={(e) => setNewEmployee({...newEmployee, monthlySalary: e.target.value === '' ? '' : Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label>Joining Date</Label><Input required type="date" value={newEmployee.joiningDate} onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})} /></div>
                </div>
                <DialogFooter className="pt-4"><Button type="submit" className="w-full bg-primary" disabled={(hasNewConfirmValue && !newPasswordsMatch) || !newPasswordValid}>Create Account</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[280px]">Employee</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Monthly Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={`https://picsum.photos/seed/${emp.id}/40/40`} />
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col"><span className="font-bold">{emp.name}</span><span className="text-xs text-muted-foreground">{emp.email}</span></div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{emp.designation || 'Staff'}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{emp.joiningDate ? format(new Date(emp.joiningDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                <TableCell className="font-mono text-primary font-semibold">₹{emp.monthlySalary?.toLocaleString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary" onClick={() => handleViewAssignments(emp)}><Briefcase className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>View Assignments</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(emp)}><Pencil className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Profile</TooltipContent>
                  </Tooltip>
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Delete Employee</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Employee?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the employee and their active assignments.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(emp.id)} className="bg-destructive">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredEmployees.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <UserX className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">No team members found</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="relative overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={`https://picsum.photos/seed/${emp.id}/48/48`} />
                    <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div><CardTitle className="text-lg">{emp.name}</CardTitle><Badge variant="outline" className="mt-1 bg-primary/5 text-primary border-primary/20 text-[10px]">{emp.designation || 'Staff'}</Badge></div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewAssignments(emp)}>View Assignments</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(emp)}>Edit Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(emp.id)}>Delete Account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Joined</p><p className="text-sm font-medium">{emp.joiningDate ? format(new Date(emp.joiningDate), 'MMM dd, yyyy') : 'N/A'}</p></div>
                <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Monthly Salary</p><p className="text-sm font-mono font-bold text-primary">₹{emp.monthlySalary?.toLocaleString()}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isViewAssignmentsOpen} onOpenChange={setIsViewAssignmentsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 border-b border-border bg-muted/30">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Active Assignments: {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>Review and manage current workload. Historical work is preserved for reports.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] p-6">
            <div className="space-y-8 pr-4">
              {employeeHierarchy.length > 0 ? employeeHierarchy.map(({ project, modules }) => (
                <div key={project.id} className="w-full bg-card/40 border rounded-xl shadow-sm overflow-auto p-8 relative min-h-[500px]">
                  <div className="min-w-max mx-auto flex flex-col items-center">
                    
                    {/* LEVEL 1: PROJECT */}
                    <Card className="w-64 shrink-0 border-primary/40 shadow-lg relative z-10 bg-card">
                      <CardHeader className="p-4 text-center">
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px]" variant="secondary">{project.status}</Badge>
                        <CardTitle className="text-base font-bold flex flex-col items-center gap-2 mt-2">
                          <Target className="w-6 h-6 text-primary shrink-0" />
                          <span className="line-clamp-2">{project.title}</span>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* Line from Project to Modules */}
                    {modules.length > 0 && <div className="w-[2px] h-10 bg-border shrink-0"></div>}

                    {/* LEVEL 2: MODULES */}
                    {modules.length > 0 && (
                      <div className="flex items-start justify-center relative">
                        {modules.map(({ module, tasks }, mIdx) => {
                          const mIsFirst = mIdx === 0;
                          const mIsLast = mIdx === modules.length - 1;
                          const mIsOnly = modules.length === 1;

                          return (
                            <div key={module.id} className="flex flex-col items-center relative px-4 sm:px-6">
                              {/* Horizontal connecting line */}
                              {!mIsOnly && (
                                <div className={cn(
                                  "absolute top-0 h-[2px] bg-border",
                                  mIsFirst ? "left-1/2 right-0" : 
                                  mIsLast ? "left-0 right-1/2" : 
                                  "left-0 right-0"
                                )}></div>
                              )}
                              {/* Vertical line to card */}
                              <div className="absolute top-0 left-1/2 w-[2px] h-10 bg-border -translate-x-1/2"></div>
                              
                              {/* Module Card */}
                              <div className="mt-10 shrink-0">
                                <Card className="w-48 shrink-0 border-accent/30 shadow-sm relative z-10 bg-background hover:border-accent transition-colors">
                                  <CardContent className="p-4 relative flex flex-col items-center text-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="absolute top-1 right-1 h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0" 
                                          onClick={() => setUnassignConfirm({ id: module.id, type: 'module' })}
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Unassign Module</TooltipContent>
                                    </Tooltip>
                                    <Layout className="w-6 h-6 text-accent mb-2" />
                                    <span className="font-semibold text-sm line-clamp-2 w-full">{module.title}</span>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Line from Module to Tasks */}
                              {tasks.length > 0 && <div className="w-[2px] h-10 bg-border shrink-0"></div>}

                              {tasks.length === 0 && (
                                  <div className="text-center text-muted-foreground flex flex-col items-center mt-2 opacity-50 shrink-0">
                                    <div className="w-[2px] h-6 bg-border border-dashed mb-1"></div>
                                    <span className="text-[10px] italic">No tasks</span>
                                  </div>
                              )}

                              {/* LEVEL 3: TASKS */}
                              {tasks.length > 0 && (
                                <div className="flex items-start justify-center relative">
                                  {tasks.map((task, tIdx) => {
                                    const tIsFirst = tIdx === 0;
                                    const tIsLast = tIdx === tasks.length - 1;
                                    const tIsOnly = tasks.length === 1;

                                    return (
                                      <div key={task.id} className="flex flex-col items-center relative px-2 sm:px-3">
                                        {!tIsOnly && (
                                          <div className={cn(
                                            "absolute top-0 h-[2px] bg-border",
                                            tIsFirst ? "left-1/2 right-0" : 
                                            tIsLast ? "left-0 right-1/2" : 
                                            "left-0 right-0"
                                          )}></div>
                                        )}
                                        <div className="absolute top-0 left-1/2 w-[2px] h-10 bg-border -translate-x-1/2"></div>
                                        
                                        <div className="mt-10 shrink-0">
                                          <div className="w-36 bg-card border hover:border-primary/50 transition-colors rounded-xl shadow-sm relative z-10 p-3 flex flex-col items-center text-center">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="absolute top-1 right-1 h-5 w-5 text-destructive hover:bg-destructive/10 shrink-0" 
                                                  onClick={() => setUnassignConfirm({ id: task.id, type: 'task' })}
                                                >
                                                  <XCircle className="w-3.5 h-3.5" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Unassign Task</TooltipContent>
                                            </Tooltip>
                                            <CheckSquare className="w-5 h-5 text-muted-foreground mb-1 mt-1" />
                                            <span className="font-medium text-[11px] line-clamp-3 w-full">{task.title}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )) : <p className="text-center py-20 text-muted-foreground">No active assignments found.</p>}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!unassignConfirm} onOpenChange={(open) => !open && setUnassignConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This employee will no longer be assigned to this {unassignConfirm?.type}. 
              However, their work contributions up to this point will still be reflected in financial reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (unassignConfirm) {
                  unassign(unassignConfirm.id, unassignConfirm.type);
                  setUnassignConfirm(null);
                }
              }} 
              className="bg-destructive"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setShowEditPassword(false);
          setShowEditConfirmPassword(false);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Employee Profile</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input required value={editEmployee.name || ''} onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Designation</Label><Input required value={editEmployee.designation || ''} onChange={(e) => setEditEmployee({...editEmployee, designation: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Monthly Salary (₹)</Label><Input required type="number" value={editEmployee.monthlySalary ?? ''} onChange={(e) => setEditEmployee({...editEmployee, monthlySalary: e.target.value === '' ? '' : Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label>Joining Date</Label><Input required type="date" value={editEmployee.joiningDate || ''} onChange={(e) => setEditEmployee({...editEmployee, joiningDate: e.target.value})} /></div>
            </div>
            
            <div className="space-y-4 pt-2 border-t">
              <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground flex gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Leave passwords blank if you don't want to change the current login password.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showEditPassword ? "text" : "password"} placeholder="••••••••" className={cn("pr-10", !editPasswordValid && "border-destructive focus-visible:ring-destructive")} value={editEmployee.newPassword || ''} onChange={(e) => setEditEmployee({...editEmployee, newPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {!editPasswordValid && (
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" /><span>Password must be at least 6 characters.</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input type={showEditConfirmPassword ? "text" : "password"} placeholder="••••••••" className={cn(
                        "transition-colors pr-10",
                        hasEditConfirmValue && !editPasswordsMatch && "border-destructive focus-visible:ring-destructive",
                        hasEditConfirmValue && editPasswordsMatch && "border-green-500 focus-visible:ring-green-500"
                      )} value={editEmployee.confirmNewPassword || ''} onChange={(e) => setEditEmployee({...editEmployee, confirmNewPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{showEditConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {hasEditConfirmValue && (
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1 pt-1",
                      editPasswordsMatch ? "text-green-500" : "text-destructive"
                    )}>
                      {editPasswordsMatch ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>Passwords match!</span></> : <><AlertCircle className="w-3.5 h-3.5" /><span>Passwords do not match yet.</span></>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter><Button type="submit" disabled={((hasEditPasswordValue || hasEditConfirmValue) && !editPasswordsMatch) || !editPasswordValid}>Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
