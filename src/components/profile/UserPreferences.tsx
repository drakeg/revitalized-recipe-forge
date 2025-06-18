
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserPreferencesProps {
  session: Session | null;
}

interface Preferences {
  dietary_restrictions: string[];
  cooking_skill_level: string;
  preferred_cuisines: string[];
  cooking_time_preference: string;
  allergens: string[];
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ session }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    dietary_restrictions: [],
    cooking_skill_level: '',
    preferred_cuisines: [],
    cooking_time_preference: '',
    allergens: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRestriction, setNewRestriction] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          cooking_skill_level: data.cooking_skill_level || '',
          preferred_cuisines: data.preferred_cuisines || [],
          cooking_time_preference: data.cooking_time_preference || '',
          allergens: data.allergens || [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: keyof Pick<Preferences, 'dietary_restrictions' | 'preferred_cuisines' | 'allergens'>, value: string) => {
    if (value.trim() && !preferences[field].includes(value.trim())) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: keyof Pick<Preferences, 'dietary_restrictions' | 'preferred_cuisines' | 'allergens'>, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Cooking Skill Level</Label>
        <Select
          value={preferences.cooking_skill_level}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, cooking_skill_level: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-semibold">Cooking Time Preference</Label>
        <Select
          value={preferences.cooking_time_preference}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, cooking_time_preference: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your time preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quick">Quick (< 30 min)</SelectItem>
            <SelectItem value="medium">Medium (30-60 min)</SelectItem>
            <SelectItem value="long">Long (> 60 min)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-semibold">Dietary Restrictions</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newRestriction}
            onChange={(e) => setNewRestriction(e.target.value)}
            placeholder="Add dietary restriction"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addItem('dietary_restrictions', newRestriction);
                setNewRestriction('');
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addItem('dietary_restrictions', newRestriction);
              setNewRestriction('');
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {preferences.dietary_restrictions.map((restriction) => (
            <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
              {restriction}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => removeItem('dietary_restrictions', restriction)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Preferred Cuisines</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newCuisine}
            onChange={(e) => setNewCuisine(e.target.value)}
            placeholder="Add preferred cuisine"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addItem('preferred_cuisines', newCuisine);
                setNewCuisine('');
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addItem('preferred_cuisines', newCuisine);
              setNewCuisine('');
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {preferences.preferred_cuisines.map((cuisine) => (
            <Badge key={cuisine} variant="secondary" className="flex items-center gap-1">
              {cuisine}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => removeItem('preferred_cuisines', cuisine)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Allergens to Avoid</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            placeholder="Add allergen to avoid"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addItem('allergens', newAllergen);
                setNewAllergen('');
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addItem('allergens', newAllergen);
              setNewAllergen('');
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {preferences.allergens.map((allergen) => (
            <Badge key={allergen} variant="destructive" className="flex items-center gap-1">
              {allergen}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => removeItem('allergens', allergen)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
};

export default UserPreferences;
