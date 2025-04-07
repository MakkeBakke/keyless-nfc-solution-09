
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { format } from 'date-fns'; // Import date-fns for formatting dates
import { useTheme } from '@/contexts/ThemeContext';

type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
};

type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null); // State for account creation date
  const { isDark } = useTheme();
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    }
  });
  
  const loginForm = useForm<AuthFormValues>({
    defaultValues: {
      email: '',
      password: '',
    }
  });
  
  const registerForm = useForm<AuthFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
      setUserId(session.user.id);
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, phone, created_at')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        form.reset({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        setCreatedAt(data.created_at); // Store the creation date
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          setUserId(session?.user.id || null);
          toast({
            title: "Welcome",
            description: "You have successfully signed in",
          });
          // Avoid immediate supabase calls in the callback
          setTimeout(() => {
            checkSession();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserId(null);
          form.reset({
            name: '',
            email: '',
            phone: '',
          });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, form]);
  
  const handleSave = async (values: ProfileFormValues) => {
    if (!userId) return;
    
    setLoading(true);
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        name: values.name,
        email: values.email,
        phone: values.phone,
      })
      .eq('id', userId);
    
    setLoading(false);
    
    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });
  };
  
  const handleLogin = async (values: AuthFormValues) => {
    setAuthLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    
    setAuthLoading(false);
    
    if (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    loginForm.reset();
  };
  
  const handleRegister = async (values: AuthFormValues) => {
    setAuthLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
        },
      },
    });
    
    setAuthLoading(false);
    
    if (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Registration Successful",
      description: "Please check your email to verify your account",
    });
    
    registerForm.reset();
  };
  
  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    
    if (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Signed Out",
      description: "You have been signed out",
    });
  };
  
  const handleChangePhoto = () => {
    toast({
      title: "Change Photo",
      description: "This feature will be available soon",
    });
  };
  
  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title="Profile" showBackButton />

      <div className="max-w-md mx-auto">
        {isAuthenticated ? (
          <>
            <div className="glass-card p-6 mb-6 animate-fade-in">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-axiv-blue/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-axiv-blue" />
                  </div>
                  <button
                    onClick={handleChangePhoto}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200"
                  >
                    <Camera size={16} className="text-axiv-blue" />
                  </button>
                </div>
                <h2 className="text-xl font-medium">{form.watch('name') || 'User Name'}</h2>
                <p className="text-axiv-gray text-sm">
                  Member since {createdAt ? format(new Date(createdAt), 'MMMM yyyy') : 'N/A'}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm text-axiv-gray">Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full p-3 border border-gray-200 rounded-lg" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm text-axiv-gray">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="w-full p-3 border border-gray-200 rounded-lg" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm text-axiv-gray">Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} className="w-full p-3 border border-gray-200 rounded-lg" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      className="flex-1 py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className={cn(
            "glass-card p-6 animate-fade-in",
            isDark && "bg-[#1A1F2C]/95 backdrop-blur-lg border-gray-700/30"
          )}>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className={cn(
                  "border-0 shadow-none",
                  isDark && "bg-[#1A1F2C] border border-gray-700/30"
                )}>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={cn("text-sm", isDark ? "text-gray-300" : "text-axiv-gray")}>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field} 
                                className={cn(
                                  "w-full p-3 border rounded-lg",
                                  isDark ? "bg-gray-800/80 border-gray-700 text-white" : "border-gray-200"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={cn("text-sm", isDark ? "text-gray-300" : "text-axiv-gray")}>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className={cn(
                                  "w-full p-3 border rounded-lg",
                                  isDark ? "bg-gray-800/80 border-gray-700 text-white" : "border-gray-200"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
                        disabled={authLoading}
                      >
                        {authLoading ? 'Signing In...' : 'Sign In'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className={cn(
                  "border-0 shadow-none",
                  isDark && "bg-[#1A1F2C] border border-gray-700/30"
                )}>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={cn("text-sm", isDark ? "text-gray-300" : "text-axiv-gray")}>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                className={cn(
                                  "w-full p-3 border rounded-lg",
                                  isDark ? "bg-gray-800/80 border-gray-700 text-white" : "border-gray-200"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={cn("text-sm", isDark ? "text-gray-300" : "text-axiv-gray")}>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field} 
                                className={cn(
                                  "w-full p-3 border rounded-lg",
                                  isDark ? "bg-gray-800/80 border-gray-700 text-white" : "border-gray-200"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={cn("text-sm", isDark ? "text-gray-300" : "text-axiv-gray")}>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className={cn(
                                  "w-full p-3 border rounded-lg",
                                  isDark ? "bg-gray-800/80 border-gray-700 text-white" : "border-gray-200"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
                        disabled={authLoading}
                      >
                        {authLoading ? 'Creating Account...' : 'Create Account'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
