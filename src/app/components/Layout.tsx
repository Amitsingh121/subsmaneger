import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  Calendar,
  Mail,
  CreditCard,
  AlertTriangle,
  Plus,
  Menu,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useTheme } from './ThemeProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Subscriptions', href: '/subscriptions', icon: List },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Accounts & Emails', href: '/accounts', icon: Mail },
  { name: 'Payment Methods', href: '/payments', icon: CreditCard },
  { name: 'Alerts & Duplicates', href: '/alerts', icon: AlertTriangle },
];

function NavigationItems({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();

  return (
    <>
      {navigation.map((item, index) => {
        const isActive = location.pathname === item.href;
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={item.href}
              onClick={onItemClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive
                  ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white shadow-lg shadow-violet-900/40 border border-violet-500/30 ring-1 ring-violet-400/20'
                  : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground hover:border hover:border-white/[0.06] border border-transparent'
                }
              `}
            >
              <motion.div
                animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
              </motion.div>
              <span>{item.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }} className="bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex border-r border-border bg-sidebar flex-col"
        style={{ width: '256px', minWidth: '256px', height: '100vh', overflow: 'hidden' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 border-b border-border flex items-center gap-3 shrink-0"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0 ring-1 ring-violet-400/20 overflow-hidden">
            <img src="/logo.png" alt="SubTrack" className="w-9 h-9 object-cover" />
          </div>
          <div>
            <motion.h1
              className="font-bold text-lg text-foreground tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              SubTrack
            </motion.h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 font-medium">Subscription Manager</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavigationItems />
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border space-y-3 shrink-0">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Add Subscription Button */}
          <Link to="/add">
            <Button className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-violet-900/40 border border-violet-500/20 font-semibold tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </Link>

          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SubTrack" className="w-8 h-8 rounded-lg" />
                <div>
                  <h1 className="font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                    SubTrack
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">Subscription Manager</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 p-4 space-y-1">
            <NavigationItems onItemClick={() => setMobileMenuOpen(false)} />
          </nav>
          <div className="p-4 border-t border-border space-y-3">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Add Subscription Button */}
            <Link to="/add" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-violet-900/40 border border-violet-500/20 font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </Button>
            </Link>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className="flex flex-col bg-background"
        style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'hidden' }}
      >
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="SubTrack" className="w-7 h-7 rounded-lg" />
            <h1 className="font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              SubTrack
            </h1>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40"
              >
                <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
