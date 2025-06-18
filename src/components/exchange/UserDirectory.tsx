
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, ArrowRightLeft, Gift, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  preferences?: {
    dietary_restrictions: string[];
    cooking_skill_level: string;
    preferred_cuisines: string[];
    cooking_time_preference: string;
    allergens: string[];
  };
  recipe_count?: number;
}

interface UserDirectoryProps {
  session: Session | null;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ session }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_preferences(dietary_restrictions, cooking_skill_level, preferred_cuisines, cooking_time_preference, allergens),
          recipes(count)
        `)
        .neq('id', session?.user?.id)
        .limit(50);

      if (error) throw error;

      const usersWithCount = data?.map(user => ({
        ...user,
        preferences: user.user_preferences?.[0] || null,
        recipe_count: user.recipes?.length || 0
      })) || [];

      setUsers(usersWithCount);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: UserProfile) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username || 'Anonymous User';
  };

  const filteredUsers = users.filter(user => {
    const name = getDisplayName(user).toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || 
           user.bio?.toLowerCase().includes(search) ||
           user.preferences?.preferred_cuisines?.some(cuisine => 
             cuisine.toLowerCase().includes(search)
           );
  });

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <h2 className="text-2xl font-semibold text-emerald-800">Find Cooking Enthusiasts</h2>
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, bio, or cuisine..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                {getDisplayName(user)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && (
                <p className="text-gray-600 text-sm">{user.bio}</p>
              )}

              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  {user.recipe_count} recipes shared
                </div>

                {user.preferences?.cooking_skill_level && (
                  <Badge variant="outline">
                    {user.preferences.cooking_skill_level} cook
                  </Badge>
                )}

                {user.preferences?.preferred_cuisines && user.preferences.preferred_cuisines.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Cuisines:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.preferences.preferred_cuisines.slice(0, 3).map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                      {user.preferences.preferred_cuisines.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.preferences.preferred_cuisines.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {user.preferences?.dietary_restrictions && user.preferences.dietary_restrictions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dietary Restrictions:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.preferences.dietary_restrictions.slice(0, 2).map((restriction) => (
                        <Badge key={restriction} variant="outline" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                      {user.preferences.dietary_restrictions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.preferences.dietary_restrictions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" variant="outline" className="flex-1 flex items-center gap-1">
                  <MessageCircle size={14} />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ArrowRightLeft size={14} />
                  Swap
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Gift size={14} />
                  Gift
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-4">
            {searchTerm ? 'No users found' : 'No users to display'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Check back later as more users join the community'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;
