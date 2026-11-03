import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { UserRole } from '../types/index.ts';
import { Sprout, Eye, EyeOff, Lock, User, Phone, Mail, MapPin, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, quickDemoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState('ramesh.farmer@agriconnect.in');
  const [password, setPassword] = useState('farmer123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regState, setRegState] = useState('Haryana');
  const [regDistrict, setRegDistrict] = useState('Karnal');
  const [regVillage, setRegVillage] = useState('');
  const [regRole, setRegRole] = useState<'farmer' | 'consumer'>('farmer');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
        state: regState,
        district: regDistrict,
        village: regVillage,
        address: regAddress,
        role: regRole
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      {/* Top Language & Branding bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors"
        >
          {language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800 text-white shadow-md mb-3">
          <Sprout className="w-8 h-8 text-emerald-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {language === 'hi' ? 'स्मार्ट कृषि कनेक्ट' : 'Smart Agriculture Connect'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
          {language === 'hi'
            ? 'पारदर्शी सरकारी खरीद प्रणाली व किसानों का सीधा जैविक बाज़ार'
            : 'Transparent Mandi Procurement & Direct Farm-to-Home Marketplace'}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-200">
          
          {/* Quick Demo Role Switcher (Crucial for SIH evaluators) */}
          <div className="mb-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                SIH Demonstration 1-Click Logins:
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mb-3 leading-snug">
              Instant login with seeded accounts for all 4 distinct system roles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('farmer')}
                className="px-3 py-2 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 rounded-lg border border-emerald-300 transition shadow-2xs text-left"
              >
                🌾 1. Kisan / Farmer
                <span className="block text-[10px] font-normal text-emerald-700">Ramesh (Karnal Mandi)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('consumer')}
                className="px-3 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 rounded-lg border border-stone-300 transition shadow-2xs text-left"
              >
                🛒 2. Consumer
                <span className="block text-[10px] font-normal text-stone-600">Priya (Organic Buyer)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('operator')}
                className="px-3 py-2 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 rounded-lg border border-amber-300 transition shadow-2xs text-left"
              >
                ⚖️ 3. Mandi Operator
                <span className="block text-[10px] font-normal text-amber-700">Vikram (Karnal APMC)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 text-xs font-bold text-purple-900 bg-white hover:bg-purple-50 rounded-lg border border-purple-300 transition shadow-2xs text-left"
              >
                🏛️ 4. Administrator
                <span className="block text-[10px] font-normal text-purple-700">Dr. Sengupta (Gov HQ)</span>
              </button>
            </div>
          </div>

          {/* Form Tabs: Login vs Register */}
          <div className="flex border-b border-stone-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(null); }}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-colors ${
                !isRegistering
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {language === 'hi' ? 'लॉगिन करें' : 'Login to Account'}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(null); }}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-colors ${
                isRegistering
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {language === 'hi' ? 'नया खाता बनाएं' : 'Create New Account'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {forgotMsg && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
              Password recovery OTP has been simulated to your registered mobile number. For hackathon evaluation, default demo password is <strong>farmer123</strong> or <strong>operator123</strong>.
            </div>
          )}

          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'ईमेल या मोबाइल नंबर' : 'Email or Mobile Number'}
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. ramesh.farmer@agriconnect.in or 9876543210"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'पासवर्ड' : 'Password'}
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-9 pr-10 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{language === 'hi' ? 'मुझे याद रखें' : 'Remember me'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{language === 'hi' ? 'सुरक्षित लॉगिन' : 'Sign In Securely'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Register As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('farmer')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      regRole === 'farmer'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    🌾 Farmer / किसान
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('consumer')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      regRole === 'consumer'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    🛒 Consumer / ग्राहक
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1 italic">
                  * Note: Procurement Operator accounts can only be provisioned by authorized Mandi Administrators.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="farmer@domain.com"
                    className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Geographic Details */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">State</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="block w-full px-2 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Haryana">Haryana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    placeholder="e.g. Karnal"
                    className="block w-full px-2 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Village / Locality</label>
                  <input
                    type="text"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="e.g. Taraori"
                    className="block w-full px-2 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Street / Farm plot / Sector"
                  className="block w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <span>Creating Account...</span> : <span>Complete Registration</span>}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-500">
              Government of India · Smart India Hackathon Initiative
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
