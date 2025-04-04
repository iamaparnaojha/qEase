import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, QrCode, Trash2 } from "lucide-react";

const QueueCard = ({ queue, onEndQueue, onDeleteQueue }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <span>{queue.name}</span>
          <span className="text-sm font-normal text-gray-500">ID: {queue.id}</span>
        </CardTitle>
        <CardDescription>
          {queue.usersCount} users waiting • {queue.perUserTimeMin} min/user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Queue Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              Created {new Date(queue.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              {queue.usersCount} in queue
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <QrCode className="w-6 h-6 text-blue-600 mb-1" />
          {queue.qrCode ? (
            <img 
              src={queue.qrCode} 
              alt="Queue QR Code"
              className="w-32 h-32"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-500">No QR Code</span>
            </div>
          )}
          <span className="text-sm text-gray-500">Scan to join queue</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="destructive" 
          className="w-1/2"
          onClick={() => onEndQueue(queue.id)}
        >
          End Queue
        </Button>
        <Button
          variant="outline"
          className="w-1/2 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDeleteQueue(queue.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Queue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QueueCard; 