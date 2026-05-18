interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  lightBg?: boolean;
}

export default function Logo({ size = 40, showWordmark = true, lightBg = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="https://cdn.worldvectorlogo.com/logos/unilever-3.svg"
        aria-label="Unilever Claims Management"
      >
        <rect width="48" height="48" rx="10" fill="#0066CC" />
        <path
          d="M14 12 V28 a10 10 0 0 0 20 0 V12"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="36" r="2.2" fill="#23E7FF" />
        <circle cx="14" cy="12" r="2" fill="#C2E0FF" />
        <circle cx="34" cy="12" r="2" fill="#C2E0FF" />
      </svg>
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className={lightBg ? "text-night" : "text-white"} style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
            Unilever
          </span>
          <span className={lightBg ? "text-gray-500" : "text-pale"} style={{ fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 400 }}>
            CLAIMS MANAGEMENT
          </span>
        </div>
      )}
    </div>
  );
}