
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileFormFields from "./ProfileFormFields";

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
}

interface ProfileFormProps {
  formData: FormData;
  saving: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  formData, 
  saving, 
  onInputChange, 
  onSubmit 
}) => {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProfileFormFields formData={formData} onInputChange={onInputChange} />
      
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
  );
};

export default ProfileForm;
