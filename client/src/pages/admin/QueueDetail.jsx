
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

// Mock users data
const initialUsers = [
  { id: "u1", name: "John Doe", joinedAt: new Date(Date.now() - 30 * 60000), phone: "+1234567890" },
  { id: "u2", name: "Jane Smith", joinedAt: new Date(Date.now() - 25 * 60000), phone: "+1987654321" },
  { id: "u3", name: "Michael Johnson", joinedAt: new Date(Date.now() - 20 * 60000), phone: "+1122334455" },
  { id: "u4", name: "Emily Williams", joinedAt: new Date(Date.now() - 15 * 60000), phone: "+1555666777" },
  { id: "u5", name: "Robert Brown", joinedAt: new Date(Date.now() - 10 * 60000), phone: "+1999888777" },
];

// Mock queues data
const queuesData = {
  "q-123456": {
    id: "q-123456",
    name: "Customer Service",
    perUserTimeMin: 5,
    createdAt: new Date(),
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOFSURBVO3BQY4bQQwDwexB/f/Leh3kkScBDG2NZciZfmCMZYxljGWMZYxljGWMZYxljGWMZYxljGWMZYxljGWMZYzl4qGQ8JNU3EnIL1LxRMKTik9K+EkVT4yxjLGMsYyxXHxZxTclPCnhExW3En5TxTclfFPFN42xjLGMsYyxXLwsIb+o4omKJxKaCk3CEwlNwpOKWwlNwi9KeGKMZYxljGWM5eI/JqGp0CQ0FU3C/9kYyxjLGMsYy8V/TEWTcKeiqbhT8V8yxjLGMsYyxnLxsop/SUJToUn4SRWfSPhJFf8lYyxjLGMsYywXX5bwkypuJTQVmoQm4Y6EpkKTcEfCnYpvSvimMZYxljGWMZaLhyr+TRW3Eu5UNAl3KjQJTYUm4ZOKf9MYyxjLGMsYy8VDCX+TiicS7lQ0CXcqNAlNQlPxScI3VTwxxjLGMsYyxnLxUEWTcCehqdAkfFLRJGgSmgpNwp2KJuFOxScVTcKTijsJdzQVTzTGMsYyxjLGcvGQhKaiqWgSmopPEu5UfJLQVGgS7lQ0CXcqNAlNRZPQVHxSwjdVNAmaiiZBU9EkNMYyxjLGMsZy8VBFk6BJuJXQVNyp0CQ8kXCnQpPQJDypaCo0CU3FJ2gqngm/qOKJMZYxljGWMZaLh0LCHQlNhSahSfhEwhMVTcITFZqEpkKT0CQ0FU3CJxJ+UkVT8cQYyxjLGMsYy8VDFXcSmoQmoanoJDxRoUloEpqKpkKTcKeiqWgSmgRNQlNxR0JT0VR8U8UTYyxjLGMsYyx8JKGp+EkJTYUm4U6FJqFJaCqaCk2CpkKT0FRoKjQJTcUdCb9Jwh0JTUVjLGMsYyxjLBcPSXiiokloEjQJb0poKjQJTcU3JdypeFPCv6niE2MsYyxjLGMsFw9VNAl3Eu5UfFPCnYqm4k5CU6FJaCruJNypuJPQVGgSmoRvqtAkNAl3xljGWMZYxlguHgoJP0nCnYo7CU3FExWahDsJTcKdCk1Ck3An4U7FExV3Eu6MsYyxjLGMsVx8WcU3JTQVTUJToUn4RMWdhE8kNBV3JDQVTyR8U0VT0SQ0FY2xjLGMsYyxXLwsIb+o4hMJTcUnKt5UoUloEpoKTUInoUn4RRWdhCfGWMZYxljGWC7+YxKaiiZBk9BUfFLRSWgqNAmaCk3CnYS/qeJNYyxjLGMsYywX/zEVTcKdhKbijgRNRSdBk/CJhDsVn1Q0CU3FJ2MsYyxjLGMsFy+r+Jck3KloEpoKTcITCU2FJqGp0CTcSbhT8UTCk4qm4pMxljGWMZYxlouXJfzDKpqEJuGThCcqPkn4TRVNwicVTcITYyxjLGMsYyz8wBjLGMsYyxjLGMsYyxjLGMsYyxjLGMsYyxjLGMsYyxjLGMsYy/+kZW/fEsWl1QAAAABJRU5ErkJggg==",
  },
  "q-789012": {
    id: "q-789012",
    name: "Technical Support",
    perUserTimeMin: 10,
    createdAt: new Date(Date.now() - 3600000),
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAANjSURBVO3BQY4kwQkDweyB/v/L1h7MqQJIzEsnMsz0A2tMY4xpjDGNMaYxxjTGmMYY0xhjGmNMY4xpjDGNMaYxxpjG8OCQEJ+k4k7CL6p4knBT8UkJn1TxxBhjGmNMY4zpwZdVfFPCk4QbCU1FJ+GThBsJTcU3JXxTxTeNMaYxxjTGmB68LOEXVTxJuEl4UvEk4SbhRkJTcVPxJOEXJTwxxpjGGNMYY3rwP5PQVGgqmoQbCTcVTcL/2RhjGmNMY4zpwf/ZyybhRsJNxZOE/7IxxjTGmMYY04OXVfxLEjQJN5+UoEm4SWgSniTcJNxUfFLCL6p40xhjGmNMY4zpwZcl/KKK75LQVDQJNwlNRZPwJOEm4SbhpuKbEr5pjDGNMaYxpvTgsMpfp6JJuKloEm4qmoSbhJuKJqFJuEloEm4qmoQnFW8aY0xjjGmMMT04JMQnVTQJNxVNQpNwU9EkNAk3FU3CTcWThCbhpuJJRZNwl9BUNAlNRZPQVDQJjTGmMcY0xpgePDgkNBVNwk1Fk/BJCTcVmoSbiiahSdhKaBI6CTcVTUKT8KRCk9AkNAlNRZPQGGMaY0xjTOnBoQpNwl2CJqGpaBI6CTcJmoQnCU1Fk9BJuEloKjQJNxWdhE8SNAmaiiahqWgSbsYY0xhjGmNKD15W0SQ0CZqEpuIu4aaiqWgSNAmaijcl3FTcVGgSmopPSviliiahSWiMMY0xpjGmBw8OCU1Fk9BUNAk3CU3FXcJNRZPQJNwk3FQ0CU3CTUWTcJOgSWgqNAl3CTcVTcKTiidjjGmMMY0xpQeHhJuKJqFJ0CQ0FZqETsJNRZPQJGgSmoqbBE1CU9FJuEm4qWgSbhKaiqaiSbhLaBKahMYY0xhjGmNKDw4JTcUvStAk3CQ0FZqEpoRPqrhJaCqaCk3CJyX8ooQmoaloKpqExhjTGGMaY0oPDgk3CU8qNAmaiqZCk9AkNBVNQpPQVDQJNwlNRZNwk9BUdBKahJuEpqJJaBKahG8aY0xjjGmMKT04JMQnJdxUPEm4qbipaBI0FZqEm4SbhJuKJuEm4ZMqPkm4qbgZY0xjjGmM6cGXVXxTwk3FJyXcVLwpoanoJDQJTUVToUnoJDQJv6iiSXgyxpjGGNMYU3rwsoRflNBUfFLFm1dNgiahqWgSmoqmQpPQSTip+KTCJ40xpjHGNMaUHvyXJTQVTUKT0FQ0CZqKJkGT0FQ0CZ2EpuKThE+qeFPFzRhjGmNMY0zpwX9MRZNwk9BUNAl3CZqKmwRNwicJNxVNQlPRJNwkNBVvGmNMY4xpjCk9eFnFvyThpqJJaCqahCcJnYqbhKbiTQlPKpqEmzHGNMaYxpjevCzhF1U8SbhJ0CQ0CU3CTUUn4RdVNAmfVDQJT8YY0xhjGmNKP7DGNMaYxhjTGGMaY0xjjGmMMaYxxjTGmMaYxhjTGGMaY0xjjGn8B1ZCFwWXrL9nAAAAAElFTkSuQmCC",
  },
};

const QueueDetail = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queue, setQueue] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem("qeaseAuthToken");
    const userType = localStorage.getItem("qeaseUserType");
    
    if (!token || userType !== "admin") {
      toast({
        title: "Authentication Required",
        description: "Please login as an admin to access this page.",
        variant: "destructive",
      });
      navigate("/admin/login");
      return;
    }
    
    // Here we would fetch the queue details and users from API
    // Simulating API call with setTimeout
    setIsLoading(true);
    setTimeout(() => {
      const queueData = queuesData[queueId];
      
      if (!queueData) {
        toast({
          title: "Queue Not Found",
          description: "The requested queue could not be found.",
          variant: "destructive",
        });
        navigate("/admin/dashboard");
        return;
      }
      
      setQueue(queueData);
      setIsLoading(false);
    }, 500);
  }, [queueId, navigate, toast]);

  const handleServeUser = (userId) => {
    // In a real app, we would make an API call to update the user status
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    toast({
      title: "User Served",
      description: "The user has been successfully served and removed from the queue.",
    });
  };

  const handleRemoveUser = (userId) => {
    // In a real app, we would make an API call to remove the user from the queue
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    toast({
      title: "User Removed",
      description: "The user has been removed from the queue.",
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Queue Users</CardTitle>
                <CardDescription>
                  Manage users currently in the queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users in this queue yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Joined At</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            {new Date(user.joinedAt).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleServeUser(user.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Serve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRemoveUser(user.id)}
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
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    // This would be a share function in a real app
                    toast({
                      title: "QR Code Shared",
                      description: "Queue QR code has been shared successfully.",
                    });
                  }}
                >
                  Share QR Code
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueDetail;
