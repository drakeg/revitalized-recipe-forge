
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import PreferenceSection from "./preferences/PreferenceSection";
import SkillLevelSelect from "./preferences/SkillLevelSelect";
import TimePreferenceSelect from "./preferences/TimePreferenceSelect";
import TagManager from "./preferences/TagManager";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface UserPreferencesProps {
  session: Session | null;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ session }) => {
  const {
    preferences,
    loading,
    saving,
    handleSave,
    updatePreference,
    addArrayItem,
    removeArrayItem,
  } = useUserPreferences(session);

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <PreferenceSection title="Cooking Skill Level">
        <SkillLevelSelect
          value={preferences.cooking_skill_level}
          onValueChange={(value) => updatePreference('cooking_skill_level', value)}
        />
      </PreferenceSection>

      <PreferenceSection title="Cooking Time Preference">
        <TimePreferenceSelect
          value={preferences.cooking_time_preference}
          onValueChange={(value) => updatePreference('cooking_time_preference', value)}
        />
      </PreferenceSection>

      <PreferenceSection title="Dietary Restrictions">
        <TagManager
          items={preferences.dietary_restrictions}
          onAdd={(item) => addArrayItem('dietary_restrictions', item)}
          onRemove={(item) => removeArrayItem('dietary_restrictions', item)}
          placeholder="Add dietary restriction"
          variant="secondary"
        />
      </PreferenceSection>

      <PreferenceSection title="Preferred Cuisines">
        <TagManager
          items={preferences.preferred_cuisines}
          onAdd={(item) => addArrayItem('preferred_cuisines', item)}
          onRemove={(item) => removeArrayItem('preferred_cuisines', item)}
          placeholder="Add preferred cuisine"
          variant="secondary"
        />
      </PreferenceSection>

      <PreferenceSection title="Allergens to Avoid">
        <TagManager
          items={preferences.allergens}
          onAdd={(item) => addArrayItem('allergens', item)}
          onRemove={(item) => removeArrayItem('allergens', item)}
          placeholder="Add allergen to avoid"
          variant="destructive"
        />
      </PreferenceSection>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
};

export default UserPreferences;
