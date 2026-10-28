import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  Crown,
  CreditCard,
  X,
  ArrowRight,
  Award,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MembershipTier, MembershipPlan } from '../types';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: MembershipTier;
  onSelectTier: (tier: MembershipTier) => void;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'silver',
    name: 'Silver Mode',
    price: 'Free',
    priceNumber: 0,
    period: 'forever',
    badge: 'Standard',
    description: 'Essential toolkit for starting your job search and drafting ATS-ready resumes.',
    features: [
      '2 Tailored CVs & Cover Letters / month',
      'Standard ATS Vector PDF Downloads',
      'Master Profile Experience Vault',
      'Basic Job Search (Top 3 matching roles)',
      'Community Email Support'
    ],
    buttonLabel: 'Current Mode'
  },
  {
    id: 'gold',
    name: 'Gold Member',
    price: '£4.99',
    priceNumber: 4.99,
    period: 'per month',
    badge: 'Popular',
    description: 'High-octane job hunt suite with unlimited tailored applications and web role matching.',
    features: [
      'Unlimited 1-Click Tailored CVs & Resumes',
      'Unlimited Custom Cover Letters & STAR Statements',
      'Automated Web Job Search with Live Apply Links',
      'Full ATS Keyword Optimization & Scoring Audit',
      'Application Pipeline Tracker with Status Logs',
      'Salary Benchmarks & Role Insights'
    ],
    highlight: true,
    buttonLabel: 'Upgrade to Gold'
  },
  {
    id: 'platinum',
    name: 'Platinum VIP',
    price: '£9.99',
    priceNumber: 9.99,
    period: 'per month',
    badge: 'Elite Career Pro',
    description: 'The ultimate executive package with priority AI tailoring, recruiter messages, and interview prep.',
    features: [
      'Everything in Gold Included',
      'Priority AI Engine (Ultra-Fast Response Times)',
      'Executive & C-Suite Leadership Tone Tuning',
      'Personalized Recruiter Outreach Message Generator',
      'Automated Interview Q&A + STAR Prep for Every Job',
      'Dedicated Application Strategy Support'
    ],
    buttonLabel: 'Upgrade to Platinum'
  }
];

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier
}) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<MembershipTier | null>(null);

  if (!isOpen) return null;

  const handleStartCheckout = (tier: MembershipTier) => {
    if (tier === currentTier) return;
    if (tier === 'silver') {
      onSelectTier('silver');
      setCheckoutSuccess('silver');
      return;
    }
    setSelectedPlan(tier);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSelectTier(selectedPlan);
      setCheckoutSuccess(selectedPlan);
      setSelectedPlan(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Zap Career Memberships</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Accelerate Your Career with Zap
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Select the plan that fits your job search. Upgrade or downgrade anytime with no contracts.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {checkoutSuccess && (
          <div className="m-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">
                  {checkoutSuccess === 'silver'
                    ? 'Switched to Silver (Free Mode)'
                    : `Welcome to Zap ${checkoutSuccess.toUpperCase()}!`}
                </p>
                <p className="text-xs text-emerald-700">
                  {checkoutSuccess === 'silver'
                    ? 'Your account is now on the free tier.'
                    : 'Your membership is now active. All premium features, unlimited tailoring, and job search portals are unlocked.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutSuccess(null)}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Payment Confirmation Modal Overlay */}
        {selectedPlan && (
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Upgrade to {selectedPlan === 'gold' ? 'Gold (£4.99/mo)' : 'Platinum (£9.99/mo)'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Billing Summary</p>
                <div className="flex justify-between text-slate-600">
                  <span>Plan:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.toUpperCase()} Monthly</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Price:</span>
                  <span className="font-black text-indigo-600 text-sm">
                    {selectedPlan === 'gold' ? '£4.99 / month' : '£9.99 / month'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frequency:</span>
                  <span>Billed monthly, cancel anytime</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">Instant Access Includes</p>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Tailored CVs & Resumes
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Direct Web Job Searches with Apply Links
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> STAR Statement Generator
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Activating Membership...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay {selectedPlan === 'gold' ? '£4.99' : '£9.99'} & Unlock Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = currentTier === plan.id;
              const isGold = plan.id === 'gold';
              const isPlatinum = plan.id === 'platinum';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-white shadow-md'
                      : plan.highlight
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white shadow-lg shadow-amber-500/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  } p-6`}
                >
                  {/* Top Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}

                  {isPlatinum && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      VIP Elite
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          isPlatinum ? 'text-purple-700' : isGold ? 'text-amber-700' : 'text-slate-600'
                        }`}>
                          {plan.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline">
                        <span className="text-3xl sm:text-4xl font-black text-slate-950">
                          {plan.price}
                        </span>
                        {plan.priceNumber > 0 && (
                          <span className="text-xs text-slate-500 font-semibold ml-1.5">
                            /{plan.period}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-2 min-h-[36px]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Included Features:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start text-xs text-slate-700">
                            <Check className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${
                              isPlatinum ? 'text-purple-600 font-bold' : isGold ? 'text-amber-600' : 'text-slate-500'
                            }`} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      onClick={() => handleStartCheckout(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                          : isPlatinum
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                          : isGold
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.buttonLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Encrypted 256-bit secure checkout • Instant activation • Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Accepted: Visa, Mastercard, Amex, PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
