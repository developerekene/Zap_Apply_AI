import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles, Star, ArrowRight, CheckCircle2, Globe, CreditCard } from 'lucide-react';
import PaystackPop from '@paystack/inline-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import emailjs from 'emailjs-com';

const SERVICE_ID = "service_o1jbklr";
const TEMPLATE_ID = "template_p8h58ur";
const PUBLIC_KEY = "hcj3DsJ8MfNfUrE8J";
const PAYSTACK_LIVE_KEY = "pk_live_d2b967eddda456841f504b85549767fc33cc9fd4";
const PAYPAL_CLIENT_ID = "test"; // Sandbox / demo client id or replace with live client id

export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type PaymentGateway = 'paystack' | 'paypal';

export interface PlanPricing {
  id: 'weekly' | 'monthly' | 'quarterly';
  name: string;
  badge?: string;
  description: string;
  savings?: string;
  prices: Record<SupportedCurrency, {
    formatted: string;
    amountNumeric: number;
    amountMinor: number; // in lowest currency unit (Kobo or Cents)
    billingText: string;
  }>;
}

const PRICING_TIERS: PlanPricing[] = [
  {
    id: 'weekly',
    name: 'Weekly Pass',
    description: 'Perfect for job seekers on an intense 1–2 week application push.',
    prices: {
      NGN: { formatted: '₦5,000', amountNumeric: 5000, amountMinor: 5000 * 100, billingText: 'Billed ₦5,000 weekly' },
      USD: { formatted: '$7.99', amountNumeric: 7.99, amountMinor: 799, billingText: 'Billed $7.99 weekly' },
      GBP: { formatted: '£6.99', amountNumeric: 6.99, amountMinor: 699, billingText: 'Billed £6.99 weekly' },
      EUR: { formatted: '€7.99', amountNumeric: 7.99, amountMinor: 799, billingText: 'Billed €7.99 weekly' },
    }
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    badge: 'MOST POPULAR',
    description: 'Standard plan for active job hunters applying weekly across roles.',
    savings: 'Save up to 35% vs weekly',
    prices: {
      NGN: { formatted: '₦15,000', amountNumeric: 15000, amountMinor: 15000 * 100, billingText: 'Billed ₦15,000 monthly' },
      USD: { formatted: '$19.99', amountNumeric: 19.99, amountMinor: 1999, billingText: 'Billed $19.99 monthly' },
      GBP: { formatted: '£16.99', amountNumeric: 16.99, amountMinor: 1699, billingText: 'Billed £16.99 monthly' },
      EUR: { formatted: '€18.99', amountNumeric: 18.99, amountMinor: 1899, billingText: 'Billed €18.99 monthly' },
    }
  },
  {
    id: 'quarterly',
    name: 'Quarterly Pass',
    badge: 'BEST VALUE',
    description: 'Discounted option for full job search support (average search takes 2–3 months).',
    savings: 'Save up to 50% vs monthly',
    prices: {
      NGN: { formatted: '₦35,000', amountNumeric: 35000, amountMinor: 35000 * 100, billingText: 'Billed ₦35,000 every 3 months' },
      USD: { formatted: '$39.99', amountNumeric: 39.99, amountMinor: 3999, billingText: 'Billed $39.99 every 3 months' },
      GBP: { formatted: '£34.99', amountNumeric: 34.99, amountMinor: 3499, billingText: 'Billed £34.99 every 3 months' },
      EUR: { formatted: '€38.99', amountNumeric: 38.99, amountMinor: 3899, billingText: 'Billed €38.99 every 3 months' },
    }
  }
];

const CURRENCY_CONFIG: Record<SupportedCurrency, { label: string; flag: string; symbol: string; supportedGateways: PaymentGateway[] }> = {
  NGN: { label: 'NGN (₦)', flag: '🇳🇬', symbol: '₦', supportedGateways: ['paystack'] },
  USD: { label: 'USD ($)', flag: '🇺🇸', symbol: '$', supportedGateways: ['paystack', 'paypal'] },
  GBP: { label: 'GBP (£)', flag: '🇬🇧', symbol: '£', supportedGateways: ['paystack', 'paypal'] },
  EUR: { label: 'EUR (€)', flag: '🇪🇺', symbol: '€', supportedGateways: ['paypal', 'paystack'] }
};

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionRef: string, plan: 'weekly' | 'monthly' | 'quarterly', email: string) => void;
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
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('NGN');
  const [selectedPlanId, setSelectedPlanId] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('paystack');
  const [email, setEmail] = useState(defaultEmail || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlan = PRICING_TIERS.find(p => p.id === selectedPlanId) || PRICING_TIERS[1];
  const currentPrice = currentPlan.prices[selectedCurrency];

  const generateReferenceNumber = (prefix = "ZAP"): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Switch currency and auto-adjust gateway compatibility
  const handleCurrencyChange = (curr: SupportedCurrency) => {
    setSelectedCurrency(curr);
    const validGateways = CURRENCY_CONFIG[curr].supportedGateways;
    if (!validGateways.includes(selectedGateway)) {
      setSelectedGateway(validGateways[0]);
    }
  };

  const dispatchEmailConfirmation = (transRef: string, gatewayName: string) => {
    const userEmail = email.trim();
    const candidateFullName = firstName ? `${firstName} ${lastName}`.trim() : 'Valued Candidate';
    const templateParams = {
      name: candidateFullName,
      title: `Thank You for Upgrading to Zap.AI Pro! 🎉

Your subscription [${currentPlan.name} - ${currentPrice.formatted} via ${gatewayName}] has been successfully activated.

Transaction Details:
• Plan: ${currentPlan.name} (${currentPrice.formatted})
• Payment Gateway: ${gatewayName}
• Transaction Reference: ${transRef}
• Account Email: ${userEmail}

Unlocked Pro Capabilities:
• 🌟 STAR Personal Statement Engine (Situation, Task, Action, Result)
• 🎯 Exact ATS Missing Keywords & High-Impact Recommendations
• 📄 Unlimited ATS Resume & Cover Letter PDF Downloads
• 📁 Unlimited Application Tracker CRM Cards
• 📅 Automated Google Calendar Interview & Deadline Sync

Get ready to accelerate your career search with algorithm-aligned applications!

At Zap.AI, we are dedicated to helping you land your dream job faster.`,
      email: userEmail
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY).then(
      () => {
        console.log("Confirmation email dispatched successfully via EmailJS!");
      },
      (error) => {
        console.warn("EmailJS notification error:", error);
      }
    );
  };

  // Paystack Multi-Currency Handler
  const handlePaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const userEmail = email.trim();
    if (!userEmail || !userEmail.includes('@')) {
      setNotification({ type: 'error', message: 'Please enter a valid email address!' });
      return;
    }

    setIsProcessing(true);
    const refNum = generateReferenceNumber("PS");

    try {
      const paystack = new PaystackPop();
      
      paystack.newTransaction({
        key: PAYSTACK_LIVE_KEY,
        email: userEmail,
        amount: currentPrice.amountMinor,
        currency: selectedCurrency,
        ref: refNum,
        metadata: {
          custom_fields: [
            { display_name: "First Name", variable_name: "first_name", value: firstName || "Subscriber" },
            { display_name: "Last Name", variable_name: "last_name", value: lastName || "User" },
            { display_name: "Plan Name", variable_name: "plan_name", value: currentPlan.name },
            { display_name: "Currency", variable_name: "currency", value: selectedCurrency }
          ]
        },
        onSuccess: (res: any) => {
          setIsProcessing(false);
          const transRef = res.reference || refNum;
          const candidateFullName = firstName ? `${firstName} ${lastName}`.trim() : 'Candidate';

          dispatchEmailConfirmation(transRef, 'Paystack Multi-Currency');

          setNotification({
            type: 'success',
            message: `🎉 Payment Successful! Welcome ${candidateFullName} to Zap.AI Pro!`
          });

          onPaymentSuccess(transRef, currentPlan.id, userEmail);
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onCancel: () => {
          setIsProcessing(false);
          setNotification({
            type: 'error',
            message: 'Payment was cancelled. You can retry whenever you are ready.'
          });
        },
        onError: (err: any) => {
          setIsProcessing(false);
          console.error("Paystack transaction error:", err);
          setNotification({
            type: 'error',
            message: `Payment error: ${err?.message || 'Transaction could not be completed.'}`
          });
        }
      });
    } catch (err: any) {
      setIsProcessing(false);
      console.error("Paystack init exception:", err);
      setNotification({
        type: 'error',
        message: `Checkout initialization error: ${err?.message || 'Please check your connection and try again.'}`
      });
    }
  };

  // PayPal Approval Handler
  const handlePayPalApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      const details = actions.order ? await actions.order.capture() : null;
      const transRef = data.orderID || details?.id || generateReferenceNumber("PP");
      const userEmail = email.trim() || details?.payer?.email_address || 'subscriber@example.com';
      const candidateFullName = firstName || details?.payer?.name?.given_name || 'Candidate';

      dispatchEmailConfirmation(transRef, 'PayPal Global');

      setIsProcessing(false);
      setNotification({
        type: 'success',
        message: `🎉 PayPal Payment Successful! Welcome ${candidateFullName} to Zap.AI Pro!`
      });

      onPaymentSuccess(transRef, currentPlan.id, userEmail);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      console.error("PayPal capture error:", err);
      setNotification({
        type: 'error',
        message: `PayPal capture error: ${err?.message || 'Transaction could not be completed.'}`
      });
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 cursor-default"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/20 transition-all flex items-center space-x-1.5 text-xs font-bold shadow-sm cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>ZAP.AI PRO UNIFIED CHECKOUT</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{featureTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
                {featureDescription}
              </p>
            </div>

            {/* Currency Selector Pill Group */}
            <div className="bg-white/10 p-1 rounded-2xl border border-white/20 flex items-center space-x-1 shrink-0">
              {(Object.keys(CURRENCY_CONFIG) as SupportedCurrency[]).map((curr) => {
                const isCurrActive = selectedCurrency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => handleCurrencyChange(curr)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                      isCurrActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{CURRENCY_CONFIG[curr].flag}</span>
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Pricing Tier Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                1. Select Your Subscription Plan
              </label>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Pricing in {CURRENCY_CONFIG[selectedCurrency].label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRICING_TIERS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const priceObj = plan.prices[selectedCurrency];

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
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
                        <span className="text-2xl font-black text-slate-900">{priceObj.formatted}</span>
                        <p className="text-[10px] font-semibold text-slate-500">{priceObj.billingText}</p>
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

          {/* Payment Gateway Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              2. Choose Payment Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paystack Multi-Currency Option */}
              <div
                onClick={() => setSelectedGateway('paystack')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start space-x-3 ${
                  selectedGateway === 'paystack'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${selectedGateway === 'paystack' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Paystack Multi-Currency</span>
                    {selectedGateway === 'paystack' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cards (Visa, Mastercard, Verve, Amex), Bank Transfer, Apple Pay & USSD.
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                    African & International Cards
                  </span>
                </div>
              </div>

              {/* PayPal Global Option */}
              <div
                onClick={() => setSelectedGateway('paypal')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start space-x-3 ${
                  selectedGateway === 'paypal'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${selectedGateway === 'paypal' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">PayPal Global</span>
                    {selectedGateway === 'paypal' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PayPal Wallet, Global Debit/Credit Cards & Pay in 4 installment support.
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    Worldwide USD, EUR & GBP
                  </span>
                </div>
              </div>
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
                <span><strong>STAR</strong> Personal Statement Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Exact</strong> Missing ATS Keywords Unlocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited</strong> Resume & Cover Letter PDF Downloads</span>
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
                <span><strong>Strict 1 MB</strong> High-Speed PDF Optimizer</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Checkout Action */}
          <div className="space-y-4 pt-1">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              3. Subscriber Details & Checkout
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (For Pro Account & Receipt)</label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Gateway Render Mode */}
            {selectedGateway === 'paystack' ? (
              <form onSubmit={handlePaystackCheckout} className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>{isProcessing ? 'Connecting to Paystack...' : `Pay ${currentPrice.formatted} with Paystack`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="pt-2">
                {selectedCurrency === 'NGN' ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                    <p className="font-bold">PayPal currency notice:</p>
                    <p className="mt-1">PayPal operates in USD, GBP, and EUR. Please select USD, GBP, or EUR from the top currency bar to complete checkout via PayPal.</p>
                  </div>
                ) : (
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: selectedCurrency }}>
                    <div className="min-h-[50px] relative z-10">
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 48 }}
                        createOrder={(data, actions) => {
                          const userEmail = email.trim();
                          if (!userEmail || !userEmail.includes('@')) {
                            setNotification({ type: 'error', message: 'Please enter a valid email address before proceeding with PayPal!' });
                            return Promise.reject(new Error('Valid email required'));
                          }
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                description: `Zap.AI Pro - ${currentPlan.name}`,
                                amount: {
                                  currency_code: selectedCurrency,
                                  value: currentPrice.amountNumeric.toString()
                                }
                              }
                            ]
                          });
                        }}
                        onApprove={handlePayPalApprove}
                        onCancel={() => {
                          setNotification({
                            type: 'error',
                            message: 'PayPal payment was cancelled.'
                          });
                        }}
                        onError={(err) => {
                          console.error("PayPal Error:", err);
                          setNotification({
                            type: 'error',
                            message: 'PayPal encounter an issue. You can also try Paystack Multi-Currency.'
                          });
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-400 pt-2">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>Unified Global Checkout</span>
              <span>•</span>
              <span>Instant Activation</span>
            </div>

            {/* Bottom Dismiss / Close Button */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Maybe Later • Continue with Free Plan
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
