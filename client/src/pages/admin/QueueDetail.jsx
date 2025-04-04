import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Users, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";

// Set default base URL for axios
axios.defaults.baseURL = 'http://localhost:5001';

const QueueDetail = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queue, setQueue] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueueDetails = async () => {
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

      setRefreshing(true);
      console.log('Fetching queue details for ID:', queueId);
      
      const response = await axios.get(`/api/queues/${queueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Queue details response:', response.data);
      
      if (response.data.success) {
        const queueData = response.data.queue;
        console.log('Queue data:', queueData);
        console.log('Users in queue:', queueData.users);
        
        setQueue(queueData);
        // Ensure users is always an array and has required fields
        const formattedUsers = (queueData.users || []).map(user => ({
          ...user,
          status: user.status || 'waiting',
          joinedAt: user.joinedAt || new Date(),
          servedAt: user.servedAt,
          estimatedTime: user.estimatedTime || queueData.perUserTimeMin || 5
        }));
        
        console.log('Formatted users:', formattedUsers);
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching queue details:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch queue details",
        variant: "destructive",
      });
      if (error.response?.status === 404) {
        navigate("/admin/dashboard");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueueDetails();
    // Refresh queue details every 30 seconds
    const interval = setInterval(fetchQueueDetails, 30000);
    return () => clearInterval(interval);
  }, [queueId, navigate, toast]);

  const handleRemoveUser = async (userId) => {
    try {
      const token = localStorage.getItem("qeaseAuthToken");
      const response = await axios.post(`/api/queues/${queueId}/remove-user`, 
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        toast({
          title: "Success",
          description: "User removed from queue successfully",
        });
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const handleServeUser = async (userId) => {
    try {
      const token = localStorage.getItem("qeaseAuthToken");
      const response = await axios.post(`/api/queues/${queueId}/serve-user`, 
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === userId 
            ? { ...user, status: 'served' }
            : user
        ));
        toast({
          title: "Success",
          description: "User marked as served",
        });
      }
    } catch (error) {
      console.error('Error serving user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to serve user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/dashboard")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Loading queue details...</h1>
          </div>
          <div className="flex justify-center items-center py-16">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!queue || !users) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/dashboard")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Queue not found</h1>
          </div>
        </main>
      </div>
    );
  }

  const waitingUsers = users.filter(user => user.status === 'waiting') || [];
  const servedUsers = users.filter(user => user.status === 'served') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/dashboard")}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">{queue.name}</h1>
          </div>
          <Button 
            variant="outline"
            onClick={fetchQueueDetails}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Waiting Users
                  <span className="text-sm font-normal text-gray-500">
                    {waitingUsers.length} users waiting
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waitingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users waiting in this queue.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Joined At</TableHead>
                        <TableHead>Est. Wait</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitingUsers.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{user.userId}</TableCell>
                          <TableCell>
                            {new Date(user.joinedAt).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{user.estimatedTime} min</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleServeUser(user._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Serve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRemoveUser(user._id)}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Served Users
                  <span className="text-sm font-normal text-gray-500">
                    {servedUsers.length} users served
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users have been served yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Joined At</TableHead>
                        <TableHead>Served At</TableHead>
                        <TableHead>Wait Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servedUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.userId}</TableCell>
                          <TableCell>
                            {new Date(user.joinedAt).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            {new Date(user.servedAt).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            {Math.round((new Date(user.servedAt) - new Date(user.joinedAt)) / 60000)} min
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Queue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Time per user</p>
                    <p className="font-semibold">{queue.perUserTimeMin} min</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Total users</p>
                    <p className="font-semibold">{users.length}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Queue QR Code</p>
                  <div className="flex justify-center">
                    <img 
                      src={queue.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 border border-gray-200" 
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Queue ID</p>
                  <p className="font-mono text-sm select-all">{queue.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueDetail;
