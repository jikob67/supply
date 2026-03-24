import React, { useState, useRef } from 'react';
import { User, View, UserRole } from '../types';
import { Camera, Upload, MapPin, Loader2, X, Shield, FileText } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  setCurrentView: (view: View) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, setCurrentView }) => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    location: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("يرجى اختيار ملف صورة صحيح (JPG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsProcessingImage(true);
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setAvatarPreview(result);
        } else {
          alert("فشلت عملية معالجة الصورة. يرجى المحاولة مرة أخرى.");
        }
        setIsProcessingImage(false);
      };

      reader.onerror = () => {
        alert("حدث خطأ أثناء قراءة الصورة.");
        setIsProcessingImage(false);
      };

      reader.readAsDataURL(file);
    }
    // Always clear the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarPreview(null);
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("تعذر تحديد الموقع تلقائياً. يرجى التأكد من تفعيل خدمة الموقع أو إدخاله يدوياً.");
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      alert("الموقع الجغرافي غير مدعوم في هذا المتصفح.");
      setLocationLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessingImage) {
      alert('يرجى الانتظار حتى تكتمل معالجة الصورة');
      return;
    }

    if (!avatarPreview) {
      alert('يرجى رفع صورة شخصية للمتابعة');
      return;
    }

    if (!formData.location) {
      alert('يرجى تحديد موقعك الجغرافي للمتابعة');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        id: `u-${Date.now()}`,
        username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`,
        fullName: formData.username,
        email: formData.email,
        avatar: avatarPreview || `https://ui-avatars.com/api/?name=${formData.username}&background=random`,
        gender: 'Male',
        birthDate: '',
        location: formData.location,
        role: UserRole.USER,
        points: 0,
        isPremium: false,
        adsCount: 0,
      };
      onLogin(newUser);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-primary mb-2 tracking-tight">supply</h1>
          <p className="text-gray-500 font-medium italic">Your gateway to growth</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b pb-4">إنشاء حساب جديد</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div onClick={triggerFileInput} className="relative cursor-pointer group">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden transition-all shadow-inner ${avatarPreview ? 'border-primary ring-4 ring-primary/10' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                {isProcessingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] mt-1 text-gray-500 font-bold">جاري الرفع...</span>
                  </div>
                ) : avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="mx-auto mb-1" size={28} />
                    <span className="text-xs font-bold block">صورة شخصية</span>
                    <span className="text-[10px] opacity-70">مطلوبة *</span>
                  </div>
                )}
              </div>
              
              {avatarPreview ? (
                <button type="button" onClick={clearImage} className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10">
                  <X size={16} />
                </button>
              ) : (
                <div className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform ring-2 ring-white">
                  <Upload size={16} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="example@mail.com" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">اسم المستخدم</label>
              <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="username" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">الموقع الجغرافي <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="text" required readOnly placeholder="حدد موقعك بالأيقونة" value={formData.location} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium focus:outline-none" />
                <button type="button" onClick={handleGetLocation} disabled={locationLoading} className="bg-primary text-white hover:bg-secondary p-3 rounded-xl transition-all flex items-center justify-center min-w-[54px] shadow-sm disabled:opacity-50">
                  {locationLoading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={22} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || isProcessingImage} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-secondary transition-all disabled:opacity-70 flex justify-center items-center shadow-xl mt-6">
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 items-center">
            <button onClick={() => setCurrentView(View.TERMS)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors font-medium">
              <FileText size={14} /> سياسة الاستخدام والتعامل
            </button>
            <button onClick={() => setCurrentView(View.PRIVACY)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors font-medium">
              <Shield size={14} /> سياسة الخصوصية وأمان البيانات
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;