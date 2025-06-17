
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
import Navbar from "@/components/Navbar";

type ProfileProps = {
  session: Session | null;
};

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

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar 
          loggedIn={!!session} 
          userEmail={session?.user?.email} 
          session={session} 
        />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar 
        loggedIn={!!session} 
        userEmail={session?.user?.email} 
        session={session} 
      />
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
