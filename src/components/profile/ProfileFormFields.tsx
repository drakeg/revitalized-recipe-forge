
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
}

interface ProfileFormFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({ formData, onInputChange }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => onInputChange("first_name", e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => onInputChange("last_name", e.target.value)}
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
          onChange={(e) => onInputChange("username", e.target.value)}
          placeholder="Enter your username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onInputChange("bio", e.target.value)}
          placeholder="Tell us a little about yourself..."
          rows={4}
        />
      </div>
    </>
  );
};

export default ProfileFormFields;
