import React, { useState } from "react";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Info, 
  ExternalLink,
  Building,
  CheckCircle2,
  Map,
  X
} from "lucide-react";

export default function NearbyOffices() {
  const [selectedOffice, setSelectedOffice] = useState<string | null>("office-1");

  const offices = [
    {
      id: "office-1",
      name: "Common Service Centre (CSC) — Central Delhi Unit",
      type: "CSC Center",
      address: "GF, Municipal Market Complex, Connaught Place, New Delhi, 110001",
      phone: "+91 11-23348102",
      hours: "09:30 AM — 05:30 PM (Mon-Sat)",
      services: ["Aadhaar Update", "Ration Card Application", "Caste & Income Certificates", "Utility Bill Payments"],
      distance: "0.8 km"
    },
    {
      id: "office-2",
      name: "Passport Seva Kendra (PSK) — Delhi East",
      type: "Passport Office",
      address: "Aditya Arcade, Ground Floor, Plot No. 30, Community Center, Preet Vihar, New Delhi, 110092",
      phone: "+91 1800-258-1800",
      hours: "09:00 AM — 04:00 PM (Mon-Fri)",
      services: ["New Passport Application", "Passport Renewal", "Background Verifications", "ECNR Clearances"],
      distance: "5.2 km"
    },
    {
      id: "office-3",
      name: "Regional Transport Office (RTO) — Janakpuri West",
      type: "Transport Authority",
      address: "Main Ring Road, Near District Centre, Janakpuri, New Delhi, 110058",
      phone: "+91 11-25501305",
      hours: "10:00 AM — 04:30 PM (Mon-Sat)",
      services: ["Learner Licence", "Permanent Driving Licence", "Vehicle Registration", "Fitness Certificates"],
      distance: "12.4 km"
    },
    {
      id: "office-4",
      name: "MCD Zonal Grievance Office — South Zone",
      type: "Municipal Office",
      address: "MCD Office Building, Green Park, New Delhi, 110016",
      phone: "+91 11-26514421",
      hours: "09:00 AM — 05:00 PM (Mon-Sat)",
      services: ["Birth & Death Registrations", "Property Tax Filings", "Sanitation Grievances", "Trade Licensing"],
      distance: "8.1 km"
    }
  ];

  const activeOffice = offices.find(o => o.id === selectedOffice);

  return (
    <div id="nearby-offices" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>Nearby Government Offices & CSCs</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Locate physical offices, Common Service Centres (CSCs), and Seva Kendras for in-person submissions
          </p>
        </div>

        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          📍 Local Area: New Delhi Central
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left list of offices (3 cols) */}
        <div className="lg:col-span-2 space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {offices.map((office) => {
            const isSelected = selectedOffice === office.id;
            return (
              <div
                key={office.id}
                onClick={() => setSelectedOffice(office.id)}
                className={`p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-xs space-y-2
                  ${isSelected 
                    ? "border-blue-500 bg-blue-50/10 shadow-sm" 
                    : "border-slate-150"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
                    {office.type}
                  </span>
                  <span className="font-extrabold text-slate-400 font-mono text-[9px]">
                    {office.distance}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-800 tracking-tight leading-snug">
                  {office.name}
                </h4>

                <p className="text-slate-500 leading-snug truncate">
                  {office.address}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right details / illustrative map container (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-2xl p-4 bg-slate-50">
          
          {/* Detailed Card info */}
          {activeOffice ? (
            <div className="space-y-4 flex flex-col justify-between text-xs font-bold text-slate-600">
              <div className="space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Office Profile</span>
                <h4 className="font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
                  {activeOffice.name}
                </h4>

                <div className="space-y-2 pt-1">
                  <p className="flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{activeOffice.address}</span>
                  </p>
                  
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 font-mono">{activeOffice.hours}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 font-mono">{activeOffice.phone}</span>
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Supported Services</span>
                  <div className="flex flex-wrap gap-1">
                    {activeOffice.services.map((srv, index) => (
                      <span key={index} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px]">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeOffice.name + ", " + activeOffice.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-center"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span>Get Directions (External Map)</span>
              </a>
            </div>
          ) : (
            <div className="text-center p-12 text-slate-400 flex flex-col items-center justify-center">
              <Building className="w-10 h-10 mb-2" />
              <p>Select an office from the list to view details.</p>
            </div>
          )}

          {/* Illustrative Vector Map Card */}
          <div className="border border-slate-250 rounded-xl overflow-hidden relative bg-slate-200 flex flex-col justify-between p-4 shadow-inner min-h-[220px]">
            {/* Mock Map Vector Grid Background with Pins */}
            <div className="absolute inset-0 bg-slate-200 opacity-40" 
                 style={{ 
                   backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px), radial-gradient(#94a3b8 1.5px, #e2e8f0 1.5px)", 
                   backgroundSize: "24px 24px", 
                   backgroundPosition: "0 0, 12px 12px" 
                 }} 
            />

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full text-slate-300 opacity-80" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="50" x2="100%" y2="80" stroke="currentColor" strokeWidth="8" />
              <line x1="120" y1="0" x2="160" y2="100%" stroke="currentColor" strokeWidth="6" />
              <line x1="0" y1="180" x2="100%" y2="120" stroke="currentColor" strokeWidth="10" />
            </svg>

            {/* Animated Pin Marker matching active selected office */}
            {activeOffice && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-bounce z-10">
                <div className="p-1.5 bg-blue-600 rounded-full text-white shadow-md border-2 border-white">
                  <Building className="w-4 h-4" />
                </div>
                <span className="bg-slate-900/95 border border-white/10 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md max-w-[120px] truncate block backdrop-blur-sm">
                  {activeOffice.name.split(" — ")[0]}
                </span>
              </div>
            )}

            <div className="relative flex justify-between items-start z-10">
              <span className="bg-slate-900/85 text-[8px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded-md border border-white/5 backdrop-blur-sm">
                🛰️ Map Simulation
              </span>
            </div>

            <div className="relative bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 leading-normal z-10">
              <span className="font-extrabold text-slate-800 block mb-0.5">Interactive Seeding</span>
              Real Google Maps rendering disabled. Use external action button to view precise route navigation on maps portal.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
