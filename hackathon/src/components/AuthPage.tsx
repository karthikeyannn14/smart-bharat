import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  BookOpen, 
  Compass, 
  AlertOctagon, 
  FolderLock, 
  BotMessageSquare, 
  Loader2,
  CheckCircle2,
  LockKeyhole,
  Check,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { LanguageCode } from "../types";
import { AuthService } from "../services/auth";

interface AuthPageProps {
  onLoginSuccess: (name: string) => void;
  language: LanguageCode;
}

export default function AuthPage({ onLoginSuccess, language }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Google Account Chooser modal state
  const [showGoogleChooser, setShowGoogleChooser] = useState<boolean>(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);

  // Loading Steps State for 2-second transition
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const steps = [
    { label: "Welcome Back 👋", desc: "Verifying credentials with secure portal..." },
    { label: "Loading your citizen profile...", desc: "Synchronizing biometric & name registries..." },
    { label: "Checking saved documents...", desc: "Retrieving encrypted locker contents..." },
    { label: "Loading schemes...", desc: "Calculating benefits eligibility factors..." },
    { label: "Loading complaints...", desc: "Fetching localized civic grievance status..." },
    { label: "Redirecting...", desc: "Initializing main dashboard workspace..." }
  ];

  // Initialize the credentials store with the default seed user on load
  useEffect(() => {
    AuthService.initSeedUser();
  }, []);

  // Handle the sequential loading transitions
  useEffect(() => {
    if (!isLoading) return;

    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onLoginSuccess(fullName.trim() || "Bharat Citizen");
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 350); // Stagger steps to finish within ~2 seconds total

    return () => clearInterval(interval);
  }, [isLoading, fullName, onLoginSuccess]);

  // Real-time password check rules
  const checkRule = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password === confirmPassword && password.length > 0
  };

  const isPasswordValid = 
    checkRule.minLength && 
    checkRule.uppercase && 
    checkRule.lowercase && 
    checkRule.number && 
    checkRule.specialChar;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      const user = await AuthService.login(trimmedEmail, password);
      setFullName(user.fullName);
      setIsLoading(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !password || !confirmPassword) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return;
    }

    // Validate password rules
    if (!isPasswordValid) {
      setErrorMsg("Password does not meet all security complexity requirements.");
      return;
    }

    // Validate matching passwords
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms and Data Security Policy.");
      return;
    }

    try {
      const newUser = await AuthService.signUp(trimmedName, trimmedEmail, trimmedPhone, password);
      setSuccessMsg("Citizen account created successfully! Accessing portal...");
      setTimeout(() => {
        setIsLoading(true);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Sign up failed. Please try again.");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      const msg = await AuthService.resetPassword(trimmedEmail);
      setSuccessMsg(`${msg} A secure credential recovery token was transmitted to ${trimmedEmail}.`);
      setTimeout(() => {
        setMode("login");
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Verification failed.");
    }
  };

  const triggerGoogleSignIn = (gEmail: string, gName: string) => {
    setShowGoogleChooser(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    AuthService.loginWithGoogle(gEmail, gName)
      .then(user => {
        setFullName(user.fullName);
        setSuccessMsg(`Authenticated securely with Google as ${user.fullName}`);
        setTimeout(() => {
          setIsLoading(true);
        }, 800);
      })
      .catch(err => {
        setErrorMsg("Google authentication failed.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans select-none">
      
      {/* Background ambient security grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Loading Sequence Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 z-50 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 animate-pulse">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Smart Bharat AI</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Secure Citizen Gate</p>
              </div>

              {/* Progress Steps Checklist */}
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const isCompleted = loadingStep > idx;
                  const isCurrent = loadingStep === idx;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-start gap-4 p-3 rounded-2xl border transition-all duration-300 ${
                        isCompleted 
                          ? "bg-slate-900/60 border-emerald-500/20" 
                          : isCurrent 
                            ? "bg-blue-950/40 border-blue-500/30 shadow-md shadow-blue-500/5" 
                            : "bg-slate-900/20 border-slate-800/40 opacity-40"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                            <Check className="w-3.5 h-3.5 stroke-[4]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${
                          isCompleted ? "text-emerald-400" : isCurrent ? "text-blue-400" : "text-slate-400"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign-In Chooser Dialog */}
      <AnimatePresence>
        {showGoogleChooser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.28 1.955 15.54 1 12.24 1 5.92 1 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.64 11-11.24 0-.756-.08-1.334-.18-1.955H12.24z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100">Sign in with Google</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Choose an account to continue</p>
                </div>
              </div>

              {!showCustomGoogleForm ? (
                <div className="space-y-2">
                  <button 
                    onClick={() => triggerGoogleSignIn("ramesh@gmail.com", "Ramesh Kumar")}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950 flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-200 group-hover:text-blue-400">Ramesh Kumar</p>
                      <p className="text-[10px] text-slate-500 font-semibold">ramesh@gmail.com</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => triggerGoogleSignIn("demo@smartbharat.gov.in", "Bharat Citizen")}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950 flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      B
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-200 group-hover:text-indigo-400">Bharat Citizen</p>
                      <p className="text-[10px] text-slate-500 font-semibold">demo@smartbharat.gov.in</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShowCustomGoogleForm(true)}
                    className="w-full text-center py-2 text-[11px] font-black text-blue-400 hover:text-blue-300 transition-colors mt-2"
                  >
                    Use Another Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Google Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. citizen@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full bg-slate-950 text-white placeholder-slate-700 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Kumar"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full bg-slate-950 text-white placeholder-slate-700 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setShowCustomGoogleForm(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-extrabold py-2 rounded-xl"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (customGoogleEmail.trim() && customGoogleName.trim()) {
                          triggerGoogleSignIn(customGoogleEmail, customGoogleName);
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-xs font-black py-2 rounded-xl text-white disabled:opacity-50"
                      disabled={!customGoogleEmail.trim() || !customGoogleName.trim()}
                    >
                      Authenticate
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setShowGoogleChooser(false);
                    setShowCustomGoogleForm(false);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: 40% Width Desktop layout - Welcome, Feature List, AI Illustration */}
      <div className="w-full md:w-[42%] bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden shrink-0 z-10">
        
        {/* Decorative dynamic neon glow in background of left panel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-[96px] pointer-events-none" />

        {/* Brand Header */}
        <div className="space-y-3 relative">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-2xl text-blue-400 shadow-inner">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider uppercase">Smart Bharat</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
              SMART BHARAT
            </h1>
            <p className="text-blue-500 font-extrabold text-sm uppercase tracking-widest mt-2">
              AI-Powered Civic Portal
            </p>
          </div>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
            Bridging citizens and administrative services securely through digital empowerment and Gemini-driven assistance.
          </p>
        </div>

        {/* Dynamic Illustration Graphic of AI Secure Network */}
        <div className="my-8 py-4 flex justify-center items-center relative">
          <div className="w-56 h-56 rounded-full border border-slate-800/80 bg-slate-950/40 relative flex items-center justify-center shadow-2xl">
            {/* Spinning decorative concentric rings */}
            <div className="absolute inset-2 border border-dashed border-blue-500/10 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-6 border border-slate-800/60 rounded-full" />
            <div className="absolute inset-12 border border-dashed border-indigo-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
            
            {/* Pulsing center node */}
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
              <BotMessageSquare className="w-8 h-8 animate-bounce" />
            </div>

            {/* Orbiting badges */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-black text-slate-300 shadow-md">
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>Govt Services</span>
            </div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-black text-slate-300 shadow-md">
              <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Document Vault</span>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-black text-slate-300 shadow-md">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Schemes</span>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] font-black text-slate-300 shadow-md">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>Complaints</span>
            </div>
          </div>
        </div>

        {/* Feature List Checklist */}
        <div className="space-y-4 relative">
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">
            Core Digital Capabilities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
            {[
              { label: "AI Civic Assistant", desc: "Interactive conversational guidance for workflows", icon: BotMessageSquare, color: "text-blue-400" },
              { label: "Instant Eligibility Engine", desc: "Checks welfare and scholarship schemes instantly", icon: Compass, color: "text-indigo-400" },
              { label: "AI Image Diagnostics", desc: "Analyzes photos for potholes and streetlight complaints", icon: AlertOctagon, color: "text-red-400" },
              { label: "Secure Document Vault", desc: "Encrypted, local-first citizen dossier vault", icon: FolderLock, color: "text-emerald-400" }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-3 items-start p-2.5 hover:bg-slate-800/20 rounded-xl border border-transparent hover:border-slate-800/40 transition-all">
                  <div className={`mt-0.5 shrink-0 ${feature.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-200 leading-none">{feature.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-800/40 text-[10px] font-semibold text-slate-500 flex justify-between">
          <span>Digital Infrastructure v2.5</span>
          <span>India 🇮🇳</span>
        </div>
      </div>

      {/* RIGHT PANEL: 60% Width Layout - Centered white Card with login/signup/forgot forms */}
      <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        
        <div className="w-full max-w-lg space-y-6">

          {/* Demo Mode Visual Indicator Banner (Requirement 12) */}
          <div className="bg-blue-950/40 border border-blue-500/25 rounded-2xl p-4 flex gap-3 text-blue-300 text-xs shadow-inner">
            <Info className="w-5 h-5 shrink-0 text-blue-400" />
            <div className="space-y-1">
              <p className="font-extrabold text-blue-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                🔒 Citizen Portal Demo Auth Mode
              </p>
              <p className="font-medium text-blue-400/90 leading-normal text-[11px]">
                Powered by a simulated Firestore & Auth schema. For immediate sign-in, use the Google option or Email: <span className="font-mono text-white font-bold bg-slate-900 px-1.5 py-0.5 rounded">demo@smartbharat.gov.in</span> with Password: <span className="font-mono text-white font-bold bg-slate-900 px-1.5 py-0.5 rounded">Password123!</span>
              </p>
            </div>
          </div>
          
          {/* Main Card */}
          <motion.div 
            layout
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-blue-900/10 space-y-6 relative"
          >
            {/* Header Area inside Card */}
            <div className="space-y-1.5">
              <AnimatePresence mode="wait">
                {mode === "login" && (
                  <motion.div
                    key="login-title"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-500" />
                      <span>Welcome Back!</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                      Access your personalized dashboard, government services, and AI companion.
                    </p>
                  </motion.div>
                )}

                {mode === "signup" && (
                  <motion.div
                    key="signup-title"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <LockKeyhole className="w-6 h-6 text-indigo-500" />
                      <span>Create Smart Bharat Account</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                      Join India's AI-Powered Civic Companion for seamless public workflows.
                    </p>
                  </motion.div>
                )}

                {mode === "forgot" && (
                  <motion.div
                    key="forgot-title"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <Lock className="w-6 h-6 text-yellow-500" />
                      <span>Forgot Password</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                      Enter your registered email below and we'll transmit a secure credential recovery key.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error/Success Feedbacks */}
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold leading-relaxed">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-bold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Render Forms */}
            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.form 
                  key="login"
                  onSubmit={handleLoginSubmit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input 
                        required
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input 
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/40 w-4 h-4 cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button 
                      type="button"
                      onClick={() => { setErrorMsg(null); setMode("forgot"); }}
                      className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/10 hover:scale-[1.03] active:scale-[0.98] cursor-pointer block mt-2 text-center"
                  >
                    Sign In
                  </button>
                </motion.form>
              )}

              {mode === "signup" && (
                <motion.form 
                  key="signup"
                  onSubmit={handleSignupSubmit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          required
                          type="email"
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          required
                          type="tel"
                          placeholder="10-digit mobile"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          required
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          required
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual Password Complexity Checklist */}
                  {password.length > 0 && (
                    <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-1.5 text-[11px] font-bold text-slate-400">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Password Complexity Checklist</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {checkRule.minLength ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.minLength ? "text-slate-300" : ""}>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {checkRule.uppercase ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.uppercase ? "text-slate-300" : ""}>1 Uppercase (A-Z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {checkRule.lowercase ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.lowercase ? "text-slate-300" : ""}>1 Lowercase (a-z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {checkRule.number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.number ? "text-slate-300" : ""}>1 Number (0-9)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {checkRule.specialChar ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.specialChar ? "text-slate-300" : ""}>1 Special char</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {checkRule.match ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                          <span className={checkRule.match ? "text-slate-300" : ""}>Passwords match</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Checklist */}
                  <label className="flex items-start gap-2.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer select-none py-1 leading-normal">
                    <input 
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/40 w-4.5 h-4.5 cursor-pointer shrink-0 mt-0.5"
                    />
                    <span>
                      I agree to the National Data Security Policy and standard citizen Privacy Terms.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-500/10 hover:scale-[1.03] active:scale-[0.98] cursor-pointer block mt-2 text-center"
                  >
                    Create Account
                  </button>
                </motion.form>
              )}

              {mode === "forgot" && (
                <motion.form 
                  key="forgot"
                  onSubmit={handleForgotSubmit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input 
                        required
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 text-white placeholder-slate-600 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-yellow-500/10 hover:scale-[1.03] active:scale-[0.98] cursor-pointer block mt-2 text-center"
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button"
                      onClick={() => { setErrorMsg(null); setMode("login"); }}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Separator Line */}
            {mode !== "forgot" && (
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Or Continue With
                </span>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>
            )}

            {/* Third-party Buttons */}
            {mode !== "forgot" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(true)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.28 1.955 15.54 1 12.24 1 5.92 1 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.64 11-11.24 0-.756-.08-1.334-.18-1.955H12.24z"/>
                  </svg>
                  <span>Google Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerGoogleSignIn("democitizen@smartbharat.gov.in", "Bharat Citizen")}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  <div className="w-4.5 h-4.5 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm border border-orange-500/30">
                    DL
                  </div>
                  <span>DigiLocker Sign In</span>
                </button>
              </div>
            )}

            {/* Switch Mode Link */}
            <div className="text-center pt-2 text-xs font-semibold">
              {mode === "login" && (
                <p className="text-slate-400">
                  Don't have an account yet?{" "}
                  <button 
                    onClick={() => { setErrorMsg(null); setMode("signup"); }}
                    className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline cursor-pointer"
                  >
                    Create Account →
                  </button>
                </p>
              )}

              {mode === "signup" && (
                <p className="text-slate-400">
                  Already have a citizen account?{" "}
                  <button 
                    onClick={() => { setErrorMsg(null); setMode("login"); }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </motion.div>

          {/* Security & Quality Badges below Card */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-4">
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
              <Lock className="w-3.5 h-3.5 text-blue-500" /> Secured Authentication
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Encrypted Data (TLS 1.3)
            </span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
              <span className="text-xs leading-none">🇮🇳</span> Government Inspired Platform
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
