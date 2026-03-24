
import React, { useState } from 'react';
import { View, User, Project, ProjectType, Comment } from './types';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import Subscription from './pages/Subscription';
import Support from './pages/Support';
import Legal from './pages/Legal';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [chatTargetProject, setChatTargetProject] = useState<Project | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(View.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.AUTH);
  };

  const handleProjectCreate = (newProject: Project) => {
    if (user) {
      // Add the new project to the start of the list
      setProjects([newProject, ...projects]);
      // Increment ads count locally
      setUser({ ...user, adsCount: user.adsCount + 1 });
      setCurrentView(View.HOME);
    }
  };

  const handleLikeProject = (projectId: string) => {
    if (!user) return;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: newIsLiked,
          stats: {
            ...p.stats,
            interested: p.stats.interested + (newIsLiked ? 1 : -1)
          }
        };
      }
      return p;
    }));
  };

  const handleAddComment = (projectId: string, text: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.username,
      text,
      createdAt: new Date().toLocaleDateString('ar-EG')
    };
    
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
  };

  const handlePromoteProject = (projectId: string, action: 'PIN' | 'BOOST') => {
    if (!user) return;

    if (action === 'PIN') {
      if (!user.isPremium) {
        alert("هذه الميزة حصرية لمشتركي الباقات المدفوعة!");
        setCurrentView(View.SUBSCRIPTION);
        return;
      }
      // Toggle pin status
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, isPinned: !p.isPinned } : p
      ));
    } else if (action === 'BOOST') {
      // Ad Campaign Logic
      const BOOST_COST = 50;
      if (user.points >= BOOST_COST) {
        if (window.confirm(`هل تريد بدء حملة إعلانية لهذا المشروع مقابل ${BOOST_COST} نقطة؟`)) {
          setUser({ ...user, points: user.points - BOOST_COST });
          alert('تم تفعيل الحملة الإعلانية بنجاح! سيتم زيادة ظهور مشروعك.');
          // Logic to boost project visibility could be added here
        }
      } else {
        alert(`رصيد النقاط غير كافٍ (${user.points}). تحتاج إلى ${BOOST_COST} نقطة لبدء الحملة.`);
      }
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      setProjects(projects.filter(p => p.id !== projectId));
      if (user) setUser({ ...user, adsCount: Math.max(0, user.adsCount - 1) });
    }
  };

  const handleContactOwner = (project: Project) => {
    setChatTargetProject(project);
    setCurrentView(View.CHAT);
  };

  const handleUpgradeRedirect = () => {
    setCurrentView(View.SUBSCRIPTION);
  };

  // ACTUAL Payment Confirmation Logic
  const confirmSubscription = (planType: 'PRO' | 'ENTERPRISE') => {
    if (user) {
      setUser({
        ...user,
        isPremium: true,
        role: planType === 'ENTERPRISE' ? 'ADMIN' : 'USER', // Example logic
        points: user.points + (planType === 'PRO' ? 100 : 500), // Bonus points
        // Reset ads count or increase limit logic handled in Upload.tsx check
      });
      alert(`مبروك! تم تفعيل اشتراك ${planType === 'PRO' ? 'باقة المحترفين' : 'باقة الشركات'} بنجاح.`);
      setCurrentView(View.PROFILE);
    }
  };

  // Views accessible without login
  if (!user) {
    if (currentView === View.TERMS || currentView === View.PRIVACY) {
      return <Legal type={currentView} onBack={() => setCurrentView(View.AUTH)} />;
    }
    return <Auth onLogin={handleLogin} setCurrentView={setCurrentView} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return (
          <Home 
            setCurrentView={setCurrentView} 
            projects={projects} 
            onLike={handleLikeProject}
            onComment={handleAddComment}
            onContact={handleContactOwner}
          />
        );
      case View.PROFILE:
        return (
          <Profile 
            user={user} 
            projects={projects} 
            onPromote={handlePromoteProject}
            onDelete={handleDeleteProject}
            onUpgrade={handleUpgradeRedirect}
          />
        );
      case View.UPLOAD:
        return (
          <Upload 
            setCurrentView={setCurrentView} 
            user={user} 
            onProjectCreate={handleProjectCreate} 
          />
        );
      case View.CHAT:
        return <Chat initialProject={chatTargetProject} currentUser={user} />;
      case View.SUBSCRIPTION:
        return <Subscription onPaymentSuccess={confirmSubscription} />;
      case View.SUPPORT:
        return <Support />;
      case View.TERMS:
      case View.PRIVACY:
        return <Legal type={currentView} onBack={() => setCurrentView(View.SETTINGS)} />;
      case View.SETTINGS:
        return (
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-primary mb-4">الإعدادات</h2>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold mb-4">قانوني</h3>
               <div className="flex flex-col gap-2">
                 <button onClick={() => setCurrentView(View.TERMS)} className="text-right p-3 hover:bg-gray-50 rounded-lg transition-colors">سياسة الاستخدام</button>
                 <button onClick={() => setCurrentView(View.PRIVACY)} className="text-right p-3 hover:bg-gray-50 rounded-lg transition-colors">سياسة الخصوصية</button>
               </div>
             </div>
          </div>
        );
      default:
        return <Home setCurrentView={setCurrentView} projects={projects} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
