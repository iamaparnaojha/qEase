
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white via-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <span className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500 tracking-tight">
                Q
              </span>
              <span className="text-6xl font-light bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500">
                ease
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Smart Queue <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                Management System
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Transform your waiting experience with real-time updates and intelligent queue management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/user/login")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition-all duration-200 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
              >
                Join as User
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/admin/login")}
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl"
              >
                Join as Admin
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl transform rotate-3"></div>
              <img
                src="/queue-illustration.svg"
                alt="Queue Management"
                className="relative w-full h-auto rounded-2xl shadow-2xl transform transition-transform hover:-translate-y-2 duration-300"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400/e2e8f0/1e40af?text=Q-ease";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;



