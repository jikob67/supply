
import React, { useState } from 'react';
import { View, User } from '../types';
import { SHARE_URL } from '../constants';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  PlusCircle, 
  MessageCircle, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Share2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { view: View.HOME, label: 'الرئيسية', icon: LayoutDashboard },
    { view: View.PROFILE, label: 'ملفي الشخصي', icon: UserIcon },
    { view: View.UPLOAD, label: 'إضافة مشروع', icon: PlusCircle },
    { view: View.CHAT, label: 'المحادثات', icon: MessageCircle },
    { view: View.SUBSCRIPTION, label: 'الاشتراكات', icon: CreditCard },
    { view: View.SUPPORT, label: 'الدعم الفني', icon: LifeBuoy },
    { view: View.SETTINGS, label: 'الإعدادات', icon: Settings },
  ];

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'supply app',
          text: 'اكتشف تطبيق supply لزيادة جمهور مشروعك!',
          url: SHARE_URL
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(SHARE_URL);
      alert('تم نسخ رابط التطبيق للحافظة!');
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-primary text-white p-4">
      <div className="flex items-center justify-center mb-8 mt-2">
        <h1 className="text-3xl font-bold tracking-wider">supply</h1>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => {
              setCurrentView(item.view);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.view 
                ? 'bg-white text-primary font-bold shadow-lg' 
                : 'hover:bg-white/10 text-gray-200'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="my-4 border-t border-white/10 pt-4">
           <button
            onClick={handleShareApp}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/10 text-yellow-300 font-medium"
          >
            <Share2 size={20} />
            <span>مشاركة التطبيق</span>
          </button>
        </div>
      </div>

      {user && (
        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <div className="overflow-hidden text-right">
              <p className="font-bold truncate">{user.fullName}</p>
              <p className="text-xs text-gray-300 truncate">{user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:block w-64 fixed h-full shadow-xl z-20">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-primary text-white z-30 shadow-md px-4 py-3 flex justify-between items-center">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-xl">supply</span>
        <button className="relative p-1">
          <Bell size={24} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-primary" onClick={(e) => e.stopPropagation()}>
            <NavContent />
          </div>
        </div>
      )}

      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
