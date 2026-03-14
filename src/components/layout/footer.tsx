import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("text-center", className)}>
      <p className="text-muted-foreground font-medium">
        Design and developed by <a href="https://www.linkedin.com/in/mohd-asif-3a159913b/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">Mohd Asif</a>
      </p>
    </footer>
  );
}