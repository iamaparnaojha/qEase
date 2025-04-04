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
import axios from "axios";

// Set default base URL for axios
axios.defaults.baseURL = 'http://localhost:5001';

// Set default headers if token exists
const token = localStorage.getItem("qeaseAuthToken");
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

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
  const [queueId, setQueueId] = useState("");
  const [joinedQueues, setJoinedQueues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJoinedQueues = async () => {
      try {
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

        // Update axios headers with current token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user's joined queues
        const response = await axios.get('/api/queues/joined');
        console.log('Joined queues response:', response.data);
        
        if (response.data.success) {
          setJoinedQueues(response.data.queues);
        }
      } catch (error) {
        console.error('Error fetching joined queues:', error);
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("qeaseAuthToken");
          localStorage.removeItem("qeaseUserType");
          navigate("/user/login");
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch your queues. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    };

    fetchJoinedQueues();

    // Set up interval to refresh queue data every 30 seconds
    const interval = setInterval(fetchJoinedQueues, 30000);
    return () => clearInterval(interval);
  }, [navigate, toast]);

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    
    if (!queueId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid queue ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Update axios headers with current token
      const token = localStorage.getItem("qeaseAuthToken");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to join a queue.",
          variant: "destructive",
        });
        navigate("/user/login");
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Joining queue with ID:', queueId.trim());
      
      // Join the queue
      const joinResponse = await axios.post('/api/queues/join', {
        queueId: queueId.trim()
      });
      
      console.log('Join response:', joinResponse.data);
      
      if (joinResponse.data.success) {
        const queue = joinResponse.data.queue;
        setJoinedQueues(prev => [...prev, queue]);
        setQueueId("");
        toast({
          title: "Success",
          description: `Successfully joined ${queue.name}! Your position: ${queue.userPosition}`,
        });
      }
    } catch (error) {
      console.error('Error joining queue:', error.response || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to join queue. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("qeaseAuthToken");
        localStorage.removeItem("qeaseUserType");
        navigate("/user/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async (queueId) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`/api/queues/${queueId}/leave`);
      
      if (response.data.success) {
        setJoinedQueues(prev => prev.filter(q => q.id !== queueId));
        toast({
          title: "Queue Left",
          description: "You have successfully left the queue",
        });
      }
    } catch (error) {
      console.error('Error leaving queue:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                          <p className="text-sm text-gray-500">Total Waiting</p>
                          <p className="font-semibold text-lg">{queue.totalWaiting}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-500">Est. Wait</p>
                          <p className="font-semibold text-lg">{queue.estimatedTime} min</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{
                            width: `${Math.max(5, 100 - (queue.position / queue.totalWaiting * 100))}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t pt-3">
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleLeaveQueue(queue.id)}
                        disabled={loading}
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
                  Enter a queue ID to join
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinQueue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="queueId">Queue ID</Label>
                    <Input
                      id="queueId"
                      placeholder="e.g. Q-123456"
                      value={queueId}
                      onChange={(e) => setQueueId(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join Queue"}
                  </Button>
                </form>
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
