
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState("Admin User"); // This would come from API/auth

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("qeaseAuthToken");
    localStorage.removeItem("qeaseUserType");
    
    // Show toast
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to home
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/admin/dashboard" className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">Q-ease</span>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User size={20} />
              <span>{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminNavbar;
