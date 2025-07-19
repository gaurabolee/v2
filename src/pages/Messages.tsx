import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit,
  ArrowRight,
  MessageSquare,
  Eye,
  Lock,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Messages: React.FC = () => {
  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            <CardContent className="p-4">
              <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-[200px] grid-cols-2 mb-6 bg-muted/30 dark:bg-muted/20 border border-muted/40">
              <TabsTrigger value="open" className="data-[state=active]:bg-muted/50 dark:data-[state=active]:bg-muted/30 data-[state=active]:text-foreground/90 dark:data-[state=active]:text-white/90">Open</TabsTrigger>
              <TabsTrigger value="closed" className="data-[state=active]:bg-muted/50 dark:data-[state=active]:bg-muted/30 data-[state=active]:text-foreground/90 dark:data-[state=active]:text-white/90">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              <div className="space-y-0">
                <Link to="/text/1" className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-48 min-w-[12rem]">
                      <Avatar className="h-10 w-10 shadow-sm border border-background">
                        <AvatarFallback className="text-sm font-medium">SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">Sam Chen</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">@samc</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm text-muted-foreground w-full block h-6 leading-6">
                        {"Thanks for sharing your thoughts on AI ethics. I think we need to consider new perspectives..."}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                        <span>2h ago</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />1.2k</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="h-px bg-border mx-0"></div>

                <Link to="/text/2" className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-48 min-w-[12rem]">
                      <Avatar className="h-10 w-10 shadow-sm border border-background">
                        <AvatarFallback className="text-sm font-medium">MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">Maria Johnson</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">@mariaj</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-semibold text-foreground w-full block h-6 leading-6">
                        {"The ethical implications of AI decision-making are complex and require care..."}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                        <span>5h ago</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />856</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="h-px bg-border mx-0"></div>

                <Link to="/text/3" className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-48 min-w-[12rem]">
                      <Avatar className="h-10 w-10 shadow-sm border border-background">
                        <AvatarFallback className="text-sm font-medium">AL</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">Alex Lee</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">@alexlee</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm text-muted-foreground w-full block h-6 leading-6">
                        {"Climate action requires both individual and systemic changes to make a real difference now..."}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                        <span>1d ago</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />2.1k</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="h-px bg-border mx-0"></div>

                <Link to="/text/4" className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-48 min-w-[12rem]">
                      <Avatar className="h-10 w-10 shadow-sm border border-background">
                        <AvatarFallback className="text-sm font-medium">SK</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">Sarah Kim</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">@sarahk</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-semibold text-foreground w-full block h-6 leading-6">
                        {"Remote work has transformed how we think about productivity and collaboration..."}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                        <span>30m ago</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />634</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="h-px bg-border mx-0"></div>

                <Link to="/text/5" className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex items-center gap-3 w-48 min-w-[12rem]">
                      <Avatar className="h-10 w-10 shadow-sm border border-background">
                        <AvatarFallback className="text-sm font-medium">DR</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">David Rodriguez</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">@davidr</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm text-muted-foreground w-full block h-6 leading-6">
                        {"Education should adapt to the digital age while maintaining core values and inclusivity..."}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                        <span>3h ago</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />1.8k</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No closed conversations yet
              </div>
            </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Messages;
