
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Smart Queue Management System
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Q-ease helps businesses manage queues efficiently while providing
              customers with real-time updates and estimated waiting times.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/user/login")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                Join as User
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/admin/login")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                Join as Admin
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-10">
            <img
              src="/queue-illustration.svg"
              alt="Queue Management"
              className="w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = "https://placehold.co/600x400/e2e8f0/1e40af?text=Q-ease";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
