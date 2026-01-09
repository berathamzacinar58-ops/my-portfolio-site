import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import WaveBackground from "@/components/WaveBackground";

const StaffLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen kullanıcı adı ve şifrenizi girin.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Demo login - in production this would check against a database
    toast({
      title: "Giriş Başarılı",
      description: "Hoş geldiniz!",
    });
    
    setIsLoading(false);
    navigate("/staff/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <WaveBackground />
      
      {/* Header */}
      <header className="relative py-6 px-6">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>
      
      <main className="relative flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl gradient-forest mx-auto mb-8 flex items-center justify-center shadow-card">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">
            Görevli Girişi
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Temizlik personeli giriş paneli
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 pl-12 rounded-xl text-base bg-card"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 rounded-xl text-base bg-card"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold rounded-xl gradient-forest shadow-button hover:opacity-90 transition-opacity mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
