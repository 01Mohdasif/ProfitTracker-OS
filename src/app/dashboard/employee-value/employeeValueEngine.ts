import { User, Project, Assignment } from '../../../lib/types';
import { differenceInDays, parseISO } from 'date-fns';

export interface EmployeeFinancialData {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  projectsWorked: number;
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
  tenantId: string
): EmployeeFinancialData[] {
  const tenantEmployees = employees.filter(e => e.tenantId === tenantId && e.role === 'EMPLOYEE');
  const tenantProjects = projects.filter(p => p.tenantId === tenantId);
  
  const projectIds = new Set(tenantProjects.map(p => p.id));
  const validAssignments = assignments.filter(a => projectIds.has(a.projectId));

  // 1. Calculate revenue splits per project
  const projectRevenueSplits: Record<string, number> = {};
  tenantProjects.forEach(project => {
    const projectAssignments = validAssignments.filter(a => a.projectId === project.id);
    const uniqueEmployeeIds = new Set(projectAssignments.map(a => a.employeeId));
    if (uniqueEmployeeIds.size > 0) {
      projectRevenueSplits[project.id] = project.revenue / uniqueEmployeeIds.size;
    } else {
      projectRevenueSplits[project.id] = 0;
    }
  });

  // 2. Aggregate metrics per employee
  const currentDate = new Date();

  const results = tenantEmployees.map(employee => {
    const employeeAssignments = validAssignments.filter(a => a.employeeId === employee.id);
    const uniqueProjectsWorked = new Set(employeeAssignments.map(a => a.projectId));

    let daysAssigned = 0;

    employeeAssignments.forEach(a => {
      const startDate = parseISO(a.assignedAt);
      const endDate = a.unassignedAt ? parseISO(a.unassignedAt) : currentDate;
      const days = Math.max(1, differenceInDays(endDate, startDate));
      daysAssigned += days;
    });

    const dailyRate = (employee.monthlySalary || 0) / 30;
    const employeeCost = dailyRate * daysAssigned;

    let revenueContribution = 0;
    uniqueProjectsWorked.forEach(pid => {
      revenueContribution += (projectRevenueSplits[pid] || 0);
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