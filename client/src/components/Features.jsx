
import React from "react";
import { QrCode, Clock, Bell, Users } from "lucide-react";

const features = [
  {
    title: "QR Code Based Queuing",
    description: "Easily join queues by scanning a QR code or entering a unique code",
    icon: QrCode,
  },
  {
    title: "Real-time Wait Times",
    description: "Get accurate estimates of your waiting time based on queue status",
    icon: Clock,
  },
  {
    title: "Timely Notifications",
    description: "Receive notifications as your turn approaches, so you never miss your call",
    icon: Bell,
  },
  {
    title: "Efficient Management",
    description: "Administrators can easily manage queues and serve customers efficiently",
    icon: Users,
  },
];

const Features = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features that make queue management easy
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
