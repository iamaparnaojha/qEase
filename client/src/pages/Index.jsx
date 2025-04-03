import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <Features />
      <div className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our platform and experience seamless queue management. Choose your role to begin.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-lg mx-auto">
            <Button 
              size="lg" 
              onClick={() => navigate("/user/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Join as User</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/admin/login")}
              className="bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Join as Admin</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM8 10a4 4 0 00-3.93 3.17A1 1 0 005 14h10a1 1 0 00.93-.83A4 4 0 0012 10H8z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
