import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveBackground from "@/components/WaveBackground";

const CitizenSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <WaveBackground />
      
      <div className="relative text-center max-w-md animate-scale-in">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full gradient-forest mx-auto mb-8 flex items-center justify-center shadow-card">
          <CheckCircle className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Rapor Başarıyla Gönderildi!
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          Bildiriminiz için teşekkür ederiz. Temizlik ekiplerimiz en kısa sürede 
          müdahale edecektir. Temiz bir çevre için katkınız çok değerli!
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/citizen")}
            className="w-full h-14 text-lg font-semibold rounded-xl gradient-sea shadow-button"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Rapor Gönder
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CitizenSuccess;
