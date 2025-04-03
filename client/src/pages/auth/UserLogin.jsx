import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const UserLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Here we would implement the actual login API call
    console.log("Login data:", loginData);
    
    // Simulating a successful login
    toast({
      title: "Login Successful",
      description: "Welcome back to Q-ease!",
    });
    
    // Store token in localStorage (this would come from API)
    localStorage.setItem("qeaseAuthToken", "sample-user-jwt-token");
    localStorage.setItem("qeaseUserType", "user");
    
    // Redirect to user dashboard
    navigate("/user/dashboard");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would implement the actual registration API call
    console.log("Register data:", registerData);
    
    // Simulating a successful registration
    toast({
      title: "Registration Successful",
      description: "Your account has been created. Please log in.",
    });
    
    // Switch to login tab
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 group">
          <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 transform group-hover:scale-105 transition-transform">
            Q-ease
          </span>
        </Link>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 p-1 bg-blue-50 rounded-lg">
            <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="h-11 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="h-11 px-4"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                  >
                    Sign in
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join Q-ease to manage your queues efficiently
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      className="h-11 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="h-11 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="h-11 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="h-11 px-4"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                  >
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Looking to join as an admin?{" "}
            <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
