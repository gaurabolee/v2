import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Heart, MessageSquare, Eye, ArrowUp, ImagePlus, Mic, MicOff, ChevronLeft, ChevronRight, CornerUpLeft, X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoveReaction {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    isHost?: boolean;
  };
  timestamp: string;
  pinned?: boolean;
  replies?: Comment[];
}

interface Message {
  id: string;
  content: string;
  subject?: string;
  sender: {
    name: string;
    username: string;
  };
  timestamp: string;
  topicId: number;
  engagement: {
    loves: number;
    comments: number;
    views: number;
  };
  loveReactions?: LoveReaction[];
  comments?: Comment[];
  images?: string[];
}

interface Topic {
  id: number;
  title: string;
}

const topics: Topic[] = [
  { id: 1, title: "Introduction" },
  { id: 2, title: "Future of Podcast is Text" },
  { id: 3, title: "How will Arena disrupt text podcast and social media" }
];

const topicMessages: Record<number, Message[]> = {
  1: [
    {
      id: '1',
      content: "Hi Sam, excited to start this conversation about the future of podcasting. I've been thinking a lot about how text-based conversations could revolutionize the way we consume and interact with content.",
      sender: {
        name: 'Rick',
        username: 'rickharris'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      topicId: 1,
      engagement: { loves: 12, comments: 8, views: 1456 },
      loveReactions: [
        { id: '1', user: { name: 'Alex Chen', username: 'alexchen' }, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: '2', user: { name: 'Maria Rodriguez', username: 'mariarod' }, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
        { id: '3', user: { name: 'David Kim', username: 'davidkim' }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
      ]
    },
    {
      id: '2',
      content: "Absolutely, Rick! The traditional podcast format has been around for decades, but I think we're at a point where the medium needs to evolve. Text-based conversations offer something that audio simply can't - searchability, skimmability, and the ability to engage at your own pace.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
      topicId: 1,
      engagement: { loves: 18, comments: 12, views: 1892 },
      loveReactions: [
        { id: '4', user: { name: 'Sarah Johnson', username: 'sarahj' }, timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
        { id: '5', user: { name: 'Michael Brown', username: 'mikebrown' }, timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        { id: '6', user: { name: 'Emily Davis', username: 'emilyd' }, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: '7', user: { name: 'James Wilson', username: 'jamesw' }, timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() }
      ]
    }
  ],
  2: [
    {
      id: '3',
      content: "The future of podcast is text. Think about it - every message is searchable, quotable, and can be shared instantly. You can't search through an audio file the same way you can search through a text conversation. Plus, text allows for deeper engagement - people can pause, reflect, and respond thoughtfully.",
      sender: {
        name: 'Rick',
        username: 'rickharris'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      topicId: 2,
      engagement: { loves: 25, comments: 15, views: 2341 },
      loveReactions: [
        { id: '8', user: { name: 'Lisa Anderson', username: 'lisaa' }, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
        { id: '9', user: { name: 'Robert Taylor', username: 'robertt' }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { id: '10', user: { name: 'Jennifer Lee', username: 'jenniferl' }, timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString() }
      ]
    },
    {
      id: '4',
      content: "Exactly! And let's talk about accessibility. Text is inherently more accessible than audio - it works for people with hearing impairments, it works in noisy environments, it works when you need to be quiet. Plus, you can consume it at 10x speed by skimming, or take your time with complex ideas.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      topicId: 2,
      engagement: { loves: 31, comments: 22, views: 2876 },
      loveReactions: [
        { id: '11', user: { name: 'Thomas Wilson', username: 'thomasw' }, timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
        { id: '12', user: { name: 'Natalie Chen', username: 'nataliec' }, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
        { id: '13', user: { name: 'Brandon Park', username: 'brandonp' }, timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString() }
      ]
    },
    {
      id: '5',
      content: "The beauty of text conversations is that they create lasting knowledge bases. Every discussion becomes a searchable archive of insights. Imagine being able to search through years of conversations between thought leaders - that's a treasure trove of knowledge that audio podcasts just can't match.",
      sender: {
        name: 'Rick',
        username: 'rickharris'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      topicId: 2,
      engagement: { loves: 28, comments: 19, views: 2654 },
      loveReactions: [
        { id: '14', user: { name: 'Hannah Kim', username: 'hannahk' }, timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString() },
        { id: '15', user: { name: 'Justin Brown', username: 'justinb' }, timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString() }
      ]
    },
    {
      id: '7',
      content: "But what about the emotional connection that voice provides? I think there's something special about hearing someone's tone, their laughter, their pauses. Text can feel cold and impersonal. How do we maintain that human warmth in text-based conversations?",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      topicId: 2,
      engagement: { loves: 42, comments: 31, views: 3456 },
      loveReactions: [
        { id: '18', user: { name: 'Sophie Kim', username: 'sophiek' }, timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString() },
        { id: '19', user: { name: 'Daniel Brown', username: 'danielb' }, timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString() },
        { id: '20', user: { name: 'Jessica White', username: 'jessicaw' }, timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() }
      ]
    },
    {
      id: '8',
      content: "Great point, Sam. I think text actually allows for more emotional nuance than we give it credit for. Emojis, formatting, word choice - these all convey emotion. Plus, text gives people time to craft their thoughts, which often leads to more meaningful expressions than off-the-cuff speech.",
      sender: {
        name: 'Rick',
        username: 'rickharris'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      topicId: 2,
      engagement: { loves: 38, comments: 27, views: 3123 },
      loveReactions: [
        { id: '21', user: { name: 'Ryan Taylor', username: 'ryant' }, timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
        { id: '22', user: { name: 'Amanda Clark', username: 'amandac' }, timestamp: new Date(Date.now() - 1000 * 60 * 100).toISOString() }
      ]
    },
    {
      id: '9',
      content: "You're right about the crafting aspect. But I worry about the barrier to entry. Not everyone is a great writer, and some people might feel intimidated by text-based conversations. Audio is more forgiving - you can stumble over words and still be understood.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      topicId: 2,
      engagement: { loves: 35, comments: 29, views: 2987 },
      loveReactions: [
        { id: '23', user: { name: 'Brian Miller', username: 'brianm' }, timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString() },
        { id: '24', user: { name: 'Nicole Garcia', username: 'nicoleg' }, timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString() }
      ]
    },
    {
      id: '10',
      content: "That's a valid concern. But I think the key is creating a supportive environment where people feel comfortable expressing themselves however they can. Text doesn't have to be perfect - it just has to be authentic. And honestly, some of the most powerful messages I've seen are from people who write from the heart, not from perfect grammar.",
      sender: {
        name: 'Rick',
        username: 'rickharris'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      topicId: 2,
      engagement: { loves: 45, comments: 33, views: 3678 },
      loveReactions: [
        { id: '25', user: { name: 'Steven Martinez', username: 'stevenm' }, timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString() },
        { id: '26', user: { name: 'Rachel Green', username: 'rachelg' }, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { id: '27', user: { name: 'Kevin Park', username: 'kevinp' }, timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString() }
      ]
    },
    {
      id: '11',
      content: "Absolutely. And let's not forget the democratizing aspect. With text, you can participate in conversations regardless of your speaking ability, accent, or speech impediments. It levels the playing field in a way that audio never could. Everyone gets the same opportunity to be heard.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      topicId: 2,
      engagement: { loves: 52, comments: 41, views: 4234 },
      loveReactions: [
        { id: '28', user: { name: 'Laura Wilson', username: 'lauraw' }, timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString() },
        { id: '29', user: { name: 'James Chen', username: 'jamesc' }, timestamp: new Date(Date.now() - 1000 * 60 * 135).toISOString() },
        { id: '30', user: { name: 'Ashley Park', username: 'ashleyp' }, timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString() }
      ]
    }
  ],
  3: [
    {
      id: '6',
      content: "Arena is positioned to disrupt both traditional podcasting and social media by combining the best of both worlds. We're creating a platform where meaningful conversations can happen in public, but with the depth and thoughtfulness that text allows.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      topicId: 3,
      engagement: { loves: 35, comments: 28, views: 3123 },
      loveReactions: [
        { id: '16', user: { name: 'Megan Davis', username: 'megand' }, timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString() },
        { id: '17', user: { name: 'Aaron Johnson', username: 'aaronj' }, timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString() }
      ]
    }
  ]
};

const RickSamConversation: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [messages, setMessages] = useState<Message[]>(topicMessages[1]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showLoveReactions, setShowLoveReactions] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);

  const handleTopicChange = (topicId: number) => {
    setCurrentTopicId(topicId);
    setMessages(topicMessages[topicId] || []);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border shadow-sm">
            {/* Header */}
            <div className="border-b bg-muted/30 p-4">
              <div className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => navigate('/home')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium">
                  {topics.find(t => t.id === currentTopicId)?.title}
                </p>
                
                {/* Conversation Metadata */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>3 topics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>300 words event</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>3 days remaining</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex">
              {sidebarOpen ? (
                <div className="w-56 p-2 space-y-2 border-r relative">
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Collapse topics sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-medium mb-2">Topics</h3>
                  <div className="space-y-1">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicChange(topic.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        currentTopicId === topic.id
                          ? "bg-muted/60 text-foreground font-medium"
                          : "hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>
              ) : (
                <button
                  className="w-6 h-10 flex items-center justify-center border-r bg-background hover:bg-muted transition-colors"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Expand topics sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {messages
                      .filter(m => m.topicId === currentTopicId)
                      .map((message) => (
                        <div key={message.id} className="mb-4 cursor-pointer" onClick={() => setActiveMessageId(message.id)}>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-foreground">{message.sender.name}</span>
                            {activeMessageId === message.id && (
                              <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                            )}
                          </div>
                          <span className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{message.content}</span>
                          {activeMessageId === message.id && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <button 
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={e => { 
                                  e.stopPropagation(); 
                                  if (message.loveReactions && message.loveReactions.length > 0) {
                                    setShowLoveReactions(message.id);
                                  }
                                }}
                              >
                                <Heart className="h-3.5 w-3.5" />
                                <span>{message.engagement.loves}</span>
                              </button>
                              <button 
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={e => { 
                                  e.stopPropagation(); 
                                  setShowComments(message.id);
                                }}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{message.engagement.comments}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{message.engagement.views}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </TransitionWrapper>

      {/* Love Reactions Modal */}
      {showLoveReactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLoveReactions(null)}>
          <div className="bg-background rounded-xl shadow-xl p-6 min-w-[340px] max-w-[95vw] max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-primary focus:outline-none" onClick={() => setShowLoveReactions(null)} aria-label="Close">×</button>
            <h3 className="text-lg font-semibold mb-4">Reactions</h3>
            <ul className="divide-y divide-muted-foreground/10">
              {messages.find(m => m.id === showLoveReactions)?.loveReactions?.map(user => (
                <li key={user.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-muted-foreground">
                      {user.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-base leading-tight">{user.user.name}</div>
                      <div className="text-sm text-muted-foreground leading-tight">@{user.user.username}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">{formatTimestamp(user.timestamp)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <Dialog open={showComments !== null} onOpenChange={() => { 
          setShowComments(null); 
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default RickSamConversation; 