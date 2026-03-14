"use client";

import { useEffect, useState } from 'react';
import { Store } from '@/lib/store';
import { Project, User, Module, Task, Assignment } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Briefcase, 
  Target, 
  Layout, 
  CheckSquare, 
  Calendar, 
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProjectOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const auth = Store.getAuth();
    if (auth) {
      setUser(auth);
      const allProjects = Store.getProjects().filter(p => p.tenantId === auth.tenantId);
      const allAssignments = Store.getAssignments().filter(a => a.employeeId === auth.id);
      
      setAssignments(allAssignments);
      
      // Filter projects where user is assigned
      const projectIds = new Set(allAssignments.map(a => a.projectId));
      const filtered = allProjects.filter(proj => projectIds.has(proj.id));

      setAssignedProjects(filtered);
    }
  }, []);

  if (!user) return null;

  const getProjectHierarchy = (projId: string) => {
    const modules = Store.getModules().filter(m => m.projectId === projId);
    const tasks = Store.getTasks().filter(t => t.projectId === projId);
    
    return modules.map(mod => ({
      ...mod,
      tasks: tasks.filter(t => t.moduleId === mod.id)
    }));
  };

  const isAssigned = (parentId: string, type: 'module' | 'task') => {
    return assignments.some(a => type === 'module' ? a.moduleId === parentId : a.taskId === parentId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline">Project Portfolio</h1>
        <p className="text-muted-foreground">Comprehensive overview of all projects you are contributing to.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedProjects.map((proj) => (
          <Card key={proj.id} className="bg-card/40 border-white/5 group hover:border-primary/40 transition-all overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <Badge variant={proj.status === 'Active' ? 'default' : 'secondary'}>{proj.status}</Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{proj.title}</CardTitle>
              <CardDescription className="line-clamp-2">{proj.description || 'Enterprise project assignment.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> Participation</span>
                  <span className="font-medium text-foreground">Active Contributor</span>
                </div>
                
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all gap-2">
                          <ExternalLink className="w-4 h-4" /> View Full Hierarchy
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Explore modules, tasks, and deadlines</TooltipContent>
                  </Tooltip>
                  <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b border-border bg-muted/30 shrink-0">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" /> Delivery Hierarchy: {proj.title}
                      </DialogTitle>
                      <DialogDescription>Full structural breakdown of your assigned workload and deadlines.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-background">
                      <div className="space-y-8">
                        {getProjectHierarchy(proj.id).map((module) => (
                          <div key={module.id} className="relative pl-8 border-l-2 border-primary/20 space-y-4">
                            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg" />
                            
                            <div className={cn(
                              "p-4 border rounded-xl transition-all",
                              isAssigned(module.id, 'module') ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
                            )}>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-primary" />
                                    <h4 className="font-bold text-lg">{module.title}</h4>
                                    <Badge variant="outline" className="text-[10px]">Module</Badge>
                                    {isAssigned(module.id, 'module') && (
                                      <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px]">My Assignment</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: {module.dueDate ? format(new Date(module.dueDate), 'MMM dd, yyyy') : 'No Date'}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Status: {module.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-3 ml-4">
                              {module.tasks.map((task) => (
                                <div key={task.id} className="relative pl-6 border-l-2 border-accent/20">
                                  <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-md" />
                                  <div className={cn(
                                    "p-3 border rounded-lg shadow-sm transition-all",
                                    isAssigned(task.id, 'task') ? "bg-accent/5 border-accent/30 shadow-accent/5" : "bg-card border-border/60"
                                  )}>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <CheckSquare className="w-4 h-4 text-accent" />
                                          <span className="font-semibold text-sm truncate">{task.title}</span>
                                          {isAssigned(task.id, 'task') && (
                                            <Badge variant="outline" className="text-[9px] border-accent/40 text-accent">Assigned to Me</Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> {task.status}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {module.tasks.length === 0 && (
                                <p className="text-xs text-muted-foreground italic ml-2">No individual tasks defined for this module.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {assignedProjects.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/10">
            <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Active Assignments</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              You haven't been assigned to any projects yet. Contact your tenant administrator to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
