import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// Add Web Speech API types
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

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
  { id: 2, title: "Future of Text" },
  { id: 3, title: "How will Arena disrupt text podcast and social media" }
];

const topicMessages: Record<number, Message[]> = {
  1: [
    {
      id: '1',
      content: "Hi Sam, excited to start this conversation. Let's begin with our Introduction.",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 10, comments: 12, views: 1234 },
      loveReactions: [
        { id: '1', user: { name: 'Alex Chen', username: 'alexchen' }, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: '2', user: { name: 'Maria Rodriguez', username: 'mariarod' }, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
        { id: '3', user: { name: 'David Kim', username: 'davidkim' }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: '4', user: { name: 'Sarah Johnson', username: 'sarahj' }, timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
        { id: '5', user: { name: 'Michael Brown', username: 'mikebrown' }, timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        { id: '6', user: { name: 'Emily Davis', username: 'emilyd' }, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: '7', user: { name: 'James Wilson', username: 'jamesw' }, timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
        { id: '8', user: { name: 'Lisa Anderson', username: 'lisaa' }, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
        { id: '9', user: { name: 'Robert Taylor', username: 'robertt' }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { id: '10', user: { name: 'Jennifer Lee', username: 'jenniferl' }, timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString() }
      ],
      comments: [
        {
          id: 'c1',
          content: "Great to see this conversation starting! Looking forward to the insights.",
          user: { name: 'Alex Chen', username: 'alexchen', isHost: false },
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          replies: [
            {
              id: 'r1',
              content: "Thanks Alex! We're excited to share our perspectives.",
              user: { name: 'Gaurab', username: 'gaurab', isHost: true },
              timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
            }
          ],
          pinned: true
        },
        {
          id: 'c2',
          content: "This is going to be an interesting discussion about digital communication.",
          user: { name: 'Maria Rodriguez', username: 'mariarod', isHost: false },
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        },
        {
          id: 'c3',
          content: "I'm curious about how Arena will differentiate itself from existing platforms.",
          user: { name: 'David Kim', username: 'davidkim', isHost: false },
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          replies: [
            {
              id: 'r2',
              content: "Great question David! We'll dive deep into that in the next topic.",
              user: { name: 'Sam', username: 'samc', isHost: true },
              timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
              pinned: true
            }
          ]
        }
      ]
    },
    {
      id: '2',
      content: "Hi Gaurab, great to be here. Looking forward to sharing our backgrounds and ideas.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 18, comments: 8, views: 856 }
    },
    {
      id: '3',
      content: "Thank you, Sam. To kick things off, let me share a bit about my journey. I started working in digital communication over a decade ago, and I've seen the landscape change dramatically. From the early days of forums and chat rooms to today's AI-driven platforms, it's been a fascinating evolution. I'm excited to hear your perspective as well!",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 30, comments: 15, views: 1500 }
    },
    {
      id: '4',
      content: "That's a great introduction, Gaurab! My background is in technology and writing, and I've always been passionate about how people connect and share ideas online. Arena is an exciting project because it brings together so many of the things I care about: community, innovation, and meaningful conversation.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 22, comments: 10, views: 1100 }
    },
    {
      id: '5',
      content: "Absolutely, Sam. I think one of the most important aspects of any platform is how it empowers users to express themselves authentically. With Arena, we're aiming to create a space where thoughtful discussion is encouraged and everyone's voice can be heard, no matter their background or experience.",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 28, comments: 13, views: 1300 }
    },
    {
      id: '6',
      content: "I couldn't agree more. The ability to have nuanced, respectful conversations is what sets great communities apart. I'm looking forward to seeing how Arena evolves and how our users shape the direction of the platform.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 20, comments: 9, views: 1000 }
    }
  ],
  2: [
    {
      id: '3',
      content: "Let's discuss how text is evolving in the digital age. What role do you see AI playing in this transformation?",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 2,
      engagement: { loves: 15, comments: 7, views: 654 }
    }
  ],
  3: [
    {
      id: '4',
      content: "Arena represents a new paradigm in digital communication. How do you see it changing the landscape of content creation?",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 3,
      engagement: { loves: 20, comments: 10, views: 789 }
    }
  ]
};

const Conversation: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [messages, setMessages] = useState<Message[]>(topicMessages[1]);

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImages, setSelectedImages] = useState<{ url: string; file: File }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showLoveReactions, setShowLoveReactions] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);
  const [replyToReply, setReplyToReply] = useState<Comment | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [pinnedComments, setPinnedComments] = useState<string[]>([]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleTopicChange = (topicId: number) => {
    setCurrentTopicId(topicId);
    // Update messages for the new topic
    setMessages(prev => {
      // Get existing user messages for this topic
      const existingMessages = prev.filter(m => m.topicId === topicId);
      // Combine with preset topic messages
      return [...topicMessages[topicId], ...existingMessages.filter(m => !topicMessages[topicId].find(tm => tm.id === m.id))];
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[indexToRemove].url);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSendMessage = () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || !currentUser) return;

    // Create copies of the image URLs to persist them
    const persistedImages = selectedImages.map(img => {
      const response = fetch(img.url)
        .then(res => res.blob())
        .then(blob => URL.createObjectURL(blob));
      return img.url;
    });

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: {
        name: currentUser.name || 'User',
        username: currentUser.username || 'user'
      },
      timestamp: new Date().toISOString(),
      topicId: currentTopicId,
      engagement: { loves: 0, comments: 0, views: 0 },
      images: persistedImages
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedImages([]);
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

  const handleAddComment = () => {
    if (!commentInput.trim() || !showComments || !currentUser) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      content: commentInput,
      user: {
        name: currentUser.name,
        username: currentUser.username,
        isHost: currentUser.username === 'gaurab' || currentUser.username === 'samc'
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => prev.map(message => {
      if (message.id === showComments) {
        return {
          ...message,
          comments: [...(message.comments || []), newComment],
          engagement: {
            ...message.engagement,
            comments: message.engagement.comments + 1
          }
        };
      }
      return message;
    }));

    setCommentInput('');
    setReplyToComment(null);
    setReplyToReply(null);
  };

  const handleAddReply = (commentId: string) => {
    if (!commentInput.trim() || !showComments || !currentUser) return;

    const newReply: Comment = {
      id: `reply_${Date.now()}`,
      content: commentInput,
      user: {
        name: currentUser.name,
        username: currentUser.username,
        isHost: currentUser.username === 'gaurab' || currentUser.username === 'samc'
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => prev.map(message => {
      if (message.id === showComments) {
        return {
          ...message,
          comments: message.comments?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          })
        };
      }
      return message;
    }));

    setCommentInput('');
    setReplyToComment(null);
    setReplyToReply(null);
  };

  const handleAddReplyToReply = (commentId: string, replyId: string) => {
    if (!commentInput.trim() || !showComments || !currentUser) return;

    const newReplyToReply: Comment = {
      id: `reply_to_reply_${Date.now()}`,
      content: commentInput,
      user: {
        name: currentUser.name,
        username: currentUser.username,
        isHost: currentUser.username === 'gaurab' || currentUser.username === 'samc'
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => prev.map(message => {
      if (message.id === showComments) {
        return {
          ...message,
          comments: message.comments?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: comment.replies?.map(reply => {
                  if (reply.id === replyId) {
                    return {
                      ...reply,
                      replies: [...(reply.replies || []), newReplyToReply]
                    };
                  }
                  return reply;
                })
              };
            }
            return comment;
          })
        };
      }
      return message;
    }));

    setCommentInput('');
    setReplyToComment(null);
    setReplyToReply(null);
  };

  // Pin/unpin comment (host only)
  const handlePinComment = (commentId: string) => {
    if (!currentUser || (currentUser.username !== 'gaurab' && currentUser.username !== 'samc')) return;
    setMessages(prev => prev.map(message => {
      if (message.id === showComments) {
        return {
          ...message,
          comments: message.comments?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                pinned: !comment.pinned
              };
            }
            return comment;
          })
        };
      }
      return message;
    }));
  };
  // Pin/unpin reply (host only)
  const handlePinReply = (commentId: string, replyId: string) => {
    if (!currentUser || (currentUser.username !== 'gaurab' && currentUser.username !== 'samc')) return;
    setMessages(prev => prev.map(message => {
      if (message.id === showComments) {
        return {
          ...message,
          comments: message.comments?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: comment.replies?.map(reply => {
                  if (reply.id === replyId) {
                    return {
                      ...reply,
                      pinned: !reply.pinned
                    };
                  }
                  return reply;
                })
              };
            }
            return comment;
          })
        };
      }
      return message;
    }));
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            {/* Header */}
            <div className="border-b border-muted/20 bg-muted/50 dark:bg-muted/30 p-4">
              <div className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium">
                  {topics.find(t => t.id === currentTopicId)?.title}
                </p>
                {topics.find(t => t.id === currentTopicId)?.title === 'Introduction' && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Word count will start from the next topic
                  </span>
                )}
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
                  <h3 className="font-medium mb-2 text-foreground/80 dark:text-white/80">Topics</h3>
                  <div className="space-y-1">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicChange(topic.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        currentTopicId === topic.id
                          ? "bg-muted/60 text-foreground/90 dark:text-white/90 font-medium"
                          : "hover:bg-muted/40 text-foreground/70 dark:text-white/70"
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
              <div className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    {messages
                      .filter(m => m.topicId === currentTopicId)
                      .map((message, idx, arr) => (
                        <div key={message.id} className="mb-4 cursor-pointer" onClick={() => setActiveMessageId(message.id)}>
                          {/* Show reply preview for Sam's last message as if replying to Gaurab */}
                          {message.id === '6' && (
                            <>
                              <div className="flex items-center gap-2 mb-1 ml-2">
                                <span className="text-xs text-muted-foreground">Absolutely, Sam. I think one of the most important aspects of any platform is how it empowers users to express themselves authentically...</span>
                            </div>
                              <div className="flex items-baseline gap-2 mb-1 ml-0">
                                <span className="text-sm font-semibold text-foreground">{message.sender.name}</span>
                                {activeMessageId === message.id && (
                                  <span className="text-xs text-muted-foreground">Jul 9, 5:31 PM</span>
                                )}
                              </div>
                              <span className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{message.content}</span>
                            </>
                          )}
                          {message.id !== '6' && (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-semibold text-foreground">{message.sender.name}</span>
                                {activeMessageId === message.id && (
                                  <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                                )}
                              </div>
                              <span className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{message.content}</span>
                            </>
                          )}
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
                              <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={e => { e.stopPropagation(); setReplyToMessage(message); }}>
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          </div>
                    ))}
                  </div>
                </CardContent>

                {/* Above the input area, show reply preview if set */}
                {replyToMessage && (
                  <div className="mb-2 p-2 rounded bg-muted/30 border-l-4 border-primary flex items-center justify-between">
                    <div>
                      <span className="font-normal text-primary mr-2 text-sm">Replying to {replyToMessage.sender.name}:</span>
                      <span className="text-xs text-muted-foreground">{replyToMessage.content.slice(0, 60)}{replyToMessage.content.length > 60 ? '...' : ''}</span>
                    </div>
                    <button className="ml-4 text-xs text-muted-foreground hover:text-destructive" onClick={() => setReplyToMessage(null)}>Cancel</button>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-muted/20 p-4">
                  <div className="space-y-3">
                    <div className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm rounded-lg p-3 space-y-2 border border-muted/40 hover:border-primary/50 transition-colors">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          // Always expand to fit content
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = textarea.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Share your thoughts..."
                        className="w-full bg-transparent text-sm focus:outline-none resize-none min-h-[40px]"
                      />

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 max-h-[200px] overflow-y-auto">
                          {selectedImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            <ImagePlus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                          <input 
                            type="file" 
                            id="photo-upload" 
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                          {recognition && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 w-7 p-0",
                                isRecording && "text-red-500 hover:text-red-600"
                              )}
                              onClick={toggleRecording}
                            >
                              {isRecording ? (
                                <MicOff className="h-4 w-4" />
                              ) : (
                                <Mic className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </Button>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSendMessage}
                          className="h-7 w-7 rounded-full p-0"
                          disabled={!inputValue.trim() && selectedImages.length === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </TransitionWrapper>

      {/* Love Reactions Dialog */}
      <Dialog open={showLoveReactions !== null} onOpenChange={() => setShowLoveReactions(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Reactions
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {showLoveReactions && messages.find(m => m.id === showLoveReactions)?.loveReactions?.map((reaction) => (
              <div key={reaction.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {reaction.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{reaction.user.name}</p>
                  <p className="text-xs text-muted-foreground">@{reaction.user.username}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(reaction.timestamp).toLocaleString([], { 
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showComments !== null} onOpenChange={() => { 
        setShowComments(null); 
        setReplyToComment(null); 
        setReplyToReply(null);
        setCommentInput(''); 
        setActiveCommentId(null);
        setActiveReplyId(null);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {showComments && messages.find(m => m.id === showComments)?.comments?.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="relative">
                  {comment.pinned && (
                    <Pin className="absolute top-2 right-3 h-5 w-5 text-muted-foreground opacity-60" />
                  )}
                  {/* Main Comment */}
                  <div 
                    className="flex gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    onClick={() => setActiveCommentId(comment.id)}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {comment.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">{comment.user.name}</span>
                        {comment.user.isHost && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{comment.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-3.5 w-3.5" />
                          <span>0</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{comment.replies?.length || 0}</span>
                        </button>
                        {currentUser && (currentUser.username === 'gaurab' || currentUser.username === 'samc') && (
                          <button
                            className="ml-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={e => { e.stopPropagation(); handlePinComment(comment.id); }}
                            title={comment.pinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className={`h-4 w-4 opacity-60 ${comment.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {activeCommentId === comment.id && comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className="flex gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        onClick={() => setActiveReplyId(reply.id)}
                      >
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {reply.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-foreground">{reply.user.name}</span>
                            {reply.user.isHost && (
                              <Badge variant="secondary" className="text-xs">Host</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{reply.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                              <Heart className="h-3.5 w-3.5" />
                              <span>0</span>
                            </button>
                            <button 
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                              onClick={e => { e.stopPropagation(); setReplyToComment(comment); setReplyToReply(reply); }}
                            >
                              <CornerUpLeft className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>0</span>
                            </div>
                            {currentUser && (currentUser.username === 'gaurab' || currentUser.username === 'samc') && (
                              <button
                                className="ml-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={e => { e.stopPropagation(); handlePinReply(comment.id, reply.id); }}
                                title={reply.pinned ? 'Unpin' : 'Pin'}
                              >
                                <Pin className={`h-4 w-4 opacity-60 ${reply.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyToComment?.id === comment.id && (
                  <div className="ml-11 flex gap-2 mt-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (replyToReply ? handleAddReplyToReply(comment.id, replyToReply.id) : handleAddReply(comment.id))}
                      placeholder={replyToReply ? `Reply to ${replyToReply.user.name}...` : `Reply to ${comment.user.name}...`}
                      className="flex-1 text-sm px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button size="sm" onClick={() => replyToReply ? handleAddReplyToReply(comment.id, replyToReply.id) : handleAddReply(comment.id)} disabled={!commentInput.trim()}>
                      Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyToComment(null); setReplyToReply(null); setCommentInput(''); }}>
                      Cancel
                    </Button>
                  </div>
                )}

              </div>
            ))}
          </div>



        </DialogContent>
      </Dialog>
    </>
  );
};

export default Conversation; 