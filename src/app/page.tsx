"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BarChart3, ShieldCheck, Users, Briefcase } from "lucide-react";
import { Footer } from "@/components/layout/footer";
// xyz
export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const auth = Store.getAuth();
    if (auth) {
      router.push("/dashboard");
    } else {
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) return null;

  return (
    <div className="dark flex flex-col min-h-screen bg-background text-foreground" style={{ colorScheme: 'dark' }}>
      <nav className="p-6 flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-headline tracking-tight">
            ProfitTracker
          </span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => router.push("/auth/login")}>
            Login
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => router.push("/auth/register")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-24 px-6 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold font-headline max-w-4xl mx-auto leading-tight">
            The Ultimate <span className="gradient-text">Financial OS</span> for
            Modern Businesses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is my Technical Project submitted for the NowGray Hiring
            Process.
            ProfitTracker helps tenants manage employees, track
            project health, and visualize profitability in real-time.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary px-8"
              onClick={() => router.push("/auth/register")}
            >
              Register Tenant
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 px-6 py-16 max-w-7xl mx-auto">
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-accent" />}
            title="Role Protection"
            description="Secure hierarchical access for tenants and employees with dedicated dashboards."
          />
          <FeatureCard
            icon={<Briefcase className="w-8 h-8 text-accent" />}
            title="Project Tracking"
            description="Manage modules and tasks with automated contribution value calculations."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-accent" />}
            title="Employee Insights"
            description="Deep dive into employee performance metrics and net value contribution."
          />
        </section>
      </main>

      <Footer className="p-12 border-t border-white/5 bg-black/20" />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-card/40 hover:bg-card/60 transition-all group">
      <div className="mb-4 transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
