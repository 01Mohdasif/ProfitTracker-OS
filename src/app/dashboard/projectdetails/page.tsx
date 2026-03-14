"use client";

import { useEffect, useState } from 'react';
import { Store } from '@/lib/store';
import { Project, Module, Task, User, Assignment } from '@/lib/types';
import { Briefcase, Folder, FileText, ArrowLeft, Users, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Define the shape of our structured data
type PopulatedTask = Task & {
  assignments: { user: User; assignment: Assignment }[];
}

type PopulatedModule = Module & {
  tasks: PopulatedTask[];
  assignments: { user: User; assignment: Assignment }[];
}

type PopulatedProject = Project & {
  modules: PopulatedModule[];
}

export default function ProjectDetailsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<PopulatedProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = Store.getAuth();
    if (auth) {
      setProjects(Store.getProjects().filter(p => p.tenantId === auth.tenantId));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectData(null);
      return;
    }

    const project = Store.getProjects().find(p => p.id === selectedProjectId);
    if (!project) return;

    const allModules = Store.getModules().filter(m => m.projectId === selectedProjectId);
    const allTasks = Store.getTasks().filter(t => t.projectId === selectedProjectId);
    const allAssignments = Store.getAssignments().filter(a => a.projectId === selectedProjectId && !a.unassignedAt);
    const allUsers = Store.getUsers();

    const getAssignmentsFor = (id: string, type: 'module' | 'task') => {
      return allAssignments
        .filter(a => (type === 'module' ? a.moduleId === id : a.taskId === id))
        .map(assignment => {
          const user = allUsers.find(u => u.id === assignment.employeeId);
          return { user: user!, assignment };
        })
        .filter(item => !!item.user); // Ensure user exists
    };

    const populatedModules: PopulatedModule[] = allModules.map(module => {
      const tasksForModule: PopulatedTask[] = allTasks
        .filter(task => task.moduleId === module.id)
        .map(task => ({
          ...task,
          assignments: getAssignmentsFor(task.id, 'task'),
        }));
      
      return {
        ...module,
        tasks: tasksForModule,
        assignments: getAssignmentsFor(module.id, 'module'),
      };
    });

    const populatedProject: PopulatedProject = {
      ...project,
      modules: populatedModules,
    };

    setProjectData(populatedProject);
  }, [selectedProjectId]);

  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Planning': return 'secondary';
      case 'Closed': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // Render Listing View
  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Project Details</h1>
          <p className="text-muted-foreground">Select a project to view its full structural hierarchy.</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Projects Found</h3>
            <p className="text-muted-foreground mt-2">Go to the Projects page to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="flex flex-col cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedProjectId(project.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                  </div>
                  <CardDescription className="h-10 overflow-hidden">{project.description || 'No description provided.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <div className="text-sm flex justify-between"><span className="text-muted-foreground">Revenue:</span> <span className="font-semibold font-mono">₹{project.revenue.toLocaleString()}</span></div>
                    <div className="text-sm flex justify-between"><span className="text-muted-foreground">Timeline:</span> <span className="font-semibold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span></div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Hierarchy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Detailed Tree View
  if (!projectData) return null;

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <Button variant="outline" onClick={() => setSelectedProjectId(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects List
        </Button>

        <div className="w-full bg-card/40 border rounded-xl shadow-sm overflow-auto p-8 relative min-h-[600px]">
          <div className="min-w-max mx-auto flex flex-col items-center">
            
            {/* LEVEL 1: ROOT PROJECT NODE */}
            <Card className="w-80 border-primary/40 shadow-lg relative z-10 bg-card">
              <CardHeader className="pb-3 text-center">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant={getStatusBadgeVariant(projectData.status)}>{projectData.status}</Badge>
                <CardTitle className="text-xl font-bold flex flex-col items-center gap-2 mt-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  {projectData.title}
                </CardTitle>
                <CardDescription>{projectData.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg text-sm mb-2">
                    <span className="text-muted-foreground font-semibold">Revenue</span>
                    <span className="font-mono font-bold text-primary">₹{projectData.revenue.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'N/A'} - {projectData.endDate ? new Date(projectData.endDate).toLocaleDateString() : 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* Drop line from Project to Modules */}
            {projectData.modules.length > 0 && <div className="w-[2px] h-10 bg-border"></div>}

            {projectData.modules.length === 0 && (
              <div className="mt-8 text-center text-muted-foreground flex flex-col items-center opacity-40">
                  <div className="w-[2px] h-8 bg-border border-dashed mb-2"></div>
                  <Folder className="w-8 h-8 mb-2" />
                  <p className="text-sm italic">No modules built yet.</p>
              </div>
            )}

            {/* LEVEL 2: MODULES CONTAINER */}
            {projectData.modules.length > 0 && (
              <div className="flex items-start justify-center relative">
                {projectData.modules.map((module, mIdx) => {
                  const mIsFirst = mIdx === 0;
                  const mIsLast = mIdx === projectData.modules.length - 1;
                  const mIsOnly = projectData.modules.length === 1;

                  return (
                    <div key={module.id} className="flex flex-col items-center relative px-4 sm:px-6">
                      {/* Horizontal connecting line for modules */}
                      {!mIsOnly && (
                        <div className={cn(
                          "absolute top-0 h-[2px] bg-border",
                          mIsFirst ? "left-1/2 right-0" : 
                          mIsLast ? "left-0 right-1/2" : 
                          "left-0 right-0"
                        )}></div>
                      )}
                      {/* Vertical line to module card */}
                      <div className="absolute top-0 left-1/2 w-[2px] h-10 bg-border -translate-x-1/2"></div>
                      
                      {/* Module Card */}
                      <div className="mt-10">
                        <Card className="w-56 border-accent/30 shadow-sm relative z-10 bg-background hover:border-accent transition-colors">
                          <CardContent className="p-4 flex flex-col items-center">
                            <Folder className="w-8 h-8 text-accent mb-2" />
                            <h4 className="font-bold text-center text-sm mb-1">{module.title}</h4>
                            <Badge variant="secondary" className="text-[10px] mb-3">{module.status}</Badge>
                            
                            {module.assignments.length > 0 && (
                              <div className="flex -space-x-2">
                                {module.assignments.map(({ user, assignment }) => (
                                  <Tooltip key={assignment.id}>
                                    <TooltipTrigger>
                                      <Avatar className="h-7 w-7 border-2 border-background hover:z-10 relative transition-transform hover:scale-110">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-semibold">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">{user.designation}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Drop line from Module to Tasks */}
                      {module.tasks.length > 0 && <div className="w-[2px] h-10 bg-border"></div>}

                      {module.tasks.length === 0 && (
                          <div className="text-center text-muted-foreground flex flex-col items-center mt-2 opacity-50">
                            <div className="w-[2px] h-6 bg-border border-dashed mb-1"></div>
                            <span className="text-[10px] italic">No tasks</span>
                          </div>
                      )}

                      {/* LEVEL 3: TASKS CONTAINER */}
                      {module.tasks.length > 0 && (
                        <div className="flex items-start justify-center relative">
                          {module.tasks.map((task, tIdx) => {
                            const tIsFirst = tIdx === 0;
                            const tIsLast = tIdx === module.tasks.length - 1;
                            const tIsOnly = module.tasks.length === 1;

                            return (
                              <div key={task.id} className="flex flex-col items-center relative px-2 sm:px-3">
                                {/* Horizontal connecting line for tasks */}
                                {!tIsOnly && (
                                  <div className={cn(
                                    "absolute top-0 h-[2px] bg-border",
                                    tIsFirst ? "left-1/2 right-0" : 
                                    tIsLast ? "left-0 right-1/2" : 
                                    "left-0 right-0"
                                  )}></div>
                                )}
                                {/* Vertical line to task card */}
                                <div className="absolute top-0 left-1/2 w-[2px] h-10 bg-border -translate-x-1/2"></div>
                                
                                {/* Task Card */}
                                <div className="mt-10">
                                  <div className="w-40 bg-card border hover:border-primary/50 transition-colors rounded-xl shadow-sm relative z-10 p-3 flex flex-col items-center text-center">
                                    <FileText className="w-5 h-5 text-muted-foreground mb-1" />
                                    <span className="font-semibold text-xs mb-2 line-clamp-2 w-full">{task.title}</span>
                                    <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full font-medium mb-3",
                                        task.status === 'Completed' ? "bg-green-500/10 text-green-500" :
                                        task.status === 'Working' ? "bg-blue-500/10 text-blue-500" :
                                        "bg-muted text-muted-foreground"
                                      )}>
                                        {task.status}
                                    </span>
                                    
                                    {task.assignments.length > 0 ? (
                                      <div className="flex -space-x-1.5">
                                        {task.assignments.map(({ user, assignment }) => (
                                          <Tooltip key={assignment.id}>
                                              <TooltipTrigger>
                                                  <Avatar className="h-6 w-6 border border-background hover:z-10 relative transition-transform hover:scale-110">
                                                      <AvatarImage src={`https://picsum.photos/seed/${user.id}/32/32`} />
                                                      <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">{user.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="font-semibold text-xs">{user.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{user.designation}</p>
                                              </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground italic">Unassigned</span>
                                    )}
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
      </div>
    </TooltipProvider>
  );
}