import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles, Award, Lock, Star, CreditCard, ArrowRight } from 'lucide-react';
import emailjs from 'emailjs-com';

const SERVICE_ID = "service_o1jbklr";
const TEMPLATE_ID = "template_p8h58ur";
const PUBLIC_KEY = "hcj3DsJ8MfNfUrE8J";

export interface PlanOption {
  id: 'weekly' | 'monthly' | 'quarterly';
  name: string;
  priceFormatted: string;
  priceAmountKobo: number; // in Paystack minor unit (e.g., 799 * 100 for £7.99 or 1000 * 100)
  currency: string;
  billingText: string;
  badge?: string;
  description: string;
  savings?: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'weekly',
    name: 'Weekly Pass',
    priceFormatted: '£7.99',
    priceAmountKobo: 799 * 100,
    currency: 'GBP',
    billingText: 'Billed £7.99 weekly',
    description: 'Perfect for job seekers on an intense 1–2 week application push.',
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    priceFormatted: '£19.99',
    priceAmountKobo: 1999 * 100,
    currency: 'GBP',
    billingText: 'Billed £19.99 monthly',
    badge: 'MOST POPULAR',
    description: 'Standard plan for active job hunters applying weekly across roles.',
    savings: 'Save 38% vs weekly'
  },
  {
    id: 'quarterly',
    name: 'Quarterly Pass',
    priceFormatted: '£39.99',
    priceAmountKobo: 3999 * 100,
    currency: 'GBP',
    billingText: 'Billed £39.99 every 3 months',
    badge: 'BEST VALUE',
    description: 'Discounted option for full job search support (average search takes 2–3 months).',
    savings: 'Save 50% vs monthly'
  }
];

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (planId: string, email: string) => void;
  defaultEmail?: string;
  featureTitle?: string;
  featureDescription?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  defaultEmail = '',
  featureTitle = 'Unlock Zap.AI Pro Features',
  featureDescription = 'Upgrade to Zap.AI Pro to unlock unlimited ATS keyword optimizations, STAR personal statements, unlimited PDF exports, and automated calendar sync.'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(PLAN_OPTIONS[1]); // default to Monthly
  const [email, setEmail] = useState(defaultEmail || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useTestKey, setUseTestKey] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const generateReferenceNumber = (): string => {
    const prefix = "DT";
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handlePaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const userEmail = email.trim();
    if (!userEmail || !userEmail.includes('@')) {
      setNotification({ type: 'error', message: 'Please enter a valid email address!' });
      return;
    }

    const paystackKey = useTestKey
      ? "pk_test_db0145199289f83c428d57cf70755142bb0b8b28"
      : "pk_live_d2b967eddda456841f504b85549767fc33cc9fd4";

    const PayStackPop = (window as any).PayStackPop;
    if (!PayStackPop) {
      setNotification({
        type: 'error',
        message: 'Paystack library not loaded. Please refresh or check your internet connection.'
      });
      return;
    }

    setIsProcessing(true);
    const refNum = generateReferenceNumber();

    try {
      const handler = new PayStackPop();
      handler.newTransaction({
        key: paystackKey,
        email: userEmail,
        amount: selectedPlan.priceAmountKobo,
        currency: selectedPlan.currency,
        ref: refNum,
        metadata: {
          custom_fields: [
            { display_name: "First Name", variable_name: "first_name", value: firstName || "Subscriber" },
            { display_name: "Last Name", variable_name: "last_name", value: lastName || "User" },
            { display_name: "Plan Name", variable_name: "plan_name", value: selectedPlan.name }
          ]
        },
        onSuccess: (res: any) => {
          setIsProcessing(false);

          // Prepare email notification parameters
          const templateParams = {
            name: firstName ? `${firstName} ${lastName}` : 'Valued Subscriber',
            title: `Welcome to Zap.AI Pro! 🎉\nYour subscription [${selectedPlan.name} - ${selectedPlan.priceFormatted}] is now ACTIVE.`,
            email: userEmail,
            plan_name: selectedPlan.name,
            amount_paid: selectedPlan.priceFormatted,
            reference_number: res.reference || refNum,
            message_details: `
              Thank you for upgrading to Zap.AI Pro!
              
              Plan Details:
              • Plan: ${selectedPlan.name} (${selectedPlan.priceFormatted})
              • Reference: ${res.reference || refNum}
              • Account Email: ${userEmail}
              
              Unlocked Pro Features:
              ✓ Unlimited STAR Personal Statement Generation
              ✓ Full ATS Keyword Match Analysis & Actionable Recommendations
              ✓ Unlimited High-Quality Resume & Cover Letter PDF Downloads
              ✓ Unlimited Application Tracking CRM Cards
              ✓ Automated Google Calendar Interview Scheduling Sync
            `
          };

          // Send EmailJS notification
          emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY).then(
            () => {
              console.log("Welcome email sent successfully via EmailJS!");
            },
            (error) => {
              console.warn("EmailJS notification issue:", error);
            }
          );

          setNotification({
            type: 'success',
            message: `🎉 Payment Successful! Welcome ${firstName || 'Candidate'} to Zap.AI Pro!`
          });

          onPaymentSuccess(selectedPlan.id, userEmail);
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onCancel: () => {
          setIsProcessing(false);
          setNotification({
            type: 'error',
            message: 'Payment was cancelled. You can retry at any time.'
          });
        },
        onError: (err: any) => {
          setIsProcessing(false);
          setNotification({
            type: 'error',
            message: `Payment error: ${err?.message || 'Transaction could not be completed.'}`
          });
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      setNotification({
        type: 'error',
        message: `Checkout initialization error: ${err?.message || 'Please check Paystack configuration.'}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>ZAP.AI PRO UNLOCK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">{featureTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            {featureDescription}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">

          {notification && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{notification.message}</span>
            </div>
          )}

          {/* Pricing Tier Options */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              1. Select Your Subscription Plan
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLAN_OPTIONS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{plan.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="text-2xl font-black text-slate-900">{plan.priceFormatted}</span>
                        <p className="text-[10px] font-semibold text-slate-500">{plan.billingText}</p>
                      </div>

                      {plan.savings && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {plan.savings}
                        </span>
                      )}

                      <p className="text-[11px] text-slate-600 mt-2 leading-tight">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature Comparison Checklist */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              Everything Included in Zap.AI Pro:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited</strong> ATS Keyword Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>STAR</strong> Personal Statement Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited</strong> Resume & Letter PDF Exports</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Full Application Tracker</strong> CRM (Unlimited)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Google Calendar</strong> Automated Interview Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Strict 1 MB</strong> Resume PDF Optimizer</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePaystackCheckout} className="space-y-4 pt-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Enter Checkout Contact Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Morgan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Required for Pro Key & Confirmation)</label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Paystack Test/Live Toggle for easy testing */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Paystack Key Mode</span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={useTestKey}
                  onChange={(e) => setUseTestKey(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{useTestKey ? 'Test Mode (pk_test_...)' : 'Live Mode (pk_live_...)'}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>{isProcessing ? 'Connecting to Paystack Gateway...' : `Pay ${selectedPlan.priceFormatted} with Paystack`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>Secured by Paystack</span>
              <span>•</span>
              <span>Instant Unlocking</span>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
