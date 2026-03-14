"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  Briefcase,
  Layout,
  CheckSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "1. Tenant Registration & Login",
    description: "Start by registering your company on the landing page. This creates a secure Tenant (Admin) account. You can then log in to access the full enterprise dashboard.",
    icon: Building,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30 hover:border-blue-500",
    role: "Admin",
  },
  {
    title: "2. Build Your Team (Employees)",
    description: "Navigate to the Employees section. Add your staff members by providing their name, email, designation, and monthly salary. The email and password you set here will be used by the employee to log in.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    borderColor: "border-purple-500/30 hover:border-purple-500",
    role: "Admin",
  },
  {
    title: "3. Initialize Projects",
    description: "Go to the Projects module and create a new project. Define the project's target revenue (Deal Value) and start/end dates.",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    borderColor: "border-orange-500/30 hover:border-orange-500",
    role: "Admin",
  },
  {
    title: "4. Allocate Workload (Hierarchy)",
    description: "Inside the project, create Modules, and break those modules down into Tasks. Assign these tasks to your team members. The system automatically calculates their assignment duration based on task deadlines.",
    icon: Layout,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    borderColor: "border-pink-500/30 hover:border-pink-500",
    role: "Admin",
  },
  {
    title: "5. Employee Execution",
    description: "Employees log in using the credentials created by the Admin. They see a restricted dashboard showing only their assigned tasks. They can update the status (Working, Completed, Blocked) and submit progress notes.",
    icon: CheckSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30 hover:border-emerald-500",
    role: "Employee",
  },
  {
    title: "6. Financial Intelligence & Reporting",
    description: "The Analytics Dashboard dynamically calculates the 'Burn Cost' for each project. It computes the daily salary of assigned employees and multiplies it by the days they are assigned, giving you real-time Net Margin and Efficiency metrics.",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "border-primary/30 hover:border-primary",
    role: "Admin",
  }
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight">System Workflow Guide</h1>
        <p className="text-muted-foreground text-lg">Understand how ProfitTracker OS operates from start to finish.</p>
      </div>

      <div className="relative mt-12">
        {/* Vertical Line */}
        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-border/60 md:-translate-x-1/2 rounded-full"></div>

        <div className="space-y-12">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const Icon = step.icon;

            return (
              <div key={index} className={cn("relative flex items-center md:justify-between flex-col md:flex-row", isEven ? "md:flex-row-reverse" : "")}>
                
                {/* Center Circle */}
                <div className="absolute left-[8px] md:left-1/2 w-10 h-10 md:-translate-x-1/2 rounded-full bg-background border-4 border-border flex items-center justify-center z-10 shadow-sm">
                  <div className={cn("w-3 h-3 rounded-full border", step.bg, step.borderColor)} />
                </div>

                {/* Content Card */}
                <div className={cn("w-full md:w-[45%] pl-16 md:pl-0", isEven ? "md:text-left" : "md:text-right")}>
                  <Card className={cn("border-2 shadow-sm transition-all duration-300", step.borderColor)}>
                    <CardHeader className="pb-2">
                      <div className={cn("flex items-center gap-3 mb-2", isEven ? "md:flex-row" : "md:flex-row-reverse")}>
                        <div className={cn("p-2 rounded-lg shrink-0", step.bg, step.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className={cn(step.role === 'Admin' ? "text-blue-500 border-blue-500/30" : "text-emerald-500 border-emerald-500/30")}>
                          {step.role} View
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}