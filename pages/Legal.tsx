import React from 'react';
import { View } from '../types';
import { ArrowRight, Shield, FileText } from 'lucide-react';

interface LegalProps {
  type: View.TERMS | View.PRIVACY;
  onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ type, onBack }) => {
  const isTerms = type === View.TERMS;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            {isTerms ? <FileText size={24} /> : <Shield size={24} />}
            <h1 className="text-xl font-bold">{isTerms ? 'سياسة الاستخدام' : 'سياسة الخصوصية'}</h1>
          </div>
          <button 
            onClick={onBack}
            className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium"
          >
            <ArrowRight size={16} />
            العودة
          </button>
        </div>
        
        <div className="p-8 space-y-6 text-gray-700 leading-relaxed">
          {isTerms ? (
            <>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">1. مقدمة</h3>
                <p>مرحباً بك في تطبيق supply. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بشروط الاستخدام التالية. يرجى قراءتها بعناية.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">2. السلوك المسموح به</h3>
                <p>يجب استخدام التطبيق لأغراض قانونية ومشروعة فقط. يمنع نشر أي محتوى مسيء، احتيالي، أو ينتهك حقوق الآخرين.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">3. الإعلانات والمشاريع</h3>
                <p>يتحمل المستخدم المسؤولية الكاملة عن صحة المعلومات الواردة في إعلانات مشاريعه. تحتفظ إدارة التطبيق بحق حذف أي إعلان مخالف.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">4. الاشتراكات والنقاط</h3>
                <p>النقاط المكتسبة داخل التطبيق ليس لها قيمة نقدية خارج التطبيق ولا يمكن استبدالها إلا بالخدمات المتاحة داخل التطبيق.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">1. جمع المعلومات</h3>
                <p>نحن نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، مثل اسم المستخدم والبريد الإلكتروني، لضمان تجربة مستخدم آمنة في تطبيق supply.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">2. استخدام المعلومات</h3>
                <p>نستخدم المعلومات لتحسين خدماتنا، وتخصيص تجربتك، والتواصل معك بشأن التحديثات أو العروض الخاصة.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">3. مشاركة البيانات</h3>
                <p>نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك بيانات مجهولة المصدر لأغراض التحليل والإحصاء فقط.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-primary mb-2">4. أمان البيانات</h3>
                <p>نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفشاء.</p>
              </section>
            </>
          )}
          
          <div className="pt-6 border-t mt-8 text-center text-sm text-gray-500">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;