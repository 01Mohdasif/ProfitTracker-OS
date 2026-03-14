# **App Name**: ProfitPulse

## Core Features:

- Secure LocalStorage Authentication: Tenant registration, tenant login, employee login, and logout functionalities with role-based route protection, storing authentication tokens in LocalStorage to simulate a backend.
- Tenant Management Dashboard: Tenants can perform CRUD operations on employees, projects, modules within projects, and tasks within modules. This includes assigning modules or tasks to specific employees.
- Employee Self-Service Dashboard: Employees can view their assigned projects, modules, and tasks, and submit status updates (Pending, Working, Completed, Blocked) along with feedback.
- Tenant Review & Feedback Workflow: Tenants can review employee submissions, approve tasks/modules, mark them as completed, and provide feedback that becomes visible to the employee.
- Dynamic Financial Calculation Engine: Automatic calculation and real-time updates for Employee Cost, Project Contribution Value, and Employee Net Value based on changes in employee data, project revenue, or assignments.
- Tenant Analytics Dashboard: Display key performance indicators like total employees, projects, and revenue. Includes charts (e.g., Employee Value Generated, Profit vs. Cost) using Recharts and sortable, searchable, paginated tables for employees and projects.

## Style Guidelines:

- Primary brand color: #2E2EB8 (a professional and strong blue), providing a foundational, trustworthy feel.
- Background color: #1A1A23 (a very dark, desaturated blue), creating a sleek and modern dark theme suitable for a data-rich interface.
- Accent color: #67A6E4 (a vibrant light blue), used to highlight interactive elements, calls to action, and important data points for good contrast against the dark background.
- Headings and body text font: 'Inter' (sans-serif), chosen for its modern, clean, and highly readable characteristics, suitable for complex data displays.
- Use a consistent set of clean, modern line icons across the application to maintain a professional SaaS aesthetic and enhance usability.
- Adhere to a modern SaaS dashboard layout with a fixed left sidebar for navigation, a top navigation bar for search and user actions, and a main content area structured with KPI cards, charts, and data tables. Implement a mobile-first responsive design for seamless experience across all devices.
- Incorporate subtle and fast UI transitions for state changes, smooth animations for chart rendering, and micro-interactions on buttons and interactive elements to provide a polished and engaging user experience.