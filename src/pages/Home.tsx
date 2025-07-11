import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart,
  MessageSquare,
  Eye,
  Share2,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  ArrowUp
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  name: string;
  username: string;
  avatar?: string;
  bio: string;
}

interface Conversation {
  id: string;
  mainTopic: string;
  otherTopics: string[];
  participants: [Participant, Participant];
  engagement: {
    views: number;
    loves: number;
    comments: number;
  };
}

const sampleConversations: Conversation[] = [
  {
    id: '1',
    mainTopic: "The Future of Digital Communication",
    otherTopics: ["AI in Text", "Social Media Evolution", "Content Creation"],
    participants: [
      {
        name: "Gaurab Boli",
        username: "gaurab",
        bio: "Building Arena • Exploring the future of communication",
      },
      {
        name: "Sam Chen",
        username: "samc",
        bio: "Tech enthusiast • Writer • Building in public",
      }
    ],
    engagement: {
      views: 1234,
      loves: 89,
      comments: 23
    }
  },
  {
    id: '2',
    mainTopic: "Reimagining Social Platforms",
    otherTopics: ["Community Building", "Creator Economy", "Digital Identity"],
    participants: [
      {
        name: "Alex Rivera",
        username: "alexr",
        bio: "Product Designer • Web3 Explorer",
      },
      {
        name: "Sarah Kim",
        username: "sarahk",
        bio: "Community Lead • Digital Anthropologist",
      }
    ],
    engagement: {
      views: 856,
      loves: 67,
      comments: 15
    }
  }
];

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  
  const handleShare = async (conversationId: string) => {
    try {
      await navigator.share({
        title: 'Check out this conversation on Arena',
        text: 'Join the discussion about the future of communication',
        url: `${window.location.origin}/conversation/${conversationId}`,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      const url = `${window.location.origin}/conversation/${conversationId}`;
      navigator.clipboard.writeText(url);
      // You might want to show a toast notification here
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const grayCircle = (num: number) => (
    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground mr-3">
      {num}
    </div>
  );

  const redDot = (
    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
  );

  const clockIcon = (
    <Clock className="h-4 w-4 text-muted-foreground mr-2 align-middle" />
  );

  // For auto-resizing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-28 pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(120px,160px)_minmax(0,1800px)_minmax(120px,160px)] gap-8 justify-center" style={{marginLeft: '0'}}>
            {/* Trending Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[120px] max-w-[160px]">
              <div className="sticky top-32 w-full pl-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Trending</h3>
                <ul className="space-y-4 w-full">
                  {[
                    { people: ['Elon', 'Sam'], topic: 'Winning AI race with advanced neural networks, global data, and regulatory challenges in the modern era.' },
                    { people: ['Sundar', 'Satya'], topic: 'Cloud wars: Google vs Microsoft.' },
                    { people: ['Mark', 'Tim'], topic: 'Privacy in the social era and the impact of new data protection laws on user experience and business models.' },
                    { people: ['Gaurab', 'Sam'], topic: 'The future of digital communication.' },
                    { people: ['Alex', 'Sarah'], topic: 'Reimagining social platforms.' },
                  ].map((item, idx) => (
                    <li key={idx} className="py-1 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer w-full flex flex-col items-start">
                      <div className="text-sm font-medium text-foreground/80 leading-tight">{item.people[0]} and {item.people[1]}</div>
                      <div className="text-xs text-muted-foreground leading-tight mt-0.5 truncate max-w-[180px]">{item.topic}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Center Content */}
            <main className="lg:col-span-1 flex flex-col items-center space-y-8">
              {/* Discussion Input Card */}
              <Card className="w-full max-w-[540px] mx-auto bg-background shadow-subtle rounded-2xl border-0">
                <CardContent className="p-5 flex items-center gap-5">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser?.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/80 text-white text-base font-bold">
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || currentUser?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <textarea
                    ref={textareaRef}
                    placeholder="Start a new discussion..."
                    className="flex-1 min-h-[44px] max-h-[120px] bg-muted/10 border-0 outline-none resize-none text-[15px] font-normal text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-2 leading-[1.5] focus:ring-2 focus:ring-primary/10 transition-shadow"
                    style={{boxShadow: 'none', overflow: 'hidden'}}
                    onInput={handleTextareaInput}
                  />
                  <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-neutral-700 hover:bg-muted/70 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>

              {/* Main Conversations */}
              <div className="space-y-8 w-full max-w-[520px] mx-auto">
                {sampleConversations.map((conversation) => (
                  <Card key={conversation.id} className="overflow-hidden transition-all duration-200 bg-muted/40 hover:bg-muted/70 hover:shadow-lg border border-muted-foreground/15 cursor-pointer">
                    <CardContent className="p-0">
                      {/* Main Topic as Header */}
                      <div className="bg-transparent px-6 pt-8 pb-2 border-0 border-b border-muted/20">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground/90 mb-2">{conversation.mainTopic}</h2>
                        <hr className="border-muted/20 mb-4" />
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {conversation.participants.map((participant, index) => (
                            <div key={participant.username} className="flex items-center gap-3">
                              <Avatar className="h-16 w-16 rounded-xl">
                                {participant.avatar ? (
                                  <AvatarImage src={participant.avatar} alt={participant.name} className="rounded-xl" />
                                ) : (
                                  <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                    {participant.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold tracking-tight mb-0.5">{participant.name}</h3>
                                <p className="text-xs font-medium text-muted-foreground mb-1">@{participant.username}</p>
                                <p className="text-xs text-muted-foreground/80 leading-tight line-clamp-2">{participant.bio}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {conversation.otherTopics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 pt-2 border-t border-muted/15">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground tracking-tight">
                              {formatNumber(conversation.engagement.views)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-400" />
                            <span className="text-xs font-medium text-rose-500/90 tracking-tight">
                              {formatNumber(conversation.engagement.loves)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-medium text-blue-500/90 tracking-tight">
                              {formatNumber(conversation.engagement.comments)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5 ml-auto"
                            onClick={() => handleShare(conversation.id)}
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>

            {/* Happening Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[120px] max-w-[160px]">
              <div className="sticky top-32 w-full pl-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Happening</h3>
                <ul className="space-y-4 w-full">
                  {[
                    { people: ['Ada', 'Grace'], topic: 'Women in Tech: Breaking Barriers and inspiring the next generation of leaders in science, technology, engineering, and mathematics.' },
                    { people: ['Steve', 'Bill'], topic: 'Personal Computing Revolution.' },
                    { people: ['Larry', 'Sergey'], topic: 'Search Engines and the Web.' },
                    { people: ['Brian', 'Dennis'], topic: 'The Birth of Unix and its lasting influence on modern operating systems, software development, and open source culture.' },
                    { people: ['Linus', 'Guido'], topic: 'Open Source and Python.' },
                    { people: ['Sheryl', 'Susan'], topic: 'Leadership in Silicon Valley.' },
                  ].map((item, idx) => (
                    <li key={idx} className="py-1 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer w-full flex flex-col items-start">
                      <div className="text-sm font-medium text-foreground/80 leading-tight">{item.people[0]} and {item.people[1]}</div>
                      <div className="text-xs text-muted-foreground leading-tight mt-0.5 truncate max-w-[180px]">{item.topic}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Home;
