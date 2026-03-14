export type Role = 'TENANT' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  tenantId: string; // Both types belong to a tenant context
  monthlySalary?: number;
  designation?: string;
  joiningDate?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
}

export type TaskStatus = 'Pending' | 'Working' | 'Completed' | 'Blocked';

/**
 * Assignment Model
 * Links employees to specific work units (Modules or Tasks).
 */
export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  moduleId?: string; // Present if assigned to a module
  taskId?: string;   // Present if assigned to a task
  status: TaskStatus;
  feedback?: string;
  assignedAt: string;
  unassignedAt?: string; // Timestamp when employee was removed from this task
}

export interface Task {
  id: string;
  title: string;
  moduleId: string;
  projectId: string;
  status: TaskStatus;
  feedback?: string; // Admin feedback
  employeeNote?: string; // Employee progress update
  completedAt?: string;
  dueDate?: string;
}

export interface Module {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  dueDate?: string;
}

export interface Project {
  id: string;
  title: string;
  revenue: number;
  tenantId: string;
  status: 'Planning' | 'Active' | 'Closed';
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface FinancialStats {
  employeeCost: number;
  projectContribution: number;
  employeeNetValue: number;
}
