
import React, { useState } from 'react';
import { Project, ProjectType, View } from '../types';
import { Eye, Heart, Users, MessageSquare, Filter, Star, X, Send, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HomeProps {
  setCurrentView: (view: View) => void;
  projects: Project[];
  onLike?: (projectId: string) => void;
  onComment?: (projectId: string, text: string) => void;
  onContact?: (project: Project) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentView, projects, onLike, onComment, onContact }) => {
  const [filter, setFilter] = useState<ProjectType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [commentsProject, setCommentsProject] = useState<Project | null>(null);
  const [commentText, setCommentText] = useState('');

  const statsData = [
    { name: 'المشاريع', value: projects.length },
    { name: 'الجماهير', value: 0 },
    { name: 'المهتمين', value: projects.reduce((acc, p) => acc + p.stats.interested, 0) },
    { name: 'المشاهدات', value: projects.reduce((acc, p) => acc + p.stats.views, 0) },
  ];

  // Filter and Sort Projects (Pinned projects first)
  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'ALL' || p.type === filter;
    const matchesSearch = p.title.includes(searchQuery) || p.description.includes(searchQuery);
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    // Sort pinned first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleContactOwner = (project: Project) => {
    if (onContact) {
      onContact(project);
    } else {
      setCurrentView(View.CHAT);
    }
  };

  const submitComment = () => {
    if (commentText.trim() && commentsProject && onComment) {
      onComment(commentsProject.id, commentText);
      setCommentText('');
    }
  };

  // Fallback image function
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000';
  };

  return (
    <div className="space-y-8 relative">
      
      {/* --- Details Modal --- */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 md:h-80">
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
                onError={handleImageError} 
              />
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{selectedProject.type}</span>
                    <span className="text-gray-400 text-xs">{new Date(selectedProject.createdAt).toLocaleDateString('ar-EG')}</span>
                 </div>
                 <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedProject.title}</h2>
                 <div className="flex items-center gap-3 border-b pb-6">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                     {selectedProject.ownerName[0]}
                   </div>
                   <div>
                     <p className="font-bold text-gray-800">{selectedProject.ownerName}</p>
                     <p className="text-xs text-gray-500">صاحب المشروع</p>
                   </div>
                 </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-2">وصف المشروع</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {selectedProject.link && (
                  <a href={selectedProject.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ExternalLink size={20} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">رابط المشروع</p>
                      <p className="text-xs text-blue-500 truncate">{selectedProject.link}</p>
                    </div>
                  </a>
                )}
                
                {selectedProject.fileUrl && (
                  <a href={selectedProject.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Download size={20} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">ملفات مرفقة</p>
                      <p className="text-xs text-gray-500">اضغط للتحميل</p>
                    </div>
                  </a>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleContactOwner(selectedProject)}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
                >
                  تواصل مع المالك
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Comments Modal --- */}
      {commentsProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCommentsProject(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md h-[500px] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg">التعليقات ({commentsProject.comments.length})</h3>
              <button onClick={() => setCommentsProject(null)}><X size={20} className="text-gray-500 hover:text-red-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {commentsProject.comments.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p>لا توجد تعليقات بعد. كن الأول!</p>
                </div>
              ) : (
                commentsProject.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-primary">{comment.userName}</span>
                      <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-gray-50 rounded-b-2xl flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="اكتب تعليقاً..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button 
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="bg-primary text-white p-2 rounded-full hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-primary mb-4">إحصائيات المنصة</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#330033' }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#330033', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#330033" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {statsData.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
              <span className="text-4xl font-bold text-primary mb-2">{stat.value.toLocaleString()}</span>
              <span className="text-gray-500">{stat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الكل
          </button>
          {Object.values(ProjectType).map(type => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${filter === type ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {type === ProjectType.DIGITAL ? 'رقمي' : type === ProjectType.PHYSICAL ? 'مادي' : type === ProjectType.SERVICE ? 'خدمي' : 'أخرى'}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="بحث عن مشروع..." 
            className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div 
            key={project.id} 
            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border group ${project.isPinned ? 'border-yellow-400 border-2 shadow-yellow-100' : 'border-gray-100'}`}
          >
            <div 
              className="relative h-48 overflow-hidden cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={handleImageError} 
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-primary">
                {project.type}
              </div>
              {project.isPinned && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-primary px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                   <Star size={12} fill="currentColor" /> مميز
                </div>
              )}
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-primary">
                   {project.ownerName[0]}
                </div>
                <span className="text-sm font-medium text-gray-600">{project.ownerName}</span>
              </div>
              
              <h3 
                className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedProject(project)}
              >
                {project.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">{project.description}</p>
              
              <div className="flex items-center justify-between text-gray-400 text-sm border-t pt-4">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer" title="المشاهدات">
                    <Eye size={16} /> {project.stats.views}
                  </span>
                  <button 
                    onClick={() => onLike && onLike(project.id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${project.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    title="أعجبني"
                  >
                    <Heart size={16} fill={project.isLiked ? 'currentColor' : 'none'} /> {project.stats.interested}
                  </button>
                  <button 
                    onClick={() => setCommentsProject(project)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
                    title="التعليقات"
                  >
                    <MessageSquare size={16} /> {project.comments.length}
                  </button>
                </div>
                <span className="flex items-center gap-1 text-primary font-medium" title="الجمهور">
                  <Users size={16} /> {project.stats.audience}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 flex justify-between items-center">
                <button 
                  onClick={() => handleContactOwner(project)}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  تواصل مع المالك
                </button>
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  التفاصيل
                </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-lg">لا توجد مشاريع حالياً</p>
          <p className="text-sm text-gray-400 mt-2">كن أول من ينشر مشروعه هنا!</p>
          <button onClick={() => setCurrentView(View.UPLOAD)} className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors">إضافة مشروع</button>
        </div>
      )}
    </div>
  );
};

export default Home;
