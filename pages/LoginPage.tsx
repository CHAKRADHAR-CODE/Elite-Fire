
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { stateService } from '../services/stateService';
import { Mail, Lock, User as UserIcon, ShieldAlert, Zap, Swords, Target, Eye, EyeOff, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', pin: '', confirmPin: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email: string) => /^[a-z0-9._%+-]+@gmail\.(com|in)$/.test(email);
  const validateUsername = (username: string) => /^[A-Z_]+$/.test(username);
  const validatePin = (pin: string) => /^\d{6}$/.test(pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsProcessing(true);

    const email = formData.email.toLowerCase().trim();
    const pin = formData.pin;

    // Simulate network delay for tactical feel
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isLogin) {
        // Fix: Added await to resolve the Promise<User[]> returned by stateService.getUsers
        const allUsers = await stateService.getUsers(true);
        const user = allUsers.find(u => u.email === email && u.pin === pin);
        if (user) {
          if (user.isDeleted) throw new Error('Account purged from battlefield.');
          if (user.isBlocked) throw new Error('Operative blocked by High Command.');
          setSuccess('AUTHENTICATION SUCCESSFUL: ACCESS GRANTED');
          setTimeout(() => {
            localStorage.setItem('efb_current_user', JSON.stringify(user));
            onLogin(user);
          }, 800);
        } else {
          throw new Error('Signal Mismatch: Invalid Credentials Checkpoint.');
        }
      } else {
        if (!validateUsername(formData.username)) throw new Error('Codename must be UPPERCASE & UNDERSCORE only.');
        if (!validateEmail(email)) throw new Error('Invalid Identity: Use @gmail.com or .in');
        if (!validatePin(pin)) throw new Error('Security Breach: PIN must be 6 digits.');
        if (pin !== formData.confirmPin) throw new Error('Signal Conflict: PINs do not match.');

        // Fix: Added await to resolve the Promise<User> returned by stateService.addUser
        const newUser = await stateService.addUser({
          username: formData.username,
          email: email,
          pin: pin,
          role: UserRole.PLAYER,
          balance: 0
        });
        setSuccess('UNIT DEPLOYED SUCCESSFULLY: IDENTITY SYNCHED');
        setTimeout(() => {
          localStorage.setItem('efb_current_user', JSON.stringify(newUser));
          onLogin(newUser);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Fatal System Error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUsernameInput = (val: string) => {
    setFormData({ ...formData, username: val.toUpperCase().replace(/[^A-Z_]/g, '') });
  };

  const handleEmailInput = (val: string) => {
    setFormData({ ...formData, email: val.toLowerCase() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ff4d00]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00f2ea]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-0 rounded-[40px] overflow-hidden glass-panel relative z-10">
        
        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-gradient-to-br from-black/80 to-[#ff4d00]/10 border-r border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-16 h-16 bg-[#ff4d00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,77,0,0.5)]">
                <Flame className="text-white" size={32} />
              </div>
              <div>
                <h1 className="font-gaming text-3xl font-black fire-text italic uppercase">ELITE FIRE</h1>
                <p className="text-[#ff4d00] text-[9px] font-black tracking-[0.5em] uppercase">Tactical Grid v5.1</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-gaming font-black text-white leading-[1.1] mb-6">
              SECURE <br /> THE <span className="text-[#ff4d00]">VICTORY.</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-12">
              Enter the grid. Manage your squad, track combat results, and dominate the elite battlefield.
            </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
               <ShieldCheck className="text-[#ff4d00]" size={20} />
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Signal Encryption Protocol Active</p>
             </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-12 lg:p-20 bg-black/40">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            
            <div className="lg:hidden flex justify-center mb-10">
               <div className="w-14 h-14 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-lg">
                  <Flame className="text-white" size={24} />
               </div>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-2xl font-gaming font-black text-white uppercase tracking-tighter mb-2 italic">
                {isLogin ? 'Command Log-In' : 'Recruit Operative'}
              </h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                {isLogin ? 'Authenticating battlefield signal...' : 'Registering new soldier to the grid...'}
              </p>
            </div>

            <div className="flex p-1.5 bg-white/5 rounded-2xl mb-8 border border-white/10">
              <button 
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${isLogin ? 'bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30' : 'text-gray-500 hover:text-white'}`}
              >
                SIGN IN
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isLogin ? 'bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30' : 'text-gray-500 hover:text-white'}`}
              >
                JOIN GRID
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="group">
                      <div className="relative">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff4d00] transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="OPERATIVE NAME"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all uppercase placeholder:text-gray-700"
                          value={formData.username}
                          onChange={(e) => handleUsernameInput(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="group">
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff4d00] transition-colors" size={18} />
                      <input 
                        type="email" 
                        placeholder="NETWORK ID (EMAIL)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all lowercase placeholder:text-gray-700"
                        value={formData.email}
                        onChange={(e) => handleEmailInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff4d00] transition-colors" size={18} />
                      <input 
                        type={showPin ? "text" : "text"} 
                        placeholder="SECURITY PIN"
                        maxLength={6}
                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-sm font-gaming text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all tracking-[0.6em] placeholder:text-gray-700 placeholder:tracking-normal ${!showPin ? 'pin-mask-dots' : ''}`}
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPin(!showPin)} 
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                      >
                        {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="group">
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff4d00] transition-colors" size={18} />
                        <input 
                          type={showPin ? "text" : "text"} 
                          placeholder="CONFIRM PIN"
                          maxLength={6}
                          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-gaming text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all tracking-[0.6em] placeholder:text-gray-700 placeholder:tracking-normal ${!showPin ? 'pin-mask-dots' : ''}`}
                          value={formData.confirmPin}
                          onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Status Message Display */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      x: [0, -10, 10, -10, 10, 0] // Shake animation
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3 text-red-500 bg-red-500/10 p-5 rounded-2xl border border-red-500/30 text-xs font-black uppercase tracking-tight shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    <ShieldAlert size={20} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 text-[#00f2ea] bg-[#00f2ea]/10 p-5 rounded-2xl border border-[#00f2ea]/30 text-xs font-black uppercase tracking-tight shadow-[0_0_20px_rgba(0,242,234,0.2)]"
                  >
                    <Zap size={20} className="shrink-0 animate-pulse" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                disabled={isProcessing}
                type="submit" 
                className={`w-full bg-[#ff4d00] text-white py-6 rounded-2xl font-gaming font-black text-xs shadow-[0_0_40px_rgba(255,77,0,0.3)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] ${isProcessing ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02] hover:shadow-[#ff4d00]/50'}`}
              >
                {isLogin ? <Target size={22} className="group-hover:rotate-12 transition-transform duration-300" /> : <Swords size={22} className="group-hover:animate-bounce" />}
                {isLogin ? 'INITIALIZE AUTHENTICATION' : 'DEPLOY UNIT TO GRID'}
                <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Absolute Bottom Info */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white">SECURE INTERFACE GRID v5.1.0-STABLE</p>
      </div>
    </div>
  );
};

export default LoginPage;
