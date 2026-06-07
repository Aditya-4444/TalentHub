import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutModal({ isOpen, onClose, onUpgradeSuccess, planType }) {
  const { upgradeToPlan, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [error, setError] = useState('');

  if (!isOpen || !planType) return null;

  const price = userData?.role === 'provider'
    ? (planType === 'gold' ? 59 : 29)
    : (planType === 'gold' ? 39 : 19);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cardName, cardNumber, cardExpiry, cardCvc } = formData;

    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setError('Please fill in all card details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate transaction processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Update plan in Firestore
      await upgradeToPlan(planType);
      
      setLoading(false);
      onUpgradeSuccess(`Welcome to ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan! Upgrade processed successfully.`);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Payment simulation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white border border-border-divider rounded-2xl shadow-2xl animate-scale-up">
        {/* Banner */}
        <div className="bg-primary-avocado text-white px-6 py-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close billing modal"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={22} className="text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
              TalentHub {planType === 'gold' ? 'Gold' : 'Silver'}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Upgrade Your Account</h2>
          <p className="text-white/85 text-sm mt-1">
            {userData?.role === 'provider' 
              ? 'Maximize your recruiting outreach and attract premium talent.' 
              : 'Stand out from other job seekers and capture recruiters\' attention.'}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Features */}
          <div className="bg-panel-bg border border-border-divider/50 rounded-xl p-4 space-y-2.5">
            {userData?.role === 'provider' ? (
              planType === 'gold' ? (
                <>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Unlimited Postings:</strong> Create as many job listings as your team requires.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Gold Partner Badge:</strong> Your jobs get a premium gold badge and gold-glowing borders.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Gold Avatar Border:</strong> Your company profile image glows with a gold border across the app.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">5 Job Postings:</strong> Create up to 5 active job listings (up from 2 on Free).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Silver Partner Badge:</strong> Your jobs get a distinct silver badge on job listings.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Silver Avatar Border:</strong> Your company profile image displays a sleek silver border.
                    </div>
                  </div>
                </>
              )
            ) : (
              planType === 'gold' ? (
                <>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Gold Avatar Border:</strong> Your profile photo glows gold in all recruiter screens.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Gold Member Badge:</strong> Recruiter views display a premium "Gold Member" tag by your applications.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Featured Placement:</strong> Stand out in recruiter application feeds with priority sorting.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Silver Avatar Border:</strong> Your profile photo displays a clean silver border.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Silver Member Badge:</strong> Recruiter views show a "Silver Member" tag by your applications.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-muted-text">
                    <ShieldCheck size={16} className="text-primary-avocado shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-body-text">Priority Search:</strong> Get highlighted search placement above free candidates.
                    </div>
                  </div>
                </>
              )
            )}
            <div className="text-center pt-2 border-t border-border-divider/30 text-body-text font-semibold">
              ${price} <span className="text-xs text-muted-text font-normal">/ month (Simulated billing)</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-body-text flex items-center gap-2">
              <CreditCard size={18} className="text-primary-avocado" />
              Credit Card Details
            </h3>

            {error && (
              <p className="text-xs font-medium text-danger-reject bg-red-50 border border-red-200 p-2.5 rounded-lg">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="cardName" className="block text-xs font-medium text-muted-text mb-1">
                Cardholder Name
              </label>
              <input
                id="cardName"
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="Jane Doe"
                disabled={loading}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-xs font-medium text-muted-text mb-1">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="4111 2222 3333 4444"
                disabled={loading}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-xs font-medium text-muted-text mb-1">
                  Expiration Date
                </label>
                <input
                  id="cardExpiry"
                  type="text"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  disabled={loading}
                  className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
                />
              </div>
              <div>
                <label htmlFor="cardCvc" className="block text-xs font-medium text-muted-text mb-1">
                  CVC / CVV
                </label>
                <input
                  id="cardCvc"
                  type="password"
                  name="cardCvc"
                  value={formData.cardCvc}
                  onChange={handleChange}
                  placeholder="•••"
                  maxLength={4}
                  disabled={loading}
                  className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-sm font-semibold border border-border-divider hover:bg-page-bg text-body-text rounded-xl py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm font-semibold text-white bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 rounded-xl py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay & Upgrade'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

