import React, { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Users, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newQueue, setNewQueue] = useState({
    name: "",
    perUserTimeMin: 5,
  });

  // Fetch queues on component mount
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const token = localStorage.getItem("qeaseAuthToken");
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please login as an admin to access this page.",
            variant: "destructive",
          });
          navigate("/admin/login");
          return;
        }

        const response = await axios.get('/api/queues/admin/queues', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setQueues(response.data.queues);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch queues",
          variant: "destructive",
        });
        if (error.response?.status === 401) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, [navigate, toast]);

  const handleCreateQueue = async (e) => {
    e.preventDefault();
    
    if (!newQueue.name) {
      toast({
        title: "Error",
        description: "Please provide a queue name",
        variant: "destructive",
      });
      return;
    }

    if (!newQueue.perUserTimeMin || newQueue.perUserTimeMin < 1) {
      toast({
        title: "Error",
        description: "Time per user must be at least 1 minute",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setCreating(true);
      const token = localStorage.getItem("qeaseAuthToken");
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login again to create a queue",
          variant: "destructive",
        });
        navigate("/admin/login");
        return;
      }

      const response = await axios.post('/api/queues/create', 
        {
          name: newQueue.name.trim(),
          perUserTimeMin: parseInt(newQueue.perUserTimeMin)
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setQueues(prevQueues => [...prevQueues, response.data.queue]);
        setNewQueue({ name: "", perUserTimeMin: 5 });
        
        toast({
          title: "Success",
          description: `Successfully created ${response.data.queue.name} queue.`,
        });
      }
    } catch (error) {
      console.error('Queue creation error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQueue((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewQueue = (queueId) => {
    navigate(`/admin/queue/${queueId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Queue Management</h2>
            
            {queues.length === 0 ? (
              <Card className="bg-gray-100 border border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 mb-4">You haven't created any queues yet.</p>
                  <p className="text-gray-500">Create your first queue using the form on the right.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {queues.map((queue) => (
                  <Card key={queue.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-800">{queue.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(queue.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Users</p>
                            <p className="font-semibold">{queue.usersCount}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Time per user</p>
                            <p className="font-semibold">{queue.perUserTimeMin} min</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center mb-4">
                        <div className="relative group">
                          <img 
                            src={queue.qrCode} 
                            alt="QR Code" 
                            className="w-32 h-32 border border-gray-200 rounded-lg transition-transform group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <QrCode className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-center text-gray-500 mb-4 font-mono">
                        Queue ID: {queue.id}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t pt-3">
                      <Button 
                        variant="ghost" 
                        className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-300"
                        onClick={() => handleViewQueue(queue.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Queue
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                  Create New Queue
                </CardTitle>
                <CardDescription>
                  Create a queue for your customers to join
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateQueue}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Queue Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Customer Support"
                      required
                      value={newQueue.name}
                      onChange={handleInputChange}
                      className="h-11"
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perUserTimeMin" className="text-sm font-medium">
                      Average Time Per User (minutes)
                    </Label>
                    <Input
                      id="perUserTimeMin"
                      name="perUserTimeMin"
                      type="number"
                      min="1"
                      required
                      value={newQueue.perUserTimeMin}
                      onChange={handleInputChange}
                      className="h-11"
                      disabled={creating}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-11 font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                    disabled={creating}
                  >
                    {creating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Queue'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
