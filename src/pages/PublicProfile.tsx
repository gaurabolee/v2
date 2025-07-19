import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, SocialLinks as ContextSocialLinks, VerificationStatus as ContextVerificationStatus, ExtendedUser } from '@/context/AuthContext';
import { query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { updateProfile as updateFirebaseAuthProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User as UserIcon, Linkedin, Twitter, Facebook, Instagram, Copy, Mail, Share, Youtube, Shield, Settings, Camera, CopyIcon, CheckIcon, Loader2, MoreVertical, ImagePlus, Edit3, Trash2, Check, Users, MessageSquare, Calendar } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import DebateCard from '@/components/DebateCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarEditor from 'react-avatar-editor';
import { Slider } from "@/components/ui/slider";
import heic2any from 'heic2any';
import { createWorker, Worker } from 'tesseract.js';
import Logo from '@/components/Logo';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';

// Declare global window property
declare global {
  interface Window {
    _verifiedProfiles: {
      [username: string]: boolean;
    } | undefined;
  }
}

interface SocialLinks {
  [key: string]: string;
}

interface ProfileUser {
  name: string;
  username: string;
  bio: string;
  photoURL: string;
  verificationStatus?: {
    [key: string]: ContextVerificationStatus;
  };
  socialLinks?: SocialLinks;
}

interface DebateHistory {
  id: string;
  title: string;
  description: string;
  participants: number;
  messages: number;
  status: 'active' | 'completed';
  category: string;
  date: string;
}

// Mock data for Rick Harris
const RICK_HARRIS_PROFILE: ExtendedUser = {
  uid: 'rick-harris-mock',
  name: 'Rick Harris',
  username: 'rickharris',
  email: 'rick@example.com',
  bio: 'Rick Harris is a digital strategist and podcast innovator, passionate about the intersection of technology and storytelling. With over a decade of experience, he helps creators build communities, amplify voices, and shape the future of public conversations online.',
  photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/rickharris',
    twitter: 'https://twitter.com/rickharris',
    facebook: 'https://facebook.com/rickharris',
    instagram: 'https://instagram.com/rickharris',
    youtube: 'https://youtube.com/@rickharris',
    tiktok: ''
  },
  verificationStatus: {
    linkedin: { status: 'verified' },
    twitter: { status: 'verified' },
    facebook: { status: 'verified' },
    instagram: { status: 'verified' },
    youtube: { status: 'verified' },
    tiktok: { status: 'unverified' }
  },
  updatedAt: new Date().toISOString(),
  displayName: 'Rick Harris',
  emailVerified: true,
  isAnonymous: false
};

const RICK_HARRIS_DEBATES: DebateHistory[] = [
  {
    id: '1',
    title: 'The Future of Podcast is Text',
    description: 'Exploring how text-based conversations are reshaping the podcast landscape and creating new opportunities for engagement.',
    participants: 24,
    messages: 158,
    status: 'active',
    category: 'Technology',
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Community Building in the Digital Age',
    description: 'How online platforms are changing the way we build and maintain communities.',
    participants: 36,
    messages: 242,
    status: 'completed',
    category: 'Social Media',
    date: '2024-01-10'
  },
  {
    id: '3',
    title: 'The Evolution of Content Creation',
    description: 'From traditional media to digital platforms - how creators are adapting to new technologies.',
    participants: 18,
    messages: 89,
    status: 'active',
    category: 'Content Creation',
    date: '2024-01-08'
  },
  {
    id: '4',
    title: 'Digital Storytelling Techniques',
    description: 'Modern approaches to storytelling in the digital landscape.',
    participants: 42,
    messages: 187,
    status: 'completed',
    category: 'Storytelling',
    date: '2024-01-05'
  }
];

// Custom TikTok icon
const TikTokIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom X icon
const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function PublicProfile() {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastKnownVerification, setLastKnownVerification] = useState<{[key: string]: ContextVerificationStatus} | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const lastKnownVerificationRef = useRef(lastKnownVerification);
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  // Handle Rick Harris mock profile
  useEffect(() => {
    if (username === 'rickharris') {
      setProfileUser(RICK_HARRIS_PROFILE);
      setIsVerified(true);
      setLoading(false);
      return;
    }
  }, [username]);

  // For extreme persistence, store verification in a global property as well
  useEffect(() => {
    // Check if the window global cache already has verification for this user
    if (username && window._verifiedProfiles && window._verifiedProfiles[username]) {
      console.log("Using global window cache for verification status");
      setIsVerified(true);
    }
  }, [username]);

  // Setup global object to store verified profiles across renders
  useEffect(() => {
    if (!window._verifiedProfiles) {
      window._verifiedProfiles = {};
    }
  }, []);

  // When verification status changes, update global cache
  useEffect(() => {
    if (isVerified && username) {
      console.log("Storing verification in global window cache");
      window._verifiedProfiles = window._verifiedProfiles || {};
      window._verifiedProfiles[username] = true;
    }
  }, [isVerified, username]);

  // Keep ref in sync with state
  useEffect(() => { 
    lastKnownVerificationRef.current = lastKnownVerification; 
  }, [lastKnownVerification]);

  // Add tab visibility handler to restore verification when switching back to tab
  useEffect(() => {
    if (!username) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, restoring verification status");
        const storedVerification = localStorage.getItem(`verified_profile_${username}`);
        if (storedVerification) {
          try {
            const parsed = JSON.parse(storedVerification);
            const hasVerifiedStatus = Object.values(parsed).some(
              (status: any) => status && typeof status === 'object' && 
                            'status' in status && status.status === 'verified'
            );
            
            if (hasVerifiedStatus) {
              console.log("Found verification in localStorage, restoring verification badge");
              setLastKnownVerification(parsed);
              setIsVerified(true);
            }
          } catch (error) {
            console.error("Error parsing stored verification:", error);
          }
        }
      }
    };
    
    // Run once on mount to ensure we have verification status
    handleVisibilityChange();
    
    // Add event listener for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [username]);

  // Load any previously stored verification data from localStorage on component mount
  useEffect(() => {
    if (!username) return;
    
    try {
      console.log("CHECKING LOCALSTORAGE FOR:", username);
      const storedVerification = localStorage.getItem(`verified_profile_${username}`);
      
      if (storedVerification) {
        console.log(`Found stored verification for ${username}:`, storedVerification);
        const parsed = JSON.parse(storedVerification);
        setLastKnownVerification(parsed);
        
        // Pre-set verification status based on localStorage
        const hasVerified = Object.values(parsed).some(
          (status: any) => status && typeof status === 'object' && 
                         'status' in status && status.status === 'verified'
        );
        
        if (hasVerified) {
          console.log("PRE-SETTING VERIFIED STATUS TO TRUE FROM CACHE");
          setIsVerified(true);
        }
      } else {
        console.log("No stored verification found in localStorage");
      }
    } catch (error) {
      console.error("Error loading cached verification:", error);
    } finally {
      setLocalStorageChecked(true);
    }
  }, [username]);

  // Wait for localStorage check before setting up Firestore listener
  useEffect(() => {
    if (!username || !localStorageChecked || username === 'rickharris') {
      console.log("Waiting for localStorage check to complete or handling mock profile...");
      return;
    }
    
    console.log("localStorage check complete, setting up Firestore listener");
    setLoading(true);

    // Query Firestore once to find the user ID by username
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));

    let unsubscribe: (() => void) | undefined;

    const getUserAndListen = async () => {
      try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No user found with username:", username);
          setProfileUser(null);
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;

        // Now set up the real-time listener using the user ID
        const userDocRef = doc(db, "users", userId);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Real-time update for user:", username);
            console.log("Verification status in Firestore:", userData.verificationStatus);
            
            // Combine user data with UID (useful for consistency)
            const updatedUser = { ...userData, uid: userId } as ExtendedUser;
            
            // Compute verification state using the ref instead of state
            const cacheVerified = lastKnownVerificationRef.current ? 
              Object.values(lastKnownVerificationRef.current).some(
                status => status && typeof status === 'object' && 'status' in status && status.status === 'verified'
              ) : false;
            
            const firestoreVerified = Object.values(userData.verificationStatus || {}).some(
              status => status && typeof status === 'object' && 'status' in status && status.status === 'verified'
            );
            
            const verified = firestoreVerified || cacheVerified;
            
            if (firestoreVerified && !cacheVerified) {
              console.log("Found verified status in Firestore, saving to localStorage");
              // Save to both localStorage and sessionStorage for redundancy
              localStorage.setItem(`verified_profile_${username}`, JSON.stringify(userData.verificationStatus));
              sessionStorage.setItem(`verified_profile_${username}`, JSON.stringify(userData.verificationStatus));
              setLastKnownVerification(userData.verificationStatus);
            }
            // If localStorage has verification but Firestore doesn't, inject the verified status
            else if (!firestoreVerified && cacheVerified && lastKnownVerificationRef.current) {
              console.log("Using cached verification, not found in Firestore");
              
              // Inject cached verification data into user object for consistent display
              if (!updatedUser.verificationStatus) {
                updatedUser.verificationStatus = {};
              }
              
              // Add verified platforms from cache to ensure icons display properly
              Object.entries(lastKnownVerificationRef.current).forEach(([platform, status]) => {
                if (status && typeof status === 'object' && 'status' in status && status.status === 'verified') {
                  if (!updatedUser.verificationStatus![platform] || 
                      updatedUser.verificationStatus![platform].status !== 'verified') {
                    console.log(`Adding verified status for ${platform} from cache`);
                    updatedUser.verificationStatus![platform] = status;
                  }
                }
              });
            }
            
            setIsVerified(verified);
            
            // Set the profile user with potentially modified verification data
            setProfileUser(updatedUser);
          } else {
            console.log("User document deleted for:", username);
            setProfileUser(null); 
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setProfileUser(null);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error fetching user ID by username:", error);
        setProfileUser(null);
        setLoading(false);
      }
    };

    getUserAndListen();

    return () => {
      if (unsubscribe) {
        console.log("Unsubscribing from user listener:", username);
        unsubscribe();
      }
    };
  }, [username, localStorageChecked]); // Add localStorageChecked back to the dependency array

  const renderSocialLinks = () => {
    if (!profileUser?.socialLinks) return null;

    const socialIcons = {
      linkedin: <Linkedin className="h-4 w-4" />,
      twitter: <XIcon className="h-4 w-4" />,
      facebook: <Facebook className="h-4 w-4" />,
      instagram: <Instagram className="h-4 w-4" />,
      youtube: <Youtube className="h-4 w-4" />,
      tiktok: <TikTokIcon className="h-4 w-4" />
    };

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(profileUser.socialLinks).map(([platform, url]) => {
          if (!url) return null;
          
          const isVerified = profileUser.verificationStatus?.[platform]?.status === 'verified';
          
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                "bg-gray-100 hover:bg-gray-200 text-gray-700",
                isVerified && "bg-blue-50 hover:bg-blue-100 text-blue-700"
              )}
            >
              {socialIcons[platform as keyof typeof socialIcons]}
              <span className="capitalize">{platform}</span>
              {isVerified && <Check className="h-3 w-3" />}
            </a>
          );
        })}
      </div>
    );
  };

  const renderDebateCard = (debate: DebateHistory) => (
    <Card key={debate.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{debate.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{debate.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {debate.participants}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {debate.messages}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(debate.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={debate.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {debate.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {debate.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // If loading, show a loading state (WITH Navbar)
  if (loading && !isVerified) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading profile...</h1>
          </div>
        </div>
      </>
    );
  }

  // If no user is found and no verification, show a message (WITH Navbar)
  if (!profileUser && !isVerified) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  if (username === 'rickharris') {
    // Create a custom profile component for Rick Harris with his specific data
    const rickHarrisData = {
      uid: 'rick-harris-mock',
      name: 'Rick Harris',
      username: 'rickharris',
      email: 'rick@example.com',
      bio: 'Rick Harris is a digital strategist and podcast innovator, passionate about the intersection of technology and storytelling. With over a decade of experience, he helps creators build communities, amplify voices, and shape the future of public conversations online.',
      photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/rickharris',
        twitter: 'https://twitter.com/rickharris',
        facebook: 'https://facebook.com/rickharris',
        instagram: 'https://instagram.com/rickharris',
        youtube: 'https://youtube.com/@rickharris',
        tiktok: ''
      },
      verificationStatus: {
        linkedin: { status: 'verified' },
        twitter: { status: 'verified' },
        facebook: { status: 'verified' },
        instagram: { status: 'verified' },
        youtube: { status: 'verified' },
        tiktok: { status: 'unverified' }
      },
      updatedAt: new Date().toISOString(),
      displayName: 'Rick Harris',
      emailVerified: true,
      isAnonymous: false
    };

    // Temporarily set the current user to Rick Harris data
    const originalUser = currentUser;
    // We'll need to modify the Profile component to accept user data as prop
    // For now, let's create a custom render
    return (
      <>
        <Navbar />
              <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
        <Card className="mb-8 border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative w-full">
                <div className="relative">
                  <Avatar className="h-24 w-24 shadow-md border-4 border-background">
                    <AvatarImage 
                      src={rickHarrisData.photoURL || undefined} 
                      alt={rickHarrisData.name}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback>
                      {rickHarrisData.name ? rickHarrisData.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium font-sans tracking-tight leading-tight text-foreground">{rickHarrisData.name}</span>
                  </div>
                  <span className="text-base font-medium text-muted-foreground font-sans">@{rickHarrisData.username}</span>
                  
                  {/* Follower count */}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">1.2k</span> followers
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">856</span> following
                    </span>
                  </div>
                  
                  {rickHarrisData.bio && (
                    <p className="mt-2 text-sm text-foreground/80 font-sans text-center sm:text-left max-w-xl">{rickHarrisData.bio}</p>
                  )}
                  <div className="w-full border-t border-foreground/20 my-4"></div>
                                    <div className="w-full">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide uppercase">Verified Accounts</h3>
                    <div className="flex flex-row gap-3 justify-center sm:justify-start">
                      {/* LinkedIn */}
                      <div className="relative group">
                        <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                          <Linkedin className="h-4 w-4 text-foreground/80" />
                        </span>
                      </div>
                      
                      {/* Twitter */}
                      <div className="relative group">
                        <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                          <XIcon className="h-4 w-4 text-foreground/80" />
                        </span>
                      </div>
                      
                      {/* Facebook */}
                      <div className="relative group">
                        <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                          <Facebook className="h-4 w-4 text-foreground/80" />
                        </span>
                      </div>
                      
                      {/* Instagram */}
                      <div className="relative group">
                        <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                          <Instagram className="h-4 w-4 text-foreground/80" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium border-foreground/20 text-foreground/80 hover:text-foreground hover:border-foreground/40 transition-all duration-200 hover:shadow-sm bg-background/50 backdrop-blur-sm"
                  >
                    Follow
                  </Button>
                  <Button 
                    variant="default"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground/80 hover:text-foreground border border-foreground/20 transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
                  >
                    Invite
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Empty content - removed duplicate social media icons */}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="activity">
            <TabsList className="mb-6">
              <TabsTrigger value="activity" className="px-4">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <TransitionWrapper animation="slide-up">
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Conversations Yet</h3>
                </div>
              </TransitionWrapper>
            </TabsContent>
                  </Tabs>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
        {/* Profile Header */}
        {username !== 'rickharris' && (
          <Card className="mb-8 border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 dark:border-muted/40">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 shadow-md border-4 border-background">
                  <AvatarImage src={profileUser?.photoURL || undefined} alt={profileUser?.name} />
                  <AvatarFallback>
                    <UserIcon className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-medium font-sans tracking-tight leading-tight text-foreground">{profileUser?.name}</h1>
                    {isVerified && (
                      <Badge variant="default" className="bg-blue-500">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-base font-medium text-muted-foreground font-sans mb-1">@{profileUser?.username}</p>
                  <p className="text-sm text-foreground/80 font-sans mb-4">{profileUser?.bio}</p>
                  
                  {renderSocialLinks()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="debates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="debates">Debates</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="debates" className="mt-6">
            <div className="space-y-4">
              {RICK_HARRIS_DEBATES.map(renderDebateCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Started debate "The Future of Podcast is Text"</span>
                    <span className="text-xs text-gray-400 ml-auto">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed debate "Community Building in the Digital Age"</span>
                    <span className="text-xs text-gray-400 ml-auto">1 week ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Joined 5 new debates</span>
                    <span className="text-xs text-gray-400 ml-auto">2 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About Rick Harris</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-gray-600 text-sm">
                      Over a decade of experience in digital strategy, podcast innovation, and community building. 
                      Specializes in helping creators build engaged audiences and monetize their content effectively.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Digital Strategy</Badge>
                      <Badge variant="outline">Podcast Innovation</Badge>
                      <Badge variant="outline">Community Building</Badge>
                      <Badge variant="outline">Content Creation</Badge>
                      <Badge variant="outline">Technology</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{RICK_HARRIS_DEBATES.length}</div>
                        <div className="text-xs text-gray-500">Debates</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">120</div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">678</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </>
  );
} 