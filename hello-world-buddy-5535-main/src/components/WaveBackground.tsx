const WaveBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Animated wave layers */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-48 md:h-64"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path 
          className="animate-wave fill-sea-light opacity-50"
          d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,197.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path 
          className="fill-sea-medium opacity-30"
          style={{ animationDelay: '0.5s' }}
          d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,224C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-primary/20 animate-float" />
      <div className="absolute top-40 right-20 w-4 h-4 rounded-full bg-secondary/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-60 left-1/4 w-2 h-2 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default WaveBackground;
