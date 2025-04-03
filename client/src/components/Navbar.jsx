
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">Q-ease</span>
        </Link>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/user/login")}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            Join as User
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/login")}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            Join as Admin
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
