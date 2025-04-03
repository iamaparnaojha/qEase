
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "@/components/UserNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, Users, LogOut, ScanLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock joined queues - will be replaced with actual API calls to your Express/MongoDB backend
const initialJoinedQueues = [
  {
    id: "q-123456",
    name: "Customer Service",
    joinedAt: new Date(Date.now() - 20 * 60000),
    position: 4,
    totalUsers: 12,
    estimatedTimeMin: 15,
  },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queueCode, setQueueCode] = useState("");
  const [joinedQueues, setJoinedQueues] = useState(initialJoinedQueues);
  const [activeTab, setActiveTab] = useState("code");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem("qeaseAuthToken");
    const userType = localStorage.getItem("qeaseUserType");
    
    if (!token || userType !== "user") {
      toast({
        title: "Authentication Required",
        description: "Please login as a user to access this page.",
        variant: "destructive",
      });
      navigate("/user/login");
      return;
    }
    
    // This is where you would fetch joined queues from your Express/MongoDB backend
    // Example:
    // fetch('http://localhost:5000/api/user/queues', {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    // .then(res => res.json())
    // .then(data => setJoinedQueues(data))
    // .catch(err => console.error('Error fetching queues:', err));
  }, [navigate, toast]);

  const handleJoinByCode = (e) => {
    e.preventDefault();
    
    if (!queueCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid queue code",
        variant: "destructive",
      });
      return;
    }
    
    // Check if already joined this queue
    const alreadyJoined = joinedQueues.some(q => q.id === queueCode);
    if (alreadyJoined) {
      toast({
        title: "Already Joined",
        description: "You have already joined this queue",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app with Express/MongoDB backend, you would make an API call:
    // Example:
    // const token = localStorage.getItem("qeaseAuthToken");
    // fetch('http://localhost:5000/api/queues/join', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ queueCode })
    // })
    // .then(res => res.json())
    // .then(data => {
    //   if (data.success) {
    //     setJoinedQueues([...joinedQueues, data.queue]);
    //     setQueueCode("");
    //     toast({
    //       title: "Queue Joined",
    //       description: `You have successfully joined ${data.queue.name}`
    //     });
    //   } else {
    //     toast({
    //       title: "Error",
    //       description: data.message,
    //       variant: "destructive"
    //     });
    //   }
    // })
    // .catch(err => {
    //   toast({
    //     title: "Error",
    //     description: "Failed to join queue. Please try again.",
    //     variant: "destructive"
    //   });
    // });
    
    // For now, we'll simulate joining a queue
    let newQueue;
    if (queueCode === "q-123456") {
      newQueue = {
        id: "q-123456",
        name: "Customer Service",
        joinedAt: new Date(),
        position: 5,
        totalUsers: 12, 
        estimatedTimeMin: 20,
      };
    } else if (queueCode === "q-789012") {
      newQueue = {
        id: "q-789012",
        name: "Technical Support",
        joinedAt: new Date(),
        position: 3,
        totalUsers: 5,
        estimatedTimeMin: 30,
      };
    } else {
      toast({
        title: "Queue Not Found",
        description: "The queue code you entered does not exist",
        variant: "destructive",
      });
      return;
    }
    
    setJoinedQueues([...joinedQueues, newQueue]);
    setQueueCode("");
    
    toast({
      title: "Queue Joined",
      description: `You have successfully joined ${newQueue.name}`,
    });
  };

  const handleJoinByQR = () => {
    setIsScanning(true);
    
    // In a real implementation, this would activate the device camera for QR scanning
    // For now, we'll simulate a QR scan after 2 seconds
    toast({
      title: "QR Scanner Activated",
      description: "Camera would open here in the actual implementation",
    });
    
    // Simulated QR code scan result
    setTimeout(() => {
      setIsScanning(false);
      const scannedCode = "q-789012"; // This would be the result from the QR scanner
      
      // Check if already joined
      const alreadyJoined = joinedQueues.some(q => q.id === scannedCode);
      if (alreadyJoined) {
        toast({
          title: "Already Joined",
          description: "You have already joined this queue",
          variant: "destructive",
        });
        return;
      }
      
      // In real implementation, you would make an API call to your Express/MongoDB backend
      // For now, simulate joining
      const newQueue = {
        id: scannedCode,
        name: "Technical Support",
        joinedAt: new Date(),
        position: 3,
        totalUsers: 5,
        estimatedTimeMin: 30,
      };
      
      setJoinedQueues([...joinedQueues, newQueue]);
      
      toast({
        title: "Queue Joined via QR",
        description: `You have successfully joined ${newQueue.name}`,
      });
    }, 2000);
  };

  const handleLeaveQueue = (queueId) => {
    // In a real app with Express/MongoDB, you would make an API call
    // Example:
    // const token = localStorage.getItem("qeaseAuthToken");
    // fetch(`http://localhost:5000/api/queues/${queueId}/leave`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    // .then(res => res.json())
    // .then(data => {
    //   if (data.success) {
    //     const updatedQueues = joinedQueues.filter(q => q.id !== queueId);
    //     setJoinedQueues(updatedQueues);
    //     toast({
    //       title: "Queue Left",
    //       description: data.message
    //     });
    //   } else {
    //     toast({
    //       title: "Error",
    //       description: data.message,
    //       variant: "destructive"
    //     });
    //   }
    // })
    // .catch(err => {
    //   toast({
    //     title: "Error",
    //     description: "Failed to leave queue. Please try again.",
    //     variant: "destructive"
    //   });
    // });
    
    // For now, we'll simulate leaving a queue
    const updatedQueues = joinedQueues.filter(q => q.id !== queueId);
    setJoinedQueues(updatedQueues);
    
    toast({
      title: "Queue Left",
      description: "You have successfully left the queue",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Active Queues</h2>
            
            {joinedQueues.length === 0 ? (
              <Card className="bg-gray-100 border border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 mb-4">You haven't joined any queues yet.</p>
                  <p className="text-gray-500">Join a queue using the form on the right.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedQueues.map((queue) => (
                  <Card key={queue.id}>
                    <CardHeader className="bg-blue-50 pb-2">
                      <CardTitle>{queue.name}</CardTitle>
                      <CardDescription>
                        Joined at {new Date(queue.joinedAt).toLocaleTimeString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-500">Position</p>
                          <p className="font-semibold text-lg">{queue.position}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-500">Total Users</p>
                          <p className="font-semibold text-lg">{queue.totalUsers}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-500">Est. Wait</p>
                          <p className="font-semibold text-lg">{queue.estimatedTimeMin} min</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{
                            width: `${Math.max(5, 100 - (queue.position / queue.totalUsers * 100))}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t pt-3">
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleLeaveQueue(queue.id)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave Queue
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Join a Queue</CardTitle>
                <CardDescription>
                  Enter a code or scan a QR code to join a queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="code">Enter Code</TabsTrigger>
                    <TabsTrigger value="qr">Scan QR</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code">
                    <form onSubmit={handleJoinByCode} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="queueCode">Queue Code</Label>
                        <Input
                          id="queueCode"
                          placeholder="e.g. q-123456"
                          value={queueCode}
                          onChange={(e) => setQueueCode(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Join Queue
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="qr">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full flex flex-col items-center justify-center">
                        {isScanning ? (
                          <>
                            <ScanLine className="w-20 h-20 text-blue-600 animate-pulse mb-2" />
                            <p className="text-sm text-gray-500">Scanning QR code...</p>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-20 h-20 text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">QR Scanner will be activated</p>
                          </>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleJoinByQR}
                        disabled={isScanning}
                      >
                        {isScanning ? "Scanning..." : "Scan QR Code"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Estimated wait times are calculated based on your position and average service time.
                  </p>
                </div>
                <div className="flex items-start">
                  <QrCode className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Scan QR codes at establishments to quickly join their queues.
                  </p>
                </div>
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    You'll receive notifications as your turn approaches.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
