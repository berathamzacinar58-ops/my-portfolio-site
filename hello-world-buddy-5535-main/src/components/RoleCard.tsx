import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: "citizen" | "staff";
  onClick: () => void;
}

const RoleCard = ({ title, description, icon: Icon, variant, onClick }: RoleCardProps) => {
  const isStaff = variant === "staff";
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "role-card w-full text-left group",
        isStaff 
          ? "gradient-forest shadow-card hover:shadow-card-hover" 
          : "gradient-sea shadow-card hover:shadow-card-hover"
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      
      {/* Icon */}
      <div className={cn(
        "relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
        "bg-white/20 backdrop-blur-sm",
        "group-hover:scale-110 transition-transform duration-500"
      )}>
        <Icon className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
      </div>
      
      {/* Content */}
      <div className="relative">
        <h2 className="text-2xl font-bold text-primary-foreground mb-2">
          {title}
        </h2>
        <p className="text-primary-foreground/80 text-base leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Arrow indicator */}
      <div className={cn(
        "absolute bottom-8 right-8 w-12 h-12 rounded-full",
        "bg-white/20 backdrop-blur-sm flex items-center justify-center",
        "group-hover:translate-x-2 transition-transform duration-300"
      )}>
        <svg 
          className="w-6 h-6 text-primary-foreground" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
};

export default RoleCard;
