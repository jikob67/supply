
import React, { useState, useRef, useEffect } from 'react';
import { WALLETS } from '../constants';
import { CryptoWallet } from '../types';
import { Copy, Check, ShieldCheck, CreditCard, Crown, Star, Rocket, ChevronDown, Loader2, CheckCircle, AlertTriangle, ArrowDown } from 'lucide-react';

interface SubscriptionProps {
  onPaymentSuccess?: (plan: 'PRO' | 'ENTERPRISE') => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ onPaymentSuccess }) => {
  // Steps: 1=Plan, 2=Wallet, 3=UserWallet+Hash, 4=Processing, 5=Success
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ENTERPRISE' | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  
  // Form Data
  const [userWalletAddress, setUserWalletAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Auto-scroll when step changes
  useEffect(() => {
    if (currentStep === 2 && step2Ref.current) {
      step2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (currentStep === 3 && step3Ref.current) {
      step3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectPlan = (plan: 'PRO' | 'ENTERPRISE') => {
    setSelectedPlan(plan);
    setCurrentStep(2);
  };

  const selectWallet = (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    setCurrentStep(3);
  };

  const validateInputs = (): boolean => {
    if (!userWalletAddress.trim()) {
      setErrorMsg('الخطوة 3 مطلوبة: يرجى لصق عنوان محفظتك.');
      return false;
    }
    if (!transactionHash.trim()) {
      setErrorMsg('الخطوة 4 مطلوبة: يرجى لصق رمز التحقق (Hash).');
      return false;
    }
    // Basic format checks
    if (userWalletAddress.length < 10) {
      setErrorMsg('عنوان المحفظة يبدو قصيراً جداً وغير صحيح.');
      return false;
    }
    if (transactionHash.length < 10) {
      setErrorMsg('رمز التحقق يبدو غير صحيح.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateInputs()) return;

    setIsVerifying(true);
    // Simulate API Check
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStep(5); // Success Step
      setTimeout(() => {
        if (onPaymentSuccess && selectedPlan) {
          onPaymentSuccess(selectedPlan);
        }
      }, 2000);
    }, 2500);
  };

  if (currentStep === 5) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-10 shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">تم الاشتراك بنجاح!</h2>
          <p className="text-green-700 text-lg mb-6">
            شكراً لك. تم استلام طلبك والتحقق من عملية الدفع.
            <br />
            يتم الآن ترقية حسابك إلى باقة <strong>{selectedPlan === 'PRO' ? 'المحترفين' : 'الشركات'}</strong>.
          </p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-green-600" size={24} />
          </div>
          <p className="text-sm text-green-600/70 mt-4">جاري توجيهك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">إتمام الاشتراك والترقية</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          يرجى اتباع الخطوات التالية بدقة لضمان تفعيل اشتراكك فوراً.
        </p>
      </div>

      {/* --- STEP 1: Choose Plan --- */}
      <section className={`transition-all duration-500 ${currentStep > 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep > 1 ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
            {currentStep > 1 ? <Check size={24} /> : '1'}
          </div>
          <h3 className="text-xl font-bold text-gray-800">إختيار الباقة الإشتراكية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Pro Plan */}
           <div 
             onClick={() => selectPlan('PRO')}
             className={`cursor-pointer rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${selectedPlan === 'PRO' ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary ring-offset-2' : 'border-gray-200 bg-white hover:border-primary/50'}`}
           >
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h4 className="text-xl font-bold text-primary">باقة المحترفين</h4>
                 <p className="text-gray-500">للمشاريع الناشئة</p>
               </div>
               <div className="text-2xl font-bold text-primary">50$</div>
             </div>
             <ul className="space-y-2 text-sm text-gray-600 mb-4">
               <li className="flex items-center gap-2"><Check size={16} className="text-yellow-500" /> 20 إعلان شهرياً</li>
               <li className="flex items-center gap-2"><Check size={16} className="text-yellow-500" /> توثيق الحساب</li>
             </ul>
             <div className="w-full py-2 rounded-lg bg-gray-100 text-center font-bold text-gray-600 group-hover:bg-primary group-hover:text-white">
               {selectedPlan === 'PRO' ? 'تم الاختيار' : 'اختيار'}
             </div>
           </div>

           {/* Enterprise Plan */}
           <div 
             onClick={() => selectPlan('ENTERPRISE')}
             className={`cursor-pointer rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${selectedPlan === 'ENTERPRISE' ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary ring-offset-2' : 'border-gray-200 bg-white hover:border-primary/50'}`}
           >
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h4 className="text-xl font-bold text-primary flex items-center gap-2">
                   باقة الشركات <Crown size={18} className="text-yellow-500" />
                 </h4>
                 <p className="text-gray-500">للوصول الأقصى</p>
               </div>
               <div className="text-2xl font-bold text-primary">150$</div>
             </div>
             <ul className="space-y-2 text-sm text-gray-600 mb-4">
               <li className="flex items-center gap-2"><Check size={16} className="text-yellow-500" /> إعلانات غير محدودة</li>
               <li className="flex items-center gap-2"><Check size={16} className="text-yellow-500" /> مدير حساب خاص</li>
             </ul>
             <div className="w-full py-2 rounded-lg bg-gray-100 text-center font-bold text-gray-600 group-hover:bg-primary group-hover:text-white">
               {selectedPlan === 'ENTERPRISE' ? 'تم الاختيار' : 'اختيار'}
             </div>
           </div>
        </div>
      </section>

      {/* --- STEP 2: Choose Wallet --- */}
      {currentStep >= 2 && (
        <section ref={step2Ref} className={`transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in ${currentStep > 3 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentStep > 2 ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
              {currentStep > 2 ? <Check size={24} /> : '2'}
            </div>
            <h3 className="text-xl font-bold text-gray-800">إختيار المحفظة الرقمية (مطلوب)</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 mb-4 text-sm">اختر العملة التي تريد الدفع من خلالها:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.currency}
                  onClick={() => selectWallet(wallet)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedWallet?.currency === wallet.currency
                      ? 'border-secondary bg-secondary/5 text-secondary scale-105 shadow-md'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-gray-700 mb-2 border">
                    {wallet.icon.toUpperCase()}
                  </div>
                  <span className="font-bold">{wallet.currency}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- STEP 3 & 4: Verification Form --- */}
      {currentStep >= 3 && selectedWallet && (
        <section ref={step3Ref} className="animate-in slide-in-from-bottom-10 fade-in">
          {/* Payment Info Box */}
          <div className="bg-gradient-to-br from-gray-900 to-primary text-white rounded-2xl p-6 mb-8 shadow-lg">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard size={20} /> تفاصيل التحويل
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="text-gray-300">المبلغ المطلوب:</span>
                <span className="font-bold text-xl text-yellow-400">{selectedPlan === 'PRO' ? '50$' : '150$'}</span>
              </div>
              <div>
                <span className="text-gray-300 text-sm block mb-2">عنوان محفظة {selectedWallet.currency} الخاص بنا:</span>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/10">
                  <code className="flex-1 font-mono text-sm break-all">{selectedWallet.address}</code>
                  <button 
                    onClick={() => handleCopy(selectedWallet.address)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-yellow-300/80 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> قم بنسخ العنوان أعلاه وقم بالتحويل من تطبيق محفظتك
                </p>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            
            {/* Step 3 Input */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                <label className="text-lg font-bold text-gray-800">عنوان محفظتك (مطلوب)</label>
              </div>
              <input 
                type="text" 
                value={userWalletAddress}
                onChange={(e) => setUserWalletAddress(e.target.value)}
                placeholder={`عنوان محفظة ${selectedWallet.currency} الخاصة بك`}
                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2 mr-11">ألصق عنوان المحفظة التي قمت بإرسال المبلغ منها.</p>
            </div>

            {/* Step 4 Input */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                <label className="text-lg font-bold text-gray-800">رمز التحقق من المدفوعات (مطلوب)</label>
              </div>
              <input 
                type="text" 
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="رقم المعاملة (Transaction Hash / ID)"
                className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2 mr-11">ألصق معرف المعاملة (TXID) لإثبات التحويل.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100">
                <AlertTriangle size={18} />
                {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-secondary transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" /> جاري التحقق...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} /> تأكيد الاشتراك
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default Subscription;
