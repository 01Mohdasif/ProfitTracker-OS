"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a small delay for the loader to be visible
    setTimeout(() => {
      const users = Store.getUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        if (user.password && user.password !== password) {
          toast({ variant: "destructive", title: "Authentication Failed", description: "Incorrect password." });
          setIsLoading(false);
          return;
        }
        Store.setAuth(user);
        toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
        router.push('/dashboard');
      } else {
        toast({ variant: "destructive", title: "Authentication Failed", description: "User not found. Try registering as a tenant first." });
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-6 bg-background" style={{ colorScheme: 'dark' }}>
      <Card className="w-full max-w-md bg-card/50 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to ProfitTracker</CardTitle>
          <p className="text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary h-11 text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link href="/auth/register" className="text-accent hover:underline">Register your Tenant</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
