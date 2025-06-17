
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_paid: boolean;
}

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
}

export const useProfileData = (session: Session | null) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [session, navigate]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          phone: data.phone || "",
        });
      } else {
        // Create a new profile if it doesn't exist
        const newProfile = {
          id: session.user.id,
          username: session.user.email || "",
          first_name: "",
          last_name: "",
          bio: "",
          phone: "",
          avatar_url: null,
          is_paid: false,
        };
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile]);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast.error("Failed to create profile");
        } else {
          setProfile(newProfile);
          setFormData({
            username: newProfile.username,
            first_name: newProfile.first_name,
            last_name: newProfile.last_name,
            bio: newProfile.bio,
            phone: newProfile.phone,
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username || null,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          bio: formData.bio || null,
          phone: formData.phone || null,
        })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
        // Refresh the profile data
        fetchProfile();
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    formData,
    handleInputChange,
    handleSave,
  };
};
