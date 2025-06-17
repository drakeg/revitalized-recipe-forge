
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfileData } from "@/hooks/useProfileData";

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
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <ProfileHeader />
          <CardContent>
            <ProfileForm
              formData={formData}
              saving={saving}
              onInputChange={handleInputChange}
              onSubmit={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
