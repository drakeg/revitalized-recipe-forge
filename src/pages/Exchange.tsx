
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, Gift, ArrowRightLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SwapRequests from "@/components/exchange/SwapRequests";
import Messages from "@/components/exchange/Messages";
import RecipeGifts from "@/components/exchange/RecipeGifts";
import UserDirectory from "@/components/exchange/UserDirectory";

interface ExchangeProps {
  session: Session | null;
}

const Exchange: React.FC<ExchangeProps> = ({ session }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <Navbar loggedIn={!!session} userEmail={session?.user?.email} session={session} />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">Recipe Exchange</h1>
          <p className="text-emerald-600 mt-2">Connect with other cooking enthusiasts and share recipes</p>
        </div>

        <Tabs defaultValue="swaps" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="swaps" className="flex items-center gap-2">
              <ArrowRightLeft size={16} />
              Recipe Swaps
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Messages
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Gift size={16} />
              Recipe Gifts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Find Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swaps" className="mt-6">
            <SwapRequests session={session} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Messages session={session} />
          </TabsContent>

          <TabsContent value="gifts" className="mt-6">
            <RecipeGifts session={session} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserDirectory session={session} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Exchange;
