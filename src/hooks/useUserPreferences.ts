
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Preferences {
  dietary_restrictions: string[];
  cooking_skill_level: string;
  preferred_cuisines: string[];
  cooking_time_preference: string;
  allergens: string[];
}

export const useUserPreferences = (session: Session | null) => {
  const [preferences, setPreferences] = useState<Preferences>({
    dietary_restrictions: [],
    cooking_skill_level: '',
    preferred_cuisines: [],
    cooking_time_preference: '',
    allergens: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const updatePreference = (field: keyof Preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof Pick<Preferences, 'dietary_restrictions' | 'preferred_cuisines' | 'allergens'>, value: string) => {
    if (value.trim() && !preferences[field].includes(value.trim())) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof Pick<Preferences, 'dietary_restrictions' | 'preferred_cuisines' | 'allergens'>, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  return {
    preferences,
    loading,
    saving,
    handleSave,
    updatePreference,
    addArrayItem,
    removeArrayItem,
  };
};
