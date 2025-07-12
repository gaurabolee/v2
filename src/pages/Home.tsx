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
import { Separator } from '@/components/ui/separator';
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
    mainTopic: "The Future of Podcast is Text",
    otherTopics: [
      "Text podcasts let you read at your own pace",
      "Every message is searchable and quotable",
      "Join the conversation anytime, anywhere"
    ],
    participants: [
      {
        name: "Gaurab Oli",
        username: "gaurab",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        bio: "Founder of Arena • Building the future of public text conversations • Exploring how AI and human creativity intersect in digital communication",
      },
      {
        name: "Sam Chen",
        username: "samc",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "Tech writer & builder • Former product manager at Twitter • Passionate about the intersection of technology, media, and human connection",
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
    mainTopic: "Why Public Text Debates Matter",
    otherTopics: [
      "Open debates foster transparency and trust",
      "Public text threads create lasting knowledge bases",
      "Everyone can participate, not just the loudest voices"
    ],
    participants: [
      {
        name: "Alex Rivera",
        username: "alexr",
        avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face",
        bio: "Community builder • Web3 explorer • Passionate about open, inclusive online spaces",
      },
      {
        name: "Priya Singh",
        username: "priyasingh",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
        bio: "Debate moderator • Remote work advocate • Believer in the power of public discourse",
      }
    ],
    engagement: {
      views: 987,
      loves: 54,
      comments: 17
    }
  },
  {
    id: '3',
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
  },
  {
    id: '4',
    mainTopic: "The Rise of Remote Work",
    otherTopics: ["Work From Home", "Digital Nomads", "Future of Offices"],
    participants: [
      {
        name: "Priya Singh",
        username: "priyasingh",
        bio: "Remote work advocate • Tech lead",
      },
      {
        name: "John Doe",
        username: "johndoe",
        bio: "HR specialist • Workplace futurist",
      }
    ],
    engagement: {
      views: 642,
      loves: 45,
      comments: 12
    }
  },
  {
    id: '5',
    mainTopic: "Building Sustainable Tech",
    otherTopics: ["Green Computing", "Eco Startups", "Tech for Good"],
    participants: [
      {
        name: "Maria Lopez",
        username: "marialopez",
        bio: "Sustainability champion • Startup founder",
      },
      {
        name: "David Kim",
        username: "davidkim",
        bio: "Engineer • Green tech enthusiast",
      }
    ],
    engagement: {
      views: 512,
      loves: 38,
      comments: 9
    }
  },
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
      <TransitionWrapper animation="fade" className="min-h-screen pt-28 pb-4 overflow-visible">
        <div className="max-w-full w-full mx-auto px-2 sm:px-4 lg:px-8 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)_minmax(180px,220px)] gap-6 justify-center overflow-visible">
            {/* Trending Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[180px] max-w-[220px]">
              <Card className="w-full bg-muted backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 overflow-visible">
                <div className="sticky top-32 w-full p-4">
                  <h3 className="text-sm font-semibold text-foreground/80 tracking-wider uppercase mb-4">TRENDING</h3>
                  <ul className="space-y-4 w-full">
                    {[
                      { people: [
                        { name: 'Elon Musk', avatar: '', bio: 'CEO of Tesla, SpaceX, Neuralink, and Twitter. Innovator, entrepreneur, and advocate for interplanetary life and sustainable energy.' },
                        { name: 'Sam Altman', avatar: '', bio: 'CEO of OpenAI, former president of Y Combinator, investor, and thought leader in artificial intelligence, startups, and the future of technology.' }
                      ], topic: 'Winning AI race with advanced neural networks, global data, regulatory challenges, AGI safety, open source, the future of work, machine learning, ethics, automation, global impact, policy, innovation.', recentReply: 'AI will change everything.', views: '1.2k' },
                      { people: [
                        { name: 'Sundar Pichai', avatar: '', bio: 'CEO of Google. Leading innovation in search, cloud, and AI. Passionate about technology for everyone, everywhere.' },
                        { name: 'Satya Nadella', avatar: '', bio: 'CEO of Microsoft. Champion for cloud, AI, and empowering every person and organization on the planet to achieve more.' }
                      ], topic: 'Cloud wars: Google vs Microsoft, cloud infrastructure, AI integration, enterprise solutions, developer tools, global reach.', recentReply: 'Cloud is the new battleground.', views: '1.1k' },
                      { people: [
                        { name: 'Mark Zuckerberg', avatar: '', bio: 'CEO of Meta (Facebook). Building the metaverse, social platforms, and advancing privacy and connectivity.' },
                        { name: 'Tim Cook', avatar: '', bio: 'CEO of Apple. Focused on privacy, innovation, and creating products that enrich people’s lives.' }
                      ], topic: 'Privacy in the social era, data protection laws, user experience, business models, encryption, transparency, user trust.', recentReply: 'Privacy is a fundamental right.', views: '1.0k' },
                      { people: [
                        { name: 'Gaurab Boli', avatar: '', bio: 'Founder of Arena. Exploring the future of digital communication, collaboration, and online communities.' },
                        { name: 'Sam Chen', avatar: '', bio: 'Tech enthusiast, writer, and builder in public. Passionate about the intersection of technology and society.' }
                      ], topic: 'The future of digital communication, messaging apps, real-time collaboration, voice tech, privacy, global reach.', recentReply: 'Excited for what’s next!', views: '900' },
                      { people: [
                        { name: 'Alex Rivera', avatar: '', bio: 'Product designer and Web3 explorer. Building communities and designing for the next generation of the internet.' },
                        { name: 'Sarah Kim', avatar: '', bio: 'Community lead and digital anthropologist. Studying online culture, engagement, and digital identity.' }
                      ], topic: 'Reimagining social platforms, community building, creator economy, digital identity, engagement, monetization.', recentReply: 'Communities are the future.', views: '800' },
                    ].map((item, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li className="py-1 px-2 rounded-lg w-full flex flex-col items-start transition-all duration-200 cursor-pointer hover:bg-muted/80 hover:shadow-lg hover:rounded-xl hover:px-3 hover:py-2 hover:scale-[1.03]">
                              <div className="text-sm font-normal text-foreground/80 leading-tight w-full">{item.people[0].name}</div>
                              <div className="text-sm text-muted-foreground leading-tight w-full">with {item.people[1].name}</div>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center" className="z-[9999] rounded-xl px-5 py-4 max-w-xs bg-muted shadow-xl">
                            <div className="flex flex-col gap-1.5">
                              {[0, 1].map(i => (
                                <div key={i} className="text-[14px] text-foreground/80">
                                  <span className="font-semibold mr-1">{item.people[i].name}:</span>
                                  <span className="text-xs text-muted-foreground">{item.people[i].bio}</span>
                                </div>
                              ))}
                              <Separator className="my-2 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                              <div className="text-[14px] text-foreground/80 mb-0.5">
                                <span className="font-semibold mr-1">Topics:</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.topic.split(/[,•|]/).map((topic, idx, arr) => (
                                    <span key={idx}>{topic.trim()}{idx < arr.length - 1 ? ', ' : ''}</span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </ul>
                </div>
              </Card>
            </aside>

            {/* Center Content */}
            <main className="lg:col-span-1 flex flex-col items-center space-y-4">
              {/* Discussion Input Card */}
              <Card className="w-full max-w-[1400px] mx-auto bg-background/50 backdrop-blur-sm shadow-sm rounded-xl border border-border/30 z-0 overflow-visible">
                <CardContent className="p-1 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUser?.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/80 text-white text-base font-bold">
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || currentUser?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <textarea
                    ref={textareaRef}
                    placeholder="Start a new discussion..."
                    className="flex-1 min-h-[1.5rem] max-h-[10rem] bg-transparent border-0 outline-none resize-none text-[15px] font-normal text-foreground placeholder:text-muted-foreground/70 rounded-xl px-1 py-0 leading-[1.5] focus:ring-1 focus:ring-primary/20 transition-shadow overflow-y-auto"
                    style={{boxShadow: 'none', overflow: 'hidden'}}
                    rows={1}
                    onInput={handleTextareaInput}
                  />
                  <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted/70 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>

              {/* Main Conversations */}
              <div className="space-y-2 w-full max-w-[1400px] mx-auto">
                {sampleConversations.map((conversation) => (
                  <div key={conversation.id} className="overflow-hidden transition-all duration-200 bg-muted backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 cursor-pointer hover:bg-muted/80">
                    <div className="p-0">
                      {/* Main Topic as Header */}
                      <div className="bg-transparent px-6 pt-4 pb-2 border-0 border-b border-muted/20">
                        <h2 className={`tracking-tight mb-1 ${
                          conversation.id === '1' || conversation.id === '2'
                            ? 'text-lg font-normal text-foreground/90'
                            : 'text-lg font-semibold text-foreground/90'
                        }`}>
                          {conversation.mainTopic}
                        </h2>
                        <hr className="border-muted/20 mb-2" />
                        {/* Topics - moved below profiles for Future of Podcast card */}
                        {conversation.id !== '1' && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {conversation.otherTopics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="px-2 py-0.5 text-xs font-normal bg-muted/40 text-muted-foreground/60 border-muted/30 hover:bg-muted/50 hover:text-muted-foreground/70 transition-colors">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {conversation.participants.map((participant, index) => (
                            <div key={participant.username} className="flex items-center gap-4 w-full min-h-[4rem]">
                              <Avatar className="h-20 w-20 rounded-xl flex-shrink-0">
                                {participant.avatar ? (
                                  <AvatarImage src={participant.avatar} alt={participant.name} className="rounded-xl" />
                                ) : (
                                  <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                    {participant.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex flex-col justify-center h-full min-h-[4rem] w-full">
                                <span className="font-semibold text-sm text-foreground/70 tracking-tight mb-0.5 whitespace-nowrap">{participant.name}</span>
                                <span className="text-xs text-muted-foreground/80 break-words w-full" style={{maxWidth: '280ch'}}>{participant.bio}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {conversation.id === '1' && (
                          <div className="mb-4 flex items-center gap-2 w-full" style={{minHeight: '1.5rem'}}>
                            <span className="text-xs font-semibold text-foreground/80 mr-1 whitespace-nowrap flex items-center">Topics:</span>
                            <div className="relative flex-1 overflow-x-hidden flex items-center" style={{height: '1.5rem'}}>
                              <style>{`
                                @keyframes arena-scroll-left {
                                  0% { transform: translateX(0); }
                                  100% { transform: translateX(-50%); }
                                }
                              `}</style>
                              <div
                                className="flex items-center gap-1 flex-nowrap whitespace-nowrap"
                                style={{
                                  animation: 'arena-scroll-left 24s linear infinite',
                                  willChange: 'transform',
                                  minWidth: '100%',
                                }}
                              >
                                {conversation.otherTopics.concat(conversation.otherTopics).map((topic, idx) => (
                                  <TooltipProvider key={idx} delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-xs text-muted-foreground/90 font-normal cursor-pointer px-1 flex items-center" style={{lineHeight: '1.5rem'}}>
                                          {topic}{idx < conversation.otherTopics.length * 2 - 1 ? ' | ' : ''}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" align="center" className="z-[9999] rounded-xl px-4 py-2 max-w-xs bg-muted shadow-xl text-xs text-foreground/90">
                                        {topic}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Horizontal scrolling topics below profiles for Why Public Text Debates Matter card */}
                        {conversation.id === '2' && (
                          <div className="mb-4 flex items-center gap-2 w-full" style={{minHeight: '1.5rem'}}>
                            <span className="text-xs font-semibold text-foreground/80 mr-1 whitespace-nowrap flex items-center">Topics:</span>
                            <div className="relative flex-1 overflow-x-hidden flex items-center" style={{height: '1.5rem'}}>
                              <style>{`
                                @keyframes arena-scroll-left-2 {
                                  0% { transform: translateX(0); }
                                  100% { transform: translateX(-50%); }
                                }
                              `}</style>
                              <div
                                className="flex items-center gap-1 flex-nowrap whitespace-nowrap"
                                style={{
                                  animation: 'arena-scroll-left-2 24s linear infinite',
                                  willChange: 'transform',
                                  minWidth: '100%',
                                }}
                              >
                                {conversation.otherTopics.concat(conversation.otherTopics).map((topic, idx) => (
                                  <TooltipProvider key={idx} delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-xs text-muted-foreground/90 font-normal cursor-pointer px-1 flex items-center" style={{lineHeight: '1.5rem'}}>
                                          {topic}{idx < conversation.otherTopics.length * 2 - 1 ? ' | ' : ''}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" align="center" className="z-[9999] rounded-xl px-4 py-2 max-w-xs bg-muted shadow-xl text-xs text-foreground/90">
                                        {topic}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-6 pt-2 border-t border-muted/15">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground tracking-tight">
                              {formatNumber(conversation.engagement.views)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground/80 tracking-tight">
                              {formatNumber(conversation.engagement.loves)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground/80 tracking-tight">
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
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* Happening Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[180px] max-w-[220px]">
              <Card className="w-full bg-muted backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
                <div className="sticky top-32 w-full p-4">
                  <h3 className="text-sm font-semibold text-foreground/80 tracking-wider uppercase mb-4">HAPPENING</h3>
                  <ul className="space-y-4 w-full">
                    {[
                      { people: [
                        { name: 'Ada Lovelace', bio: 'Mathematician, writer, and the world’s first computer programmer. Pioneer for women in STEM.' },
                        { name: 'Grace Hopper', bio: 'Computer scientist, US Navy rear admiral, and inventor of the first compiler. Advocate for accessible programming.' }
                      ], topic: 'Women in tech, breaking barriers, inspiring leaders, STEM education, programming history, legacy.' },
                      { people: [
                        { name: 'Steve Jobs', bio: 'Co-founder of Apple. Visionary leader in personal computing, design, and digital media.' },
                        { name: 'Bill Gates', bio: 'Co-founder of Microsoft. Philanthropist, software pioneer, and global health advocate.' }
                      ], topic: 'Personal computing revolution, software innovation, entrepreneurship, philanthropy, digital transformation.' },
                      { people: [
                        { name: 'Larry Page', bio: 'Co-founder of Google. Innovator in search, AI, and internet technology.' },
                        { name: 'Sergey Brin', bio: 'Co-founder of Google. Leader in search, data, and technology for good.' }
                      ], topic: 'Search engines, the web, data science, AI, global connectivity, information access.' },
                      { people: [
                        { name: 'Brian Kernighan', bio: 'Computer scientist, co-creator of Unix, and author. Influential in software development and education.' },
                        { name: 'Dennis Ritchie', bio: 'Computer scientist, co-creator of Unix and C. Pioneer in operating systems and programming languages.' }
                      ], topic: 'Unix, operating systems, open source, C programming, software development, tech legacy.' },
                      { people: [
                        { name: 'Linus Torvalds', bio: 'Creator of Linux and Git. Advocate for open source and collaborative software.' },
                        { name: 'Guido van Rossum', bio: 'Creator of Python. Champion for readable, accessible programming and open source.' }
                      ], topic: 'Open source, Python, Linux, software collaboration, programming languages, tech community.' },
                      { people: [
                        { name: 'Sheryl Sandberg', bio: 'COO of Facebook, author, and advocate for women in leadership and workplace equality.' },
                        { name: 'Susan Wojcicki', bio: 'Former CEO of YouTube. Leader in digital media, advertising, and tech policy.' }
                      ], topic: 'Leadership, Silicon Valley, digital media, workplace equality, tech policy, women in business.' },
                    ].map((item, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li className="py-1 px-2 rounded-lg w-full flex flex-col items-start transition-all duration-200 cursor-pointer hover:bg-muted/80 hover:shadow-lg hover:rounded-xl hover:px-3 hover:py-2 hover:scale-[1.03]">
                              <div className="text-sm font-normal text-foreground/80 leading-tight w-full">{item.people[0].name}</div>
                              <div className="text-sm text-muted-foreground leading-tight w-full">with {item.people[1].name}</div>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center" className="z-[9999] rounded-xl px-5 py-4 max-w-xs bg-muted shadow-xl">
                            <div className="flex flex-col gap-1.5">
                              {[0, 1].map(i => (
                                <div key={i} className="text-[14px] text-foreground/80">
                                  <span className="font-semibold mr-1">{item.people[i].name}:</span>
                                  <span className="text-xs text-muted-foreground">{item.people[i].bio}</span>
                                </div>
                              ))}
                              <Separator className="my-2 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                              <div className="text-[14px] text-foreground/80 mb-0.5">
                                <span className="font-semibold mr-1">Topics:</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.topic.split(/[,•|]/).map((topic, idx, arr) => (
                                    <span key={idx}>{topic.trim()}{idx < arr.length - 1 ? ', ' : ''}</span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </ul>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Home;

