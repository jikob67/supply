import React, { useState, useRef } from 'react';
import { ProjectType, View, User, Project } from '../types';
import { Upload as UploadIcon, X, Image as ImageIcon, Video, AlertTriangle, Link, FileText, Lock, Loader2 } from 'lucide-react';

interface UploadProps {
  setCurrentView: (view: View) => void;
  user: User;
  onProjectCreate: (project: Project) => void;
}

const Upload: React.FC<UploadProps> = ({ setCurrentView, user, onProjectCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ProjectType.DIGITAL,
    link: '',
  });

  const [imageContent, setImageContent] = useState<string | null>(null);
  const [videoContent, setVideoContent] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<{name: string, data: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check subscription limits
  const isFree = !user.isPremium;
  const adsUsed = user.adsCount;
  const limitReached = isFree && adsUsed >= 3;

  const handleFileRead = (file: File, type: 'image' | 'video' | 'file') => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'image') setImageContent(result);
      else if (type === 'video') setVideoContent(result);
      else if (type === 'file') setFileContent({ name: file.name, data: result });
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert("حدث خطأ أثناء قراءة الملف");
      setIsProcessing(false);
    };

    if (type === 'file') {
      reader.readAsDataURL(file); // Store as data URL for persistence
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (limitReached) return;
    if (isProcessing) return;

    if (!imageContent) {
      alert("يرجى رفع صورة إعلانية للمشروع");
      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ownerId: user.id,
      ownerName: user.username,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      link: formData.link,
      image: imageContent,
      video: videoContent || undefined,
      fileUrl: fileContent?.data || undefined,
      stats: {
        views: 0,
        interested: 0,
        audience: 0
      },
      comments: [],
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    
    onProjectCreate(newProject);
  };

  if (limitReached) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center py-24">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Lock className="text-red-500" size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">لقد استهلكت رصيد الإعلانات المجانية</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          يسمح الحساب المجاني بنشر 3 مشاريع فقط. 
          <br />
          كن محترفاً الآن واحصل على وصول غير محدود لآلاف العملاء المهتمين.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setCurrentView(View.HOME)}
            className="px-8 py-3 border-2 border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            العودة للرئيسية
          </button>
          <button 
            onClick={() => setCurrentView(View.SUBSCRIPTION)}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-secondary shadow-lg transform transition-all hover:scale-105"
          >
            ترقية الحساب الآن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
      <div className="mb-10 border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-extrabold text-primary mb-2">إضافة مشروع جديد</h2>
        <p className="text-gray-500 font-medium">املأ التفاصيل التالية لنشر مشروعك في مجتمع Supply</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المشروع</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-all"
            placeholder="مثلاً: تطبيق توصيل ذكي، متجر تجارة إلكترونية..."
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">تصنيف المشروع</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(ProjectType).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setFormData({...formData, type})}
                className={`py-4 px-2 rounded-2xl border-2 text-sm font-bold transition-all transform active:scale-95 ${
                  formData.type === type 
                    ? 'border-primary bg-primary/5 text-primary shadow-md' 
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white'
                }`}
              >
                {type === ProjectType.DIGITAL ? 'رقمي' : type === ProjectType.PHYSICAL ? 'مادي' : type === ProjectType.SERVICE ? 'خدمي' : 'أخرى'}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">وصف المشروع</label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-gray-50 focus:bg-white transition-all"
            placeholder="اشرح لجمهورك ما يميز مشروعك وكيف يمكنهم الاستفادة منه..."
          />
        </div>

        {/* Direct Link */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رابط المشروع المباشر (اختياري)</label>
          <div className="relative group">
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="w-full pl-5 pr-12 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-all text-left"
              placeholder="https://example.com"
              dir="ltr"
            />
            <Link className="absolute right-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" size={22} />
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">يمكن أن يكون رابط موقع، متجر، أو رابط تحميل APK مباشر.</p>
        </div>

        {/* Media Uploads */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">الصورة الإعلانية الرئيسية <span className="text-red-500">*</span></label>
            <div className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center cursor-pointer ${imageContent ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary/50'}`}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileRead(f, 'image');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {imageContent ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md">
                     <img src={imageContent} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <span className="text-xs font-bold text-primary flex items-center gap-1"><UploadIcon size={14} /> تم اختيار الصورة</span>
                </div>
              ) : (
                <div className="text-gray-400">
                  <ImageIcon className="mx-auto mb-3 opacity-50" size={32} />
                  <span className="text-sm font-bold block">رفع صورة جذابة</span>
                  <span className="text-[10px]">JPG, PNG حتى 5MB</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">فيديو تعريفي (اختياري)</label>
            <div className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all min-h-[160px] flex flex-col items-center justify-center cursor-pointer ${videoContent ? 'border-secondary bg-secondary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-secondary/50'}`}>
              <input 
                type="file" 
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileRead(f, 'video');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {videoContent ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center text-secondary">
                    <Video size={24} />
                  </div>
                  <span className="text-xs font-bold text-secondary">تم رفع الفيديو بنجاح</span>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Video className="mx-auto mb-3 opacity-50" size={32} />
                  <span className="text-sm font-bold block">رفع فيديو توضيحي</span>
                  <span className="text-[10px]">MP4 حتى 20MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project File */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">ملفات مرفقة (اختياري)</label>
          <div className={`relative border-2 border-dashed rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer ${fileContent ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
            <input 
              type="file" 
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileRead(f, 'file');
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${fileContent ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                <FileText size={24} />
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${fileContent ? 'text-primary' : 'text-gray-700'}`}>
                  {fileContent ? fileContent.name : 'رفع ملفات المشروع (PDF, ZIP...)'}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {fileContent ? 'تم تجهيز الملف للنشر' : 'يمكن للمهتمين تحميل ملفاتك مباشرة'}
                </p>
              </div>
            </div>
            <button type="button" className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50">
              {fileContent ? 'تغيير' : 'استعراض'}
            </button>
          </div>
        </div>

        {/* Footer Info & Actions */}
        <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 flex gap-4 text-sm text-yellow-800 shadow-sm">
          <AlertTriangle size={24} className="shrink-0 text-yellow-600" />
          <div>
             <p className="font-bold mb-0.5">تنبيه النشر</p>
             <p className="opacity-80">
                لديك {3 - adsUsed} إعلانات مجانية متبقية. 
                {isFree && ' الترقية لباقة المحترفين تمنحك ظهوراً أكبر بمقدار 10 أضعاف.'}
             </p>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => setCurrentView(View.HOME)}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all transform active:scale-95"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-[2] py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={22} /> جاري المعالجة...
              </>
            ) : (
              <>
                <UploadIcon size={22} /> نشر المشروع الآن
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;