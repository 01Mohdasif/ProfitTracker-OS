"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/lib/store';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Building, User as UserIcon, Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = formData.password === formData.confirmPassword;
  const hasConfirmValue = formData.confirmPassword.length > 0;
  const passwordValid = formData.password.length === 0 || formData.password.length >= 6;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      toast({ 
        variant: "destructive", 
        title: "Registration Error", 
        description: "Passwords do not match. please check and try again." 
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({ 
        variant: "destructive", 
        title: "Weak Password", 
        description: "Password must be at least 6 characters long." 
      });
      return;
    }

    setIsLoading(true);

    // Simulate a small delay for the loader to be visible
    setTimeout(() => {
      const tenantId = Math.random().toString(36).substr(2, 9);
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'TENANT',
        tenantId: tenantId,
      };

      Store.saveUser(newUser);
      Store.setAuth(newUser);
      
      toast({ title: "Registration Successful", description: `Tenant ${formData.tenantName} registered.` });
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-6 bg-background" style={{ colorScheme: 'dark' }}>
      <Card className="w-full max-w-lg bg-card/50 border-white/10 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
              <BarChart3 className="text-white w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Register Tenant</CardTitle>
          <p className="text-muted-foreground">Set up your business environment</p>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Company / Tenant Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="tenantName" 
                  placeholder="Acme Corp" 
                  className="pl-10"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Admin Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@acme.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
              className={cn("pl-10 pr-10", !passwordValid && "border-destructive focus-visible:ring-destructive")}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
          {!passwordValid && (
            <div className="flex items-center gap-2 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5" /><span>Password must be at least 6 characters.</span>
            </div>
          )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={cn(
                    "pl-10 pr-10 transition-colors",
                    hasConfirmValue && !passwordsMatch && "border-destructive focus-visible:ring-destructive",
                    hasConfirmValue && passwordsMatch && "border-green-500 focus-visible:ring-green-500"
                  )}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {hasConfirmValue && (
                <div className={cn(
                  "flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1",
                  passwordsMatch ? "text-green-500" : "text-destructive"
                )}>
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passwords match!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Passwords do not match yet.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-primary h-11 text-lg shadow-lg"
          disabled={(hasConfirmValue && !passwordsMatch) || !passwordValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Tenant Account"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already registered? <Link href="/auth/login" className="text-accent hover:underline">Login here</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
