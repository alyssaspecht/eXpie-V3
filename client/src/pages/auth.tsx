import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional()
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      toast({
        title: "Login successful",
        description: "Welcome back to eXpieStack!",
      });
      
      setLocation('/onboarding');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/auth/register', {
        email: data.email,
        password: data.password
      });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please proceed to onboarding.",
      });
      
      setLocation('/onboarding');
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again with a different email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-indigo-900 tracking-tight">
            eXpie
          </h2>
          <p className="mt-2 text-base text-gray-600 mx-auto max-w-md">
            The ultimate productivity tool for eXp professionals
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...loginForm.register('email')}
                    className="mt-1"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    className="mt-1"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox 
                      id="remember-me" 
                      {...loginForm.register('rememberMe')} 
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="ml-2 text-sm text-gray-700"
                    >
                      Remember me
                    </Label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
                <div>
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    {...signupForm.register('email')}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register('password')}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register('confirmPassword')}
                    className="mt-1"
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Marketing Features */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 mx-auto max-w-4xl text-center">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3 mb-4">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Save Time</h3>
                  <p className="mt-2 text-sm text-gray-500">Automate repetitive tasks and save hours every week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Integrated Tools</h3>
                  <p className="mt-2 text-sm text-gray-500">Connect with Slack, Gmail, Calendar and more</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Powered</h3>
                  <p className="mt-2 text-sm text-gray-500">Leverage ChatGPT to draft emails and responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
