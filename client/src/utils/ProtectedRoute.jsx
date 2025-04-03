
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ProtectedRoute = ({ children, requiredUserType }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // This function will be easy to replace with your Express/Node/MongoDB authentication
    const checkAuth = () => {
      const token = localStorage.getItem("qeaseAuthToken");
      const userType = localStorage.getItem("qeaseUserType");
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return false;
      }
      
      if (requiredUserType && userType !== requiredUserType) {
        toast({
          title: "Access Denied",
          description: `This page is only accessible to ${requiredUserType} users.`,
          variant: "destructive",
        });
        navigate(userType === "admin" ? "/admin/dashboard" : "/user/dashboard");
        return false;
      }
      
      return true;
    };
    
    checkAuth();
    
    // When replacing with Express/MongoDB, you would update this function
    // to make API calls to your backend to validate the token
  }, [navigate, toast, requiredUserType]);

  return <>{children}</>;
};

export default ProtectedRoute;
