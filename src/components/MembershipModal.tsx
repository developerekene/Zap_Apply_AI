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
      '2 Tailored CVs & Resumes / month',
      'Master Profile Experience Vault',
      'Direct Company Career Search (Top roles)',
      'Specialist Recruitment Agency Directory',
      'Standard ATS Vector PDF Downloads'
    ],
    buttonLabel: 'Current Mode'
  },
  {
    id: 'gold',
    name: 'Gold Member',
    price: '£4.99',
    priceNumber: 4.99,
    period: 'per month',
    badge: 'Most Popular',
    description: 'High-octane job hunt suite with unlimited tailored applications and direct company web search.',
    features: [
      'Unlimited 1-Click Tailored CVs & Resumes',
      'Unlimited Custom Cover Letters & STAR Statements',
      'Automated Direct Company Website Role Matching',
      'Specialist Recruiter 1-Click Outreach Email Links',
      'Full ATS Keyword Optimization & Scoring Audit',
      'Application Pipeline Tracker with Status Logs'
    ],
    highlight: true,
    buttonLabel: 'Upgrade to Gold (£4.99/mo)'
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
      'Automated Recruiter Outreach Message Generator',
      'Automated Interview Q&A + STAR Prep for Every Job',
      'Dedicated Job Search Strategy & Insights'
    ],
    buttonLabel: 'Upgrade to Platinum (£9.99/mo)'
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
    if (tier === currentTier) {
      onClose();
      return;
    }
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
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden my-auto">
        {/* Sticky Header Bar with High-Visibility Close Button */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 relative shrink-0 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 pr-8 sm:pr-0 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Zap Membership Scheme</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Choose Your Career Growth Plan
              </h2>
              <p className="text-xs text-slate-300 hidden sm:block">
                Tailor applications faster, search direct company vacancies, and connect with specialist headhunters. Cancel or switch anytime.
              </p>
            </div>

            {/* Header Close Button (Accessible & High Contrast) */}
            <button
              type="button"
              id="btn-close-membership-header"
              onClick={onClose}
              className="flex items-center space-x-1 p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer shrink-0"
              aria-label="Close membership modal"
              title="Close modal"
            >
              <X className="w-5 h-5 text-white" />
              <span className="text-xs font-bold hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body (Optimized for Mobile View) */}
        <div className="overflow-y-auto flex-1 p-3.5 sm:p-6 md:p-8 space-y-5 overscroll-contain">
          {/* Success Alert */}
          {checkoutSuccess && (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold">
                    {checkoutSuccess === 'silver'
                      ? 'Switched to Silver (Free Mode)'
                      : `Welcome to Zap ${checkoutSuccess.toUpperCase()}!`}
                  </p>
                  <p className="text-[11px] sm:text-xs text-emerald-700">
                    {checkoutSuccess === 'silver'
                      ? 'Your account is on the free tier.'
                      : 'Your membership is now active. All premium direct company searches, recruiter email tools, and unlimited tailoring are unlocked.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutSuccess(null)}
                className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Payment Confirmation Drawer / Modal Overlay */}
          {selectedPlan && (
            <div className="p-4 sm:p-6 bg-slate-50 border-2 border-indigo-200 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Confirm Upgrade to {selectedPlan === 'gold' ? 'Gold (£4.99/mo)' : 'Platinum (£9.99/mo)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-700">Billing Summary</p>
                  <div className="flex justify-between text-slate-600 text-[11.5px]">
                    <span>Selected Plan:</span>
                    <span className="font-bold text-slate-900">{selectedPlan.toUpperCase()} Monthly</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11.5px]">
                    <span>Total Due Now:</span>
                    <span className="font-black text-indigo-600 text-sm">
                      {selectedPlan === 'gold' ? '£4.99' : '£9.99'} / month
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10.5px]">
                    <span>Terms:</span>
                    <span>Cancel anytime, zero lock-in</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-700">Instant Unlocks</p>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Unlimited Tailored CVs & Cover Letters
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Direct Company Website Roles & Links
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Specialist Headhunters & Outreach Mail
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors text-center cursor-pointer"
                >
                  Back to Plans
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
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

          {/* Pricing Cards: Responsive Grid (Stack beautifully on Mobile, 3 cols on MD+) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
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
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  } p-4 sm:p-5`}
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

                  <div className="space-y-3.5">
                    {/* Header: Tier Name & Active Indicator */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${
                            isPlatinum ? 'text-purple-700' : isGold ? 'text-amber-700' : 'text-slate-600'
                          }`}
                        >
                          {plan.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Active Plan
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-black text-slate-950">
                          {plan.price}
                        </span>
                        {plan.priceNumber > 0 && (
                          <span className="text-xs text-slate-500 font-semibold ml-1.5">
                            /{plan.period}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 min-h-[32px] sm:min-h-[36px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Included Features:
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start text-xs text-slate-700 leading-snug">
                            <Check
                              className={`w-3.5 h-3.5 mr-2 shrink-0 mt-0.5 ${
                                isPlatinum ? 'text-purple-600 font-bold' : isGold ? 'text-amber-600' : 'text-slate-500'
                              }`}
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleStartCheckout(plan.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          : isPlatinum
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                          : isGold
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isCurrent ? 'Current Plan (Keep)' : plan.buttonLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security & Guarantee Note */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
            <div className="flex items-center space-x-1.5 justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Encrypted 256-bit secure checkout • Instant activation • Cancel anytime</span>
            </div>
            <div>
              <span>Visa • Mastercard • Amex • Apple Pay • PayPal</span>
            </div>
          </div>
        </div>

        {/* Sticky Modal Bottom Close Bar (Super easy to close on Mobile & Desktop) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Current Tier: <strong className="text-slate-800 uppercase">{currentTier}</strong>
          </p>

          <button
            type="button"
            id="btn-close-membership-footer"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ml-auto"
          >
            <X className="w-4 h-4 text-slate-500" />
            <span>Close Window</span>
          </button>
        </div>
      </div>
    </div>
  );
};
