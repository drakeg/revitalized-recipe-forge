
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SwapRequest {
  id: string;
  requester_id: string;
  target_user_id: string;
  offered_recipe_id: string | null;
  requested_recipe_id: string | null;
  message: string | null;
  status: string;
  created_at: string;
  requester_profile: { username: string; first_name: string; last_name: string } | null;
  target_profile: { username: string; first_name: string; last_name: string } | null;
  offered_recipe: { title: string } | null;
  requested_recipe: { title: string } | null;
}

interface SwapRequestsProps {
  session: Session | null;
}

const SwapRequests: React.FC<SwapRequestsProps> = ({ session }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchSwapRequests();
    }
  }, [session]);

  const fetchSwapRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_swap_requests')
        .select(`
          *,
          requester_profile:profiles!recipe_swap_requests_requester_id_fkey(username, first_name, last_name),
          target_profile:profiles!recipe_swap_requests_target_user_id_fkey(username, first_name, last_name),
          offered_recipe:recipes!recipe_swap_requests_offered_recipe_id_fkey(title),
          requested_recipe:recipes!recipe_swap_requests_requested_recipe_id_fkey(title)
        `)
        .or(`requester_id.eq.${session?.user?.id},target_user_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSwapRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching swap requests:', error);
      toast({
        title: "Error",
        description: "Failed to load swap requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('recipe_swap_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Swap request ${status}`,
      });

      fetchSwapRequests();
    } catch (error: any) {
      console.error('Error updating swap request:', error);
      toast({
        title: "Error",
        description: "Failed to update swap request",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'declined':
        return <XCircle size={16} className="text-red-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayName = (profile: any) => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.username || 'Unknown User';
  };

  if (loading) {
    return <div>Loading swap requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-emerald-800">Recipe Swap Requests</h2>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          New Swap Request
        </Button>
      </div>

      <div className="space-y-4">
        {swapRequests.map((request) => {
          const isReceived = request.target_user_id === session?.user?.id;
          const otherUser = isReceived ? request.requester_profile : request.target_profile;
          
          return (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {isReceived ? 'Received' : 'Sent'} Swap Request
                  </CardTitle>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">
                    {isReceived ? 'From' : 'To'}: {getDisplayName(otherUser)}
                  </p>
                </div>

                {request.offered_recipe && (
                  <div>
                    <p className="text-sm text-gray-600">Offered Recipe:</p>
                    <p className="font-medium">{request.offered_recipe.title}</p>
                  </div>
                )}

                {request.requested_recipe && (
                  <div>
                    <p className="text-sm text-gray-600">Requested Recipe:</p>
                    <p className="font-medium">{request.requested_recipe.title}</p>
                  </div>
                )}

                {request.message && (
                  <div>
                    <p className="text-sm text-gray-600">Message:</p>
                    <p className="text-gray-800">{request.message}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </div>

                {isReceived && request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateRequestStatus(request.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateRequestStatus(request.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <Button 
                    size="sm"
                    onClick={() => updateRequestStatus(request.id, 'completed')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {swapRequests.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-4">No swap requests yet</h3>
          <p className="text-gray-500 mb-6">Start connecting with other users to exchange recipes</p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus size={20} />
            Create Your First Swap Request
          </Button>
        </div>
      )}
    </div>
  );
};

export default SwapRequests;
