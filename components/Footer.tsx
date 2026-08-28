// components/Footer.tsx
"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-xl border-t border-[#c7a6f3]/30 relative z-20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 w-full">
        
        {/* Left Section: Brand, Description & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3 max-w-sm text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black font-heading text-[#220849] tracking-widest uppercase">
            GXC Arcade
          </h2>
          
          <p className="text-[#220849]/70 text-xs md:text-sm font-medium leading-relaxed">
            A premium web arcade engineered for high-precision reflex training and cognitive load testing.
          </p>

          <p className="hidden md:block mt-3 text-[10px] md:text-xs tracking-wider text-[#220849]/40 font-mono uppercase">
            © {new Date().getFullYear()} GXC ARCADE. ALL RIGHTS RESERVED.
          </p>
        </div>

        {/* Right Section: Engineering Credits */}
        <div className="flex flex-col items-center md:items-end gap-2 text-xs md:text-sm text-[#220849]/60 font-medium text-center md:text-right">
          <p>
            Designed and Developed by the{" "}
            <a 
              href="https://genxcode.cosmolix.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#5f2396] font-bold hover:text-[#220849] hover:underline transition-all"
            >
              GenXCode Tech Community
            </a>
          </p>
          <p>
            Specially Engineered by{" "}
            <a 
              href="https://cosmolix.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#5f2396] font-bold hover:text-[#220849] hover:underline transition-all"
            >
              Cosmolix Pvt Ltd
            </a>
          </p>
          
          {/* Mobile Copyright (Visible only on small screens) */}
          <p className="md:hidden mt-6 text-[10px] tracking-wider text-[#220849]/40 font-mono uppercase">
            © {new Date().getFullYear()} GXC ARCADE. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
}