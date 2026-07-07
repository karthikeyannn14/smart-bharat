import React, { useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  AlertCircle,
  PlusCircle,
  ListChecks,
  Camera,
  MessageSquare,
  ArrowRight,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Complaint } from "../types";

interface ComplaintsDashboardProps {
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  initialViewMode?: "list" | "new";
  language: "en" | "hi" | "ta" | "te" | "ml" | "bn";
  preFillCategory?: string;
  preFillDescription?: string;
  preFillImage?: string;
}

export default function ComplaintsDashboard({ 
  complaints, 
  setComplaints, 
  initialViewMode = "list",
  language,
  preFillCategory,
  preFillDescription,
  preFillImage
}: ComplaintsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"list" | "new">(initialViewMode);
  
  // New Report Form States
  const [issueCategory, setIssueCategory] = useState(preFillCategory || "roads/potholes");
  const [issueDescription, setIssueDescription] = useState(preFillDescription || "");
  const [issueLocation, setIssueLocation] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    mimeType: string;
    data: string; // base64
    previewUrl: string;
  } | null>(preFillImage ? {
    name: "audited_issue.jpg",
    mimeType: "image/jpeg",
    data: preFillImage.split(",")[1] || preFillImage,
    previewUrl: preFillImage
  } : null);

  React.useEffect(() => {
    if (preFillCategory) {
      setIssueCategory(preFillCategory);
    }
    if (preFillDescription) {
      setIssueDescription(preFillDescription);
    }
    if (preFillImage) {
      setSelectedImage({
        name: "audited_issue.jpg",
        mimeType: "image/jpeg",
        data: preFillImage.split(",")[1] || preFillImage,
        previewUrl: preFillImage
      });
      setActiveTab("new"); // Switch to New Report form automatically if pre-filled!
    }
  }, [preFillCategory, preFillDescription, preFillImage]);

  const [reviewDraft, setReviewDraft] = useState<{
    id: string;
    category: string;
    formalComplaint: string;
    originalDescription: string;
    location: string;
    status: "Submitted";
    estimatedCompletion: string;
    holdReason?: string | null;
    actionableNextStep?: string | null;
    likelyIssueType?: string | null;
    imageUrl?: string | null;
  } | null>(null);

  // Expanded Complaint tracking index state
  const [trackedComplaintId, setTrackedComplaintId] = useState<string | null>(null);

  const categories = {
    "roads/potholes": { label: "Roads & Potholes", dept: "PWD (Public Works Dept)", icon: "🛣️" },
    "garbage/sanitation": { label: "Garbage & Sanitation", dept: "Sanitation Dept", icon: "🗑️" },
    "water supply": { label: "Water Supply", dept: "Water Board", icon: "🚰" },
    "streetlight": { label: "Streetlight Repair", dept: "Electricity Board", icon: "💡" },
    "public safety": { label: "Public Safety", dept: "Local Law Enforcement", icon: "👮" },
    "other": { label: "Other Civic Issue", dept: "Municipal Grievance Cell", icon: "🏛️" }
  };

  const statusBadges = {
    "Submitted": { text: "🟡 Submitted", color: "bg-amber-50 text-amber-700 border-amber-200" },
    "Under review": { text: "🔵 Under Review", color: "bg-blue-50 text-blue-700 border-blue-200" },
    "Resolved": { text: "🟢 Resolved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  };

  const handleSimulateProgress = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status === "Submitted") {
          return { ...c, status: "Under review", estimatedCompletion: "4 days" };
        } else if (c.status === "Under review") {
          return { 
            ...c, 
            status: "Resolved", 
            estimatedCompletion: "Resolved", 
            holdReason: null, 
            actionableNextStep: null 
          };
        } else {
          return { ...c, status: "Submitted", estimatedCompletion: "5 days" };
        }
      }
      return c;
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const processSelectedImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG/JPEG/WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const rawBase64 = (reader.result as string).split(",")[1];
      setSelectedImage({
        name: file.name,
        mimeType: file.type,
        data: rawBase64,
        previewUrl: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim() || !issueLocation.trim() || submittingReport) return;

    setSubmittingReport(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: issueCategory,
          description: issueDescription,
          location: issueLocation,
          language: language,
          image: selectedImage ? {
            mimeType: selectedImage.mimeType,
            data: selectedImage.data
          } : null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reach AI report processor");
      }

      const data = await response.json();
      
      if (data.category) {
        setIssueCategory(data.category);
      }

      setReviewDraft({
        id: data.id || `CIV-${Math.floor(10000 + Math.random() * 90000)}`,
        category: data.category || issueCategory,
        formalComplaint: data.formalComplaint || issueDescription,
        originalDescription: issueDescription,
        location: issueLocation,
        status: "Submitted",
        estimatedCompletion: data.estimatedCompletion || "5 days",
        holdReason: data.holdReason || null,
        actionableNextStep: data.actionableNextStep || null,
        likelyIssueType: data.likelyIssueType || null,
        imageUrl: selectedImage ? selectedImage.previewUrl : null
      });

    } catch (err: any) {
      console.error(err);
      alert("Verification draft generation failed. Continuing with offline draft...");
      // Offline fallback draft
      setReviewDraft({
        id: `CIV-${Math.floor(10000 + Math.random() * 90000)}`,
        category: issueCategory,
        formalComplaint: `Civic issue reported under category ${issueCategory}. description: ${issueDescription}.`,
        originalDescription: issueDescription,
        location: issueLocation,
        status: "Submitted",
        estimatedCompletion: "5 days",
        imageUrl: selectedImage ? selectedImage.previewUrl : null
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleConfirmSubmit = () => {
    if (!reviewDraft) return;

    const finalComplaint: Complaint = {
      id: reviewDraft.id,
      category: reviewDraft.category,
      originalDescription: reviewDraft.originalDescription,
      formalComplaint: reviewDraft.formalComplaint,
      location: reviewDraft.location,
      status: "Submitted",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      estimatedCompletion: reviewDraft.estimatedCompletion,
      holdReason: reviewDraft.holdReason,
      actionableNextStep: reviewDraft.actionableNextStep,
      likelyIssueType: reviewDraft.likelyIssueType,
      imageUrl: reviewDraft.imageUrl
    };

    setComplaints(prev => [finalComplaint, ...prev]);
    
    // Clear form and open list
    setIssueDescription("");
    setIssueLocation("");
    setSelectedImage(null);
    setReviewDraft(null);
    setActiveTab("list");
    setTrackedComplaintId(finalComplaint.id); // auto-expand tracking for the fresh submission!
  };

  const handleDeleteComplaint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this grievance?")) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      if (trackedComplaintId === id) {
        setTrackedComplaintId(null);
      }
    }
  };

  const getDepartment = (categoryKey: string): string => {
    const key = categoryKey as keyof typeof categories;
    return categories[key]?.dept || "Municipal Authority";
  };

  const getCategoryIcon = (categoryKey: string): string => {
    const key = categoryKey as keyof typeof categories;
    return categories[key]?.icon || "🏢";
  };

  const getCategoryLabel = (categoryKey: string): string => {
    const key = categoryKey as keyof typeof categories;
    return categories[key]?.label || categoryKey;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header tab buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 fill-rose-100" />
            <span>Civic Complaints Portal</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            File local issues, analyze damage with Gemini Vision, and track official departments
          </p>
        </div>

        {/* Tab triggers */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer
              ${activeTab === "list" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            Grievance History ({complaints.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("new");
              setReviewDraft(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer
              ${activeTab === "new" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            Report New Grievance
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        /* Redesigned Grievance Tracking List */
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto fill-emerald-50" />
              <p className="text-slate-800 font-black text-sm">No active complaints registered!</p>
              <p className="text-xs text-slate-400 font-bold">Your neighborhood is looking great. Click "Report New Grievance" if you see an issue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((c) => {
                const isTracking = trackedComplaintId === c.id;
                const statusInfo = statusBadges[c.status] || { text: c.status, color: "bg-slate-50 text-slate-600 border-slate-200" };
                return (
                  <div 
                    key={c.id}
                    className={`bg-white border transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between
                      ${isTracking 
                        ? "border-blue-400 shadow-md ring-1 ring-blue-400/5" 
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Compact row summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl p-3 bg-slate-50 rounded-xl shrink-0 border border-slate-100 self-start">
                          {getCategoryIcon(c.category)}
                        </span>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                              #{c.id}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              🏢 {getDepartment(c.category)}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                            {c.formalComplaint.length > 80 
                              ? `${c.formalComplaint.substring(0, 80)}...` 
                              : c.formalComplaint
                            }
                          </h3>
                          <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{c.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Track and Delete buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setTrackedComplaintId(isTracking ? null : c.id)}
                          className={`font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1
                            ${isTracking 
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                              : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                            }
                          `}
                        >
                          <span>Track Progress</span>
                          {isTracking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleSimulateProgress(c.id)}
                          title="Simulate step progress"
                          className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteComplaint(c.id, e)}
                          title="Delete complaint"
                          className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Progress Timeline */}
                    {isTracking && (
                      <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                        
                        {/* Summary of Original Complaint & Images */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Original Citizen Description</span>
                            <p className="text-xs text-slate-600 font-bold italic leading-relaxed">
                              "{c.originalDescription}"
                            </p>
                          </div>
                          
                          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Responsible Administrative Unit</span>
                            <p className="text-xs text-slate-700 font-bold">
                              This grievance has been officially cataloged and dispatched to the <span className="text-blue-700 font-black">{getDepartment(c.category)}</span>.
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">Estimated resolution timeline: <span className="font-mono">{c.estimatedCompletion}</span></p>
                          </div>
                        </div>

                        {c.imageUrl && (
                          <div className="rounded-xl overflow-hidden max-w-sm border border-slate-200 bg-slate-50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block p-3 border-b border-slate-150 bg-slate-100/50">Attached Damage Image</span>
                            <img 
                              src={c.imageUrl} 
                              alt="Grievance attachment" 
                              className="w-full max-h-52 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {c.likelyIssueType && (
                              <div className="p-3 bg-white text-xs font-bold text-slate-500 border-t border-slate-150">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Gemini Visual Audit:</span>
                                {c.likelyIssueType}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Warning/Hold Banners if any holdReasons exist */}
                        {c.holdReason && (
                          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3 text-amber-950 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                            <div className="space-y-1 text-xs">
                              <p className="font-black uppercase tracking-wider text-amber-900">
                                Verification Discrepancy (Status Hold)
                              </p>
                              <p className="font-bold">
                                Reason: <span className="font-mono font-medium">{c.holdReason}</span>
                              </p>
                              <p className="font-semibold text-amber-950/80">
                                <strong>Action Required:</strong> {c.actionableNextStep}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Interactive Node Timeline: Submitted -> Under review -> Resolved */}
                        <div className="space-y-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Audit Workflow Progress</span>
                          
                          <div className="relative pt-4 pb-8 max-w-3xl mx-auto px-4">
                            {/* Line connecting the points */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                            
                            {/* Animated active progress bar */}
                            <div 
                              className={`absolute top-1/2 left-8 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500
                                ${c.status === "Submitted" ? "w-[10%]" : ""}
                                ${c.status === "Under review" ? "w-[50%]" : ""}
                                ${c.status === "Resolved" ? "w-[100%]" : ""}
                              `} 
                            />

                            {/* Timeline steps */}
                            <div className="relative flex justify-between z-10 text-center">
                              {/* Node 1: Submitted */}
                              <div className="space-y-2 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all
                                  ${c.status === "Submitted" || c.status === "Under review" || c.status === "Resolved"
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                                    : "bg-white border-slate-200 text-slate-400"
                                  }
                                `}>
                                  1
                                </div>
                                <span className={`text-[10px] font-extrabold tracking-tight uppercase
                                  ${c.status === "Submitted" || c.status === "Under review" || c.status === "Resolved" ? "text-slate-800" : "text-slate-400"}
                                `}>Submitted</span>
                                <span className="text-[9px] text-slate-400 font-bold block leading-none">Logged</span>
                              </div>

                              {/* Node 2: Under Review */}
                              <div className="space-y-2 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all
                                  ${c.status === "Under review" || c.status === "Resolved"
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                                    : "bg-white border-slate-200 text-slate-400"
                                  }
                                `}>
                                  2
                                </div>
                                <span className={`text-[10px] font-extrabold tracking-tight uppercase
                                  ${c.status === "Under review" || c.status === "Resolved" ? "text-slate-800" : "text-slate-400"}
                                `}>Under Review</span>
                                <span className="text-[9px] text-slate-400 font-bold block leading-none">Allocated to Dept</span>
                              </div>

                              {/* Node 3: Resolved */}
                              <div className="space-y-2 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all
                                  ${c.status === "Resolved"
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10 animate-pulse"
                                    : "bg-white border-slate-200 text-slate-400"
                                  }
                                `}>
                                  ✓
                                </div>
                                <span className={`text-[10px] font-extrabold tracking-tight uppercase
                                  ${c.status === "Resolved" ? "text-emerald-700" : "text-slate-400"}
                                `}>Resolved</span>
                                <span className="text-[9px] text-slate-400 font-bold block leading-none">Closed Factual</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Grievance Submission Flow (Form + Gemini Draft generation) */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
          {!reviewDraft ? (
            /* Part A: Fill Details */
            <form onSubmit={handleGenerateDraft} className="space-y-5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>File a Public Grievance</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Grievance Department / Category</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.label} — ({value.dept})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Exact Location / Landmark</label>
                  <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <MapPin className="w-4 h-4 text-red-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Pillar 56, Main Market road, Salt Lake, Sector 3..."
                      value={issueLocation}
                      onChange={(e) => setIssueLocation(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-800 py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Casual Description of the Issue</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what is broken or damaged in plain, casual words (e.g. 'The streetlight has been dead for 5 days and women feel insecure walking after 7 PM' or 'There's a leakage in the water tap pipe on the corner...')"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Drag and Drop Image Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Attach Civic Damage Image (Gemini Vision Verification)</span>
                </label>

                {!selectedImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all duration-200
                      ${isDragging 
                        ? "border-blue-500 bg-blue-50/20" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }
                    `}
                  >
                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-500 border border-slate-200 shadow-sm">
                      <Upload className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-black text-slate-700">Drag & Drop damage photo here</p>
                      <p className="text-[10px] text-slate-400 font-bold">PNG, JPEG, WEBP files supported (Max 5MB)</p>
                    </div>
                    <label className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm">
                      <span>Browse Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <img 
                        src={selectedImage.previewUrl} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{selectedImage.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Ready for Gemini analysis</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2.5 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors text-slate-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={submittingReport || !issueDescription.trim() || !issueLocation.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  {submittingReport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Drafting Formal Statement with AI...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Formulate Official Draft</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Part B: Review Formal Statement Draft */
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Verify Generated Official Draft</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  Our Gemini model has parsed your local issue details, identified potential damage, and formatted a formal administrative statement suitable for government registries:
                </p>
              </div>

              {/* Comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Your Casual Feedback</span>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">
                      "{reviewDraft.originalDescription}"
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>Location: {reviewDraft.location}</span>
                    </p>
                  </div>
                </div>

                <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50/10 space-y-3">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">AI Formulated Complaint (Registrar-Ready)</span>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-800 font-extrabold leading-relaxed">
                      {reviewDraft.formalComplaint}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-black uppercase">
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        🏢 Dept: {getDepartment(reviewDraft.category)}
                      </span>
                      {reviewDraft.likelyIssueType && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          🔍 Vision Match: {reviewDraft.likelyIssueType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {reviewDraft.imageUrl && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 max-w-sm">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Analyzed Photo Attachment</span>
                  <img 
                    src={reviewDraft.imageUrl} 
                    alt="Analyzed preview" 
                    className="w-full max-h-40 object-cover rounded-xl border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 font-bold leading-normal uppercase">
                *BY CLICKING "SUBMIT", THIS COMPLAINT STATEMENT WILL BE SEEDED INTO THE LOCAL ACTION REGISTRY SIMULATOR FOR TRACKING AND PROGRESS SCHEDULING.
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewDraft(null)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Confirm & Submit Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
