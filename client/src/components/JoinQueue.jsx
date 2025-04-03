import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const JoinQueue = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('qr');
  const [queueId, setQueueId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinQueue = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qeaseAuthToken');
      const response = await axios.post('/api/queues/join', 
        { queueId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Joined queue successfully. Your estimated wait time is ${response.data.estimatedTime} minutes.`,
        });
        // You can add navigation to queue details page here
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setQueueId('');
    }
  };

  const handleQrScan = (data) => {
    if (data && !loading) {
      handleJoinQueue(data);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (queueId) {
      handleJoinQueue(queueId);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
          Join a Queue
        </CardTitle>
        <CardDescription>
          Scan a QR code or enter queue ID to join
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="qr">Scan QR Code</TabsTrigger>
            <TabsTrigger value="manual">Enter Queue ID</TabsTrigger>
          </TabsList>

          <TabsContent value="qr">
            <div className="aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border-2 border-dashed border-gray-200">
              <QrReader
                onResult={handleQrScan}
                constraints={{ facingMode: 'environment' }}
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Point your camera at a queue QR code
            </p>
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter Queue ID (e.g., Q-ABC123)"
                    value={queueId}
                    onChange={(e) => setQueueId(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-11"
                  disabled={!queueId || loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    'Join Queue'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JoinQueue; 