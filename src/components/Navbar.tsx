import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, Home, Bell, MessageCircle, Share2, LogIn, UserPlus, Search, LogOut, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, loading } = useAuth();
  const { unreadBellCount, unreadMessageCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isProfilePage = location.pathname === '/profile';

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast('Goodbye', {
        description: 'You have been logged out',
        duration: 3000,
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      toast('Error', {
        description: 'Failed to log out',
        duration: 3000,
      });
    }
  };

  // Helper for precise nav highlighting
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    {
      name: 'Home',
      path: '/home',
      icon: <Home className="h-5 w-5" />
    }, 
    {
      name: 'Activity',
      path: '/notifications',
      icon: (
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unreadBellCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadBellCount}
            </Badge>
          )}
        </div>
      )
    }, 
    {
      name: 'Conversations',
      path: '/messages',
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      name: 'Invite',
      path: '/invite',
      icon: <Share2 className="h-5 w-5" />
    }
  ];

  if (loading) {
    return (
      <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent py-5')}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
          </Link>
        </div>
      </header>
    );
  }

  // Always show nav except on auth pages
  if (isAuthPage) {
    return (
      <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent py-5')}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-background py-5', scrolled ? '' : '')}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={currentUser && !isLandingPage && !isAuthPage ? "/home" : "/"} className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </Link>

        {currentUser && !isLandingPage && !isAuthPage && (
          <div className="hidden md:block">
            <div className="relative flex items-center bg-muted/70 dark:bg-[#23272f] shadow-lg border border-muted/40 rounded-full px-3 py-1 transition-all duration-300 focus-within:shadow-xl focus-within:border-primary/30 hover:shadow-xl hover:border-primary/20 h-10">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Arena..."
                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0 text-sm py-1"
              />
            </div>
          </div>
        )}

        {currentUser && !isLandingPage && !isAuthPage && (
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex flex-col items-center gap-1 text-sm font-medium transition-all duration-300 hover:text-primary group",
                      isActive(link.path) ? "text-primary" : "text-foreground"
                    )}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "p-0 w-auto h-auto min-w-0 min-h-0 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent transition-none flex items-center justify-center",
                      )}
                      aria-label={link.name}
                    >
                      {link.name === 'Activity' ? (
                        <div className="relative flex items-center justify-center w-full h-full">
                          <Bell className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive(link.path) ? "text-primary" : "text-muted-foreground"
                          )} />
                          {unreadBellCount > 0 && (
                            <Badge
                              variant="default"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {unreadBellCount}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        React.cloneElement(link.icon, {
                          className: cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive(link.path) ? "text-primary" : "text-muted-foreground"
                          )
                        })
                      )}
                    </Button>
                    <span className={cn(
                      "text-xs font-medium transition-all duration-300 opacity-100 translate-y-0",
                      isActive(link.path) ? "text-primary" : "text-muted-foreground"
                    )}>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center space-x-4 h-10">
          {currentUser && !isLandingPage && !isAuthPage ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'profile-active' : ''} flex flex-col items-center gap-1 group`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "p-0 w-auto h-auto min-w-0 min-h-0 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent transition-none flex items-center justify-center",
                    isActive('/profile') ? "text-primary" : "text-foreground"
                  )} 
                  aria-label="Your profile"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.photoURL || undefined} />
                    <AvatarFallback>
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 opacity-100 translate-y-0",
                  isActive('/profile') ? "text-primary" : "text-muted-foreground"
                )}>
                  Profile
                </span>
              </Link>
            </>
          ) : (!currentUser || isLandingPage) && (
            <>
              {!isAuthPage && (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="button-effect font-display">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm" className="button-effect font-display">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
          <div className="group flex flex-col items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 w-auto h-auto min-w-0 min-h-0 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent transition-none flex items-center justify-center"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="flex items-center justify-center w-full h-full">
                {theme === 'dark' 
                  ? <Sun className="h-5 w-5 block relative top-[-2px] left-[2px] text-muted-foreground group-hover:text-primary group-focus:text-primary" /> 
                  : <Moon className="h-5 w-5 block relative top-[-2px] left-[2px] text-muted-foreground group-hover:text-primary group-focus:text-primary" />}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
