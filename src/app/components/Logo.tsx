interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  lightBg?: boolean;
}

export default function Logo({ size = 70, showWordmark = true, lightBg = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/Unilever Logo - Lockup - White.png"
        alt="Unilever"
        style={{ height: size, width: 'auto', objectFit: 'contain' }}
      // className="rounded-lg bg-white p-0.5"
      />
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