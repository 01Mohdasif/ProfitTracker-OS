import { User, Tenant, Project, Module, Task, FinancialStats, Assignment } from './types';
import { differenceInDays, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  USERS: 'profitpulse_users',
  TENANTS: 'profitpulse_tenants',
  PROJECTS: 'profitpulse_projects',
  MODULES: 'profitpulse_modules',
  TASKS: 'profitpulse_tasks',
  ASSIGNMENTS: 'profitpulse_assignments',
  AUTH: 'profitpulse_auth',
};

const get = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const set = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const Store = {
  getUsers: () => get<User[]>(STORAGE_KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = Store.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing > -1) users[existing] = user;
    else users.push(user);
    set(STORAGE_KEYS.USERS, users);
  },
  deleteUser: (id: string) => {
    const users = Store.getUsers().filter(u => u.id !== id);
    set(STORAGE_KEYS.USERS, users);
    const assigns = Store.getAssignments().filter(a => a.employeeId !== id);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },

  getProjects: () => get<Project[]>(STORAGE_KEYS.PROJECTS, []),
  saveProject: (proj: Project) => {
    const projs = Store.getProjects();
    const existing = projs.findIndex(p => p.id === proj.id);
    if (existing > -1) projs[existing] = proj;
    else projs.push(proj);
    set(STORAGE_KEYS.PROJECTS, projs);
  },
  deleteProject: (id: string) => {
    const projs = Store.getProjects().filter(p => p.id !== id);
    set(STORAGE_KEYS.PROJECTS, projs);
    
    const mods = Store.getModules().filter(m => m.projectId !== id);
    set(STORAGE_KEYS.MODULES, mods);
    const tasks = Store.getTasks().filter(t => t.projectId !== id);
    set(STORAGE_KEYS.TASKS, tasks);
    const assigns = Store.getAssignments().filter(a => a.projectId !== id);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },

  getModules: () => get<Module[]>(STORAGE_KEYS.MODULES, []),
  saveModule: (mod: Module) => {
    const mods = Store.getModules();
    const existing = mods.findIndex(m => m.id === mod.id);
    if (existing > -1) mods[existing] = mod;
    else mods.push(mod);
    set(STORAGE_KEYS.MODULES, mods);
  },
  deleteModule: (id: string) => {
    const mods = Store.getModules().filter(m => m.id !== id);
    set(STORAGE_KEYS.MODULES, mods);
    const tasks = Store.getTasks().filter(t => t.moduleId !== id);
    set(STORAGE_KEYS.TASKS, tasks);
    const assigns = Store.getAssignments().filter(a => a.moduleId !== id);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },

  getTasks: () => get<Task[]>(STORAGE_KEYS.TASKS, []),
  saveTask: (task: Task) => {
    const tasks = Store.getTasks();
    const existing = tasks.findIndex(t => t.id === task.id);
    if (existing > -1) tasks[existing] = task;
    else tasks.push(task);
    set(STORAGE_KEYS.TASKS, tasks);
  },
  deleteTask: (id: string) => {
    const tasks = Store.getTasks().filter(t => t.id !== id);
    set(STORAGE_KEYS.TASKS, tasks);
    const assigns = Store.getAssignments().filter(a => a.taskId !== id);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },

  getAssignments: () => get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []),
  saveAssignment: (assign: Assignment) => {
    const assigns = Store.getAssignments();
    const existing = assigns.findIndex(a => a.id === assign.id);
    if (existing > -1) assigns[existing] = assign;
    else assigns.push(assign);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },
  deleteAssignment: (id: string) => {
    const assigns = Store.getAssignments().filter(a => a.id !== id);
    set(STORAGE_KEYS.ASSIGNMENTS, assigns);
  },
  unassignEmployeeFromTask: (assignmentId: string) => {
    const all = Store.getAssignments();
    const index = all.findIndex(a => a.id === assignmentId);
    if (index > -1) {
      all[index].unassignedAt = new Date().toISOString();
      set(STORAGE_KEYS.ASSIGNMENTS, all);
    }
  },
  syncAssignments: (projectId: string, parentId: string, employeeIds: string[], type: 'module' | 'task') => {
    const all = Store.getAssignments();
    // Look for currently active assignments for this item
    const existingActiveAssignments = all.filter(a => 
      !a.unassignedAt && (type === 'module' ? a.moduleId === parentId : a.taskId === parentId)
    );
    
    // Mark as unassigned if removed from team list
    existingActiveAssignments.forEach(a => {
      if (!employeeIds.includes(a.employeeId)) {
        const fullList = Store.getAssignments();
        const idx = fullList.findIndex(item => item.id === a.id);
        if (idx > -1) {
          fullList[idx].unassignedAt = new Date().toISOString();
          set(STORAGE_KEYS.ASSIGNMENTS, fullList);
        }
      }
    });

    // Add new assignments
    employeeIds.forEach(empId => {
      const exists = existingActiveAssignments.find(a => a.employeeId === empId);
      if (!exists) {
        Store.saveAssignment({
          id: Math.random().toString(36).substr(2, 9),
          employeeId: empId,
          projectId,
          moduleId: type === 'module' ? parentId : undefined,
          taskId: type === 'task' ? parentId : undefined,
          status: 'Pending',
          assignedAt: new Date().toISOString()
        });
      }
    });
  },

  getAuth: () => get<User | null>(STORAGE_KEYS.AUTH, null),
  setAuth: (user: User | null) => set(STORAGE_KEYS.AUTH, user),

  calculateFinancials: (tenantId: string): FinancialStats => {
    const users = Store.getUsers().filter(u => u.tenantId === tenantId && u.role === 'EMPLOYEE');
    const projs = Store.getProjects().filter(p => p.tenantId === tenantId);
    
    const totalMonthlyCost = users.reduce((sum, u) => sum + (u.monthlySalary || 0), 0);
    const totalRevenue = projs.reduce((sum, p) => sum + p.revenue, 0);
    
    const estimatedYearlyCost = totalMonthlyCost * 12;
    const netValue = totalRevenue - estimatedYearlyCost;

    return {
      employeeCost: estimatedYearlyCost,
      projectContribution: totalRevenue,
      employeeNetValue: netValue,
    };
  },

  calculateProjectCost: (projectId: string) => {
    // Include both active and unassigned assignments for accurate historical cost
    const assignments = Store.getAssignments().filter(a => a.projectId === projectId);
    const users = Store.getUsers();
    const modules = Store.getModules();
    const tasks = Store.getTasks();
    const project = Store.getProjects().find(p => p.id === projectId);

    if (!project) return { totalCost: 0, breakdown: [] };

    let totalCost = 0;
    const breakdown: { employee: User; cost: number; days: number }[] = [];

    assignments.forEach(assign => {
      const user = users.find(u => u.id === assign.employeeId);
      if (!user || !user.monthlySalary) return;

      const dailyRate = user.monthlySalary / 30;
      let targetDateStr = project.endDate || new Date().toISOString();

      // If they were unassigned, work ended at unassignedAt
      if (assign.unassignedAt) {
        targetDateStr = assign.unassignedAt;
      } else if (assign.taskId) {
        const task = tasks.find(t => t.id === assign.taskId);
        if (task?.dueDate) targetDateStr = task.dueDate;
      } else if (assign.moduleId) {
        const mod = modules.find(m => m.id === assign.moduleId);
        if (mod?.dueDate) targetDateStr = mod.dueDate;
      }

      const startDate = parseISO(assign.assignedAt);
      const endDate = parseISO(targetDateStr);
      const days = Math.max(1, differenceInDays(endDate, startDate));
      const cost = days * dailyRate;

      totalCost += cost;
      
      const existingEntry = breakdown.find(b => b.employee.id === user.id);
      if (existingEntry) {
        existingEntry.cost += cost;
        existingEntry.days += days;
      } else {
        breakdown.push({ employee: user, cost, days });
      }
    });

    return { totalCost, breakdown };
  }
};
