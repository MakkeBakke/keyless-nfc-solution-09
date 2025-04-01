
import React, { useState } from 'react';
import { KeySquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (keyName: string, keyType: string) => void;
}

const AddKeyModal = ({ isOpen, onClose, onAdd }: AddKeyModalProps) => {
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState('Smart Lock');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyName.trim()) {
      onAdd(keyName, keyType);
      setKeyName('');
      setKeyType('Smart Lock');
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
              <KeySquare className="w-5 h-5 text-axiv-blue" />
            </div>
            <h2 className="text-xl font-medium">Add New Key</h2>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="key-name">
              Key Name
            </label>
            <input
              id="key-name"
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-axiv-blue/50"
              placeholder="e.g., Front Door"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="key-type">
              Key Type
            </label>
            <select
              id="key-type"
              value={keyType}
              onChange={(e) => setKeyType(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-axiv-blue/50"
            >
              <option>Smart Lock</option>
              <option>Car</option>
              <option>Office</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-axiv-dark hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 px-4 py-2 rounded-xl bg-axiv-blue text-white transition-all",
                "hover:bg-axiv-blue/90 active:scale-[0.98]"
              )}
            >
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKeyModal;
