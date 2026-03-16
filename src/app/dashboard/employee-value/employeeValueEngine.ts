import { User, Project, Assignment, Module, Task } from '../../../lib/types';
import { differenceInBusinessDays, parseISO, startOfDay } from 'date-fns';

export interface EmployeeFinancialData {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  projectsWorked: number;
  modulesAssigned: number;
  tasksAssigned: number;
  daysAssigned: number;
  totalCost: number;
  revenueContribution: number;
  netValue: number;
  roi: number;
  rankCategory: 'TOP' | 'AVERAGE' | 'UNDERPERFORMER';
}

export function calculateEmployeeFinancialValues(
  employees: User[],
  projects: Project[],
  assignments: Assignment[],
  modules: Module[],
  tasks: Task[],
  tenantId: string
): EmployeeFinancialData[] {
  const tenantEmployees = employees.filter(e => e.tenantId === tenantId && e.role === 'EMPLOYEE');
  const tenantProjects = projects.filter(p => p.tenantId === tenantId);
  
  const projectIds = new Set(tenantProjects.map(p => p.id));
  const validAssignments = assignments.filter(a => projectIds.has(a.projectId));

  // 1. Calculate revenue per unit per project (Modules + Tasks)
  const projectRevenuePerUnit: Record<string, number> = {};
  tenantProjects.forEach(project => {
    const projectModules = modules.filter(m => m.projectId === project.id);
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const totalWorkUnits = projectModules.length + projectTasks.length;
    
    if (totalWorkUnits > 0) {
      projectRevenuePerUnit[project.id] = project.revenue / totalWorkUnits;
    } else {
      projectRevenuePerUnit[project.id] = 0;
    }
  });

  // 2. Aggregate metrics per employee
  const currentDate = new Date();

  const results = tenantEmployees.map(employee => {
    const employeeAssignments = validAssignments.filter(a => a.employeeId === employee.id);
    const uniqueProjectsWorked = new Set(employeeAssignments.map(a => a.projectId));

    let daysAssigned = 0;

    employeeAssignments.forEach(a => {
      const startDate = startOfDay(parseISO(a.assignedAt));
      const endDate = a.unassignedAt ? startOfDay(parseISO(a.unassignedAt)) : startOfDay(currentDate);
      
      // Use differenceInBusinessDays to skip Saturday & Sunday. 
      // Add +1 to make it inclusive (e.g., Wed to Fri = 3 days).
      const days = Math.max(1, differenceInBusinessDays(endDate, startDate) + 1);
      daysAssigned += days;
    });

    const dailyRate = (employee.monthlySalary || 0) / 30;
    const employeeCost = dailyRate * daysAssigned;

    // 3. Calculate accurate revenue contribution based on assigned Modules/Tasks
    let revenueContribution = 0;
    const uniqueModules = new Set<string>();
    const uniqueTasks = new Set<string>();

    uniqueProjectsWorked.forEach(pid => {
      const empProjAssignments = employeeAssignments.filter(a => a.projectId === pid);
      
      const uniqueUnits = new Set<string>();
      empProjAssignments.forEach(a => {
        if (a.moduleId) {
          uniqueUnits.add(`module_${a.moduleId}`);
          uniqueModules.add(a.moduleId);
        }
        if (a.taskId) {
          uniqueUnits.add(`task_${a.taskId}`);
          uniqueTasks.add(a.taskId);
        }
      });

      const numberOfAssignedUnits = uniqueUnits.size;
      const revenuePerUnit = projectRevenuePerUnit[pid] || 0;
      revenueContribution += (numberOfAssignedUnits * revenuePerUnit);
    });

    const netValue = revenueContribution - employeeCost;
    
    let roi = 0;
    if (employeeCost > 0) {
      roi = (netValue / employeeCost) * 100;
    } else if (revenueContribution > 0) {
      roi = 100; // Cap at 100% to avoid infinity logic if cost is 0
    }

    let rankCategory: 'TOP' | 'AVERAGE' | 'UNDERPERFORMER' = 'AVERAGE';
    if (roi > 100) rankCategory = 'TOP';
    else if (roi < 0) rankCategory = 'UNDERPERFORMER';

    return {
      id: employee.id,
      name: employee.name,
      designation: employee.designation || 'Staff',
      monthlySalary: employee.monthlySalary || 0,
      projectsWorked: uniqueProjectsWorked.size,
      modulesAssigned: uniqueModules.size,
      tasksAssigned: uniqueTasks.size,
      daysAssigned,
      totalCost: employeeCost,
      revenueContribution,
      netValue,
      roi,
      rankCategory
    };
  });

  // Default sort by ROI descending for Leaderboard & overall views
  return results.sort((a, b) => b.roi - a.roi);
}