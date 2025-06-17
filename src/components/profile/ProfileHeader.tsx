
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

const ProfileHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Edit Profile
      </CardTitle>
      <CardDescription>
        Update your personal information and preferences
      </CardDescription>
    </CardHeader>
  );
};

export default ProfileHeader;
