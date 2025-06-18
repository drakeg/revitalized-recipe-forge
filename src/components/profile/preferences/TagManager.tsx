
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagManagerProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  variant?: "secondary" | "destructive" | "default" | "outline";
}

const TagManager: React.FC<TagManagerProps> = ({ 
  items, 
  onAdd, 
  onRemove, 
  placeholder, 
  variant = "secondary" 
}) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant} className="flex items-center gap-1">
            {item}
            <X 
              size={14} 
              className="cursor-pointer" 
              onClick={() => onRemove(item)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagManager;
