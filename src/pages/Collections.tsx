
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Globe, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Collection {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_collaborative: boolean;
  created_at: string;
  recipe_count?: number;
}

interface CollectionsProps {
  session: Session | null;
}

const Collections: React.FC<CollectionsProps> = ({ session }) => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    is_public: false,
    is_collaborative: false,
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
    fetchCollections();
  }, [session, navigate]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_collections')
        .select(`
          *,
          recipe_collection_items(count)
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCount = data?.map(collection => ({
        ...collection,
        recipe_count: collection.recipe_collection_items?.length || 0
      })) || [];

      setCollections(collectionsWithCount);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!session?.user?.id || !newCollection.title.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('recipe_collections')
        .insert({
          user_id: session.user.id,
          title: newCollection.title.trim(),
          description: newCollection.description.trim() || null,
          is_public: newCollection.is_public,
          is_collaborative: newCollection.is_collaborative,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection created successfully!",
      });

      setNewCollection({
        title: '',
        description: '',
        is_public: false,
        is_collaborative: false,
      });
      setIsCreateModalOpen(false);
      fetchCollections();
    } catch (error: any) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
        <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading collections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Recipe Collections</h1>
            <p className="text-emerald-600 mt-2">Organize and share your favorite recipes</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={20} />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newCollection.title}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Collection title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your collection"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Make public</Label>
                  <Switch
                    id="public"
                    checked={newCollection.is_public}
                    onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, is_public: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="collaborative">Allow collaboration</Label>
                  <Switch
                    id="collaborative"
                    checked={newCollection.is_collaborative}
                    onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, is_collaborative: checked }))}
                  />
                </div>
                <Button onClick={handleCreateCollection} disabled={creating || !newCollection.title.trim()} className="w-full">
                  {creating ? "Creating..." : "Create Collection"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{collection.title}</CardTitle>
                  <div className="flex gap-1">
                    {collection.is_public ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe size={12} />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock size={12} />
                        Private
                      </Badge>
                    )}
                    {collection.is_collaborative && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users size={12} />
                        Collaborative
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {collection.description && (
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{collection.recipe_count || 0} recipes</span>
                  <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">No collections yet</h3>
            <p className="text-gray-500 mb-6">Create your first collection to organize your recipes</p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 mx-auto">
              <Plus size={20} />
              Create Your First Collection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
