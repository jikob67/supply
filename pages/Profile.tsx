
import React, { useState } from 'react';
import { User, Project } from '../types';
import { MapPin, Calendar, Star, Settings, Share2, Award, TrendingUp, UserCheck, Lock, Rocket, Trash2, Eye, Heart, X, Megaphone } from 'lucide-react';
import { SHARE_URL } from '../constants';

interface ProfileProps {
  user: User | null;
  projects?: Project[];
  onPromote?: (projectId: string, action: 'PIN' | 'BOOST') => void;
  onDelete?: (projectId: string) => void;
  onUpgrade?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, projects = [], onPromote, onDelete, onUpgrade }) => {
  const [promoteModalOpen, setPromoteModalOpen] = useState<string | null>(null);

  if (!user) return <div className="p-8 text-center">يرجى تسجيل الدخول</div>;

  const myProjects = projects.filter(p => p.ownerId === user.id);

  const handleShare = async (url: string = SHARE_URL, title: string = 'supply app') => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `شاهد هذا المحتوى الرائع على supply: ${title}`,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط للحافظة!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPromoteModalOpen(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2"><Rocket className="text-yellow-500" /> ترويج المشروع</h3>
              <button onClick={() => setPromoteModalOpen(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <button onClick={() => { const proj = myProjects.find(p => p.id === promoteModalOpen); if (proj) handleShare(proj.link || SHARE_URL, proj.title); setPromoteModalOpen(null); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:bg-primary/5 transition-all">
                <Share2 size={24} className="text-blue-600" />
                <div className="text-right"><p className="font-bold">مشاركة خارجية</p><p className="text-xs text-gray-500">نشر الرابط عبر التطبيقات الأخرى</p></div>
              </button>
              <button onClick={() => { if (onPromote) onPromote(promoteModalOpen, 'PIN'); setPromoteModalOpen(null); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:bg-yellow-50 transition-all">
                <Star size={24} className="text-yellow-600" fill="currentColor" />
                <div className="text-right"><p className="font-bold">تثبيت في القمة</p><p className="text-xs text-gray-500">حصر للمشتركين فقط</p></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="flex items-end gap-6">
              <img src={user.avatar} alt={user.fullName} className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white object-cover" />
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {user.fullName}
                  {user.isPremium && <Star className="fill-yellow-400 text-yellow-400" size={20} />}
                </h1>
                <p className="text-gray-500 font-medium">{user.username}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600"><MapPin size={20} className="text-primary" /><span>{user.location || 'غير محدد'}</span></div>
              <div className="flex items-center gap-3 text-gray-600"><Calendar size={20} className="text-primary" /><span>عضو منذ 2024</span></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 mb-2">رصيد النقاط</h3>
              <div className="flex items-center gap-2 mb-2"><Award className="text-yellow-500" size={24} /><span className="text-2xl font-bold text-primary">{user.points}</span></div>
              <button onClick={() => handleShare()} className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:bg-secondary">شارك واكسب</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 mb-2">حالة الاشتراك</h3>
              <div className="flex justify-between items-center"><span className="font-bold">{user.isPremium ? 'باقة المحترفين' : 'باقة مجانية'}</span><button onClick={onUpgrade} className="text-xs text-primary underline">ترقية</button></div>
              <p className="text-xs text-gray-400 mt-2">{user.adsCount} من {user.isPremium ? '20' : '3'} إعلانات</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-primary px-2">مشاريعي</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myProjects.map(project => (
          <div key={project.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-40"><img src={project.image} className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 truncate">{project.title}</h3>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setPromoteModalOpen(project.id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold">ترويج</button>
                <button onClick={() => onDelete && onDelete(project.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
