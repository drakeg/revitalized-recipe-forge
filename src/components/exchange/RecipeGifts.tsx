
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecipeGift {
  id: string;
  giver_id: string;
  recipient_id: string;
  recipe_id: string;
  gift_message: string | null;
  is_opened: boolean;
  created_at: string;
  giver_profile: { username: string; first_name: string; last_name: string } | null;
  recipient_profile: { username: string; first_name: string; last_name: string } | null;
  recipe: { title: string } | null;
}

interface RecipeGiftsProps {
  session: Session | null;
}

const RecipeGifts: React.FC<RecipeGiftsProps> = ({ session }) => {
  const [gifts, setGifts] = useState<RecipeGift[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchGifts();
    }
  }, [session]);

  const fetchGifts = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_gifts')
        .select(`
          *,
          giver_profile:profiles!recipe_gifts_giver_id_fkey(username, first_name, last_name),
          recipient_profile:profiles!recipe_gifts_recipient_id_fkey(username, first_name, last_name),
          recipe:recipes(title)
        `)
        .or(`giver_id.eq.${session?.user?.id},recipient_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (error: any) {
      console.error('Error fetching gifts:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe gifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openGift = async (giftId: string) => {
    try {
      const { error } = await supabase
        .from('recipe_gifts')
        .update({ is_opened: true })
        .eq('id', giftId)
        .eq('recipient_id', session?.user?.id);

      if (error) throw error;

      toast({
        title: "Gift Opened! 🎁",
        description: "Enjoy your new recipe!",
      });

      fetchGifts();
    } catch (error: any) {
      console.error('Error opening gift:', error);
      toast({
        title: "Error",
        description: "Failed to open gift",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = (profile: any) => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.username || 'Unknown User';
  };

  if (loading) {
    return <div>Loading recipe gifts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-emerald-800">Recipe Gifts</h2>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Send Gift
        </Button>
      </div>

      <div className="space-y-4">
        {gifts.map((gift) => {
          const isReceived = gift.recipient_id === session?.user?.id;
          const otherUser = isReceived ? gift.giver_profile : gift.recipient_profile;
          
          return (
            <Card 
              key={gift.id}
              className={`${isReceived && !gift.is_opened ? 'border-pink-300 bg-pink-50' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift size={20} className={isReceived && !gift.is_opened ? 'text-pink-500' : 'text-gray-500'} />
                    {isReceived ? 'Gift from' : 'Gift to'}: {getDisplayName(otherUser)}
                  </CardTitle>
                  <div className="flex gap-2">
                    {isReceived && !gift.is_opened && (
                      <Badge className="bg-pink-100 text-pink-800 animate-pulse">
                        New Gift! 🎁
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {isReceived ? 'Received' : 'Sent'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Recipe:</p>
                  <p className="font-medium text-lg">{gift.recipe?.title}</p>
                </div>

                {gift.gift_message && (
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
                    <p className="text-sm text-gray-600">Gift Message:</p>
                    <p className="text-gray-800 italic">"{gift.gift_message}"</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {new Date(gift.created_at).toLocaleString()}
                </div>

                {isReceived && !gift.is_opened && (
                  <Button 
                    onClick={() => openGift(gift.id)}
                    className="w-full bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
                  >
                    <Heart size={16} />
                    Open Gift
                  </Button>
                )}

                {gift.is_opened && (
                  <Badge variant="secondary" className="w-full justify-center">
                    ✨ Gift Opened ✨
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {gifts.length === 0 && (
        <div className="text-center py-12">
          <Gift size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-4">No recipe gifts yet</h3>
          <p className="text-gray-500 mb-6">Spread joy by sharing your favorite recipes as gifts</p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus size={20} />
            Send Your First Recipe Gift
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeGifts;
