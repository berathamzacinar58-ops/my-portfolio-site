import { useNavigate } from "react-router-dom";
import { Users, Sparkles } from "lucide-react";
import RoleCard from "@/components/RoleCard";
import WaveBackground from "@/components/WaveBackground";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <WaveBackground />
      
      {/* Header */}
      <header className="relative pt-8 pb-4 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Temiz Sahiller, Mutlu Yarınlar</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Pendik-Kartal Sahil
            <span className="block text-primary mt-1">Temizlik Takip Sistemi</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Sahillerimizi birlikte temiz tutalım. Kirlilik gördüğünüzde hemen bildirin, 
            görevlilerimiz hızlıca müdahale etsin.
          </p>
        </div>
      </header>
      
      {/* Role Selection */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <p className="text-center text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Devam etmek için rolünüzü seçin
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <RoleCard
                title="Vatandaş"
                description="Sahilde kirlilik gördüğünüzde fotoğraf çekip rapor gönderin. Temiz bir çevre için katkıda bulunun."
                icon={Users}
                variant="citizen"
                onClick={() => navigate("/citizen/auth")}
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <RoleCard
                title="Görevli"
                description="Vatandaşların gönderdiği raporları görüntüleyin ve temizlik görevlerini yönetin."
                icon={Sparkles}
                variant="staff"
                onClick={() => navigate("/staff/login")}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative py-6 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 Pendik-Kartal Belediyesi · Çevre Temizlik Müdürlüğü
        </p>
      </footer>
    </div>
  );
};

export default Index;
