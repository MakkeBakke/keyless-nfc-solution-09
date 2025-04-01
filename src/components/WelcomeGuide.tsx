
import React from 'react';
import { motion } from 'framer-motion';
import { Key, Smartphone, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const WelcomeGuide = ({ onClose }: { onClose: () => void }) => {
  const steps = [
    {
      icon: <Key className="w-6 h-6 text-white" />,
      title: "Manage Your Keys",
      description: "Add and control all your digital keys in one place"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-white" />,
      title: "Pair Devices",
      description: "Connect your NFC-enabled smart locks and devices"
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Instant Access",
      description: "Lock and unlock with a single tap, anytime, anywhere"
    }
  ];

  return (
    <motion.div 
      className="glass-card p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-medium mb-3">Welcome to Axiv</h2>
        <p className="text-axiv-gray text-sm">Your smart key management system</p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mr-4",
              "bg-axiv-blue shadow-md"
            )}>
              {step.icon}
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">{step.title}</h3>
              <p className="text-sm text-axiv-gray">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onClose}
        className="w-full py-3 bg-axiv-blue text-white rounded-lg flex items-center justify-center hover:bg-axiv-blue/90 transition-colors shadow-sm"
      >
        Get Started <ArrowRight className="ml-2 w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default WelcomeGuide;
