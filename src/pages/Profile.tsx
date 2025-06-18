
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import UserPreferences from "@/components/profile/UserPreferences";
import { useProfileData } from "@/hooks/useProfileData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileProps = {
  session: Session | null;
};

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const {
    loading,
    saving,
    formData,
    handleInputChange,
    handleSave,
  } = useProfileData(session);

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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <ProfileHeader />
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="preferences">Cooking Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileForm
                  formData={formData}
                  saving={saving}
                  onInputChange={handleInputChange}
                  onSubmit={handleSave}
                />
              </TabsContent>
              
              <TabsContent value="preferences">
                <UserPreferences session={session} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
