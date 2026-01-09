import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Phone, LogIn, UserPlus, KeyRound, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import WaveBackground from "@/components/WaveBackground";

type AuthMode = "login" | "register" | "forgot-password";

// Work areas/categories for staff
const workAreas = [
  { id: "pendik-sahil", name: "Pendik Sahil Yolu", lat: 40.8775, lng: 29.2333 },
  { id: "kartal-sahil", name: "Kartal Sahil Parkı", lat: 40.8897, lng: 29.1911 },
  { id: "dragos", name: "Dragos Sahili", lat: 40.8750, lng: 29.1666 },
  { id: "cevizli", name: "Cevizli Sahil Bandı", lat: 40.8833, lng: 29.1750 },
  { id: "guzelyali", name: "Güzelyalı Sahili", lat: 40.8708, lng: 29.2500 },
  { id: "tuzla-sahil", name: "Tuzla Sahil Yolu", lat: 40.8166, lng: 29.3000 },
];

const StaffAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const { latitude, longitude, permissionGranted } = useLocation(false);
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/staff/dashboard");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      toast({ title: "Hata", description: "E-posta adresi gerekli", variant: "destructive" });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Hata", description: "Geçerli bir e-posta adresi girin", variant: "destructive" });
      return false;
    }

    if (mode === "forgot-password") return true;

    if (!password.trim()) {
      toast({ title: "Hata", description: "Şifre gerekli", variant: "destructive" });
      return false;
    }

    if (mode === "register") {
      if (password.length < 6) {
        toast({ title: "Hata", description: "Şifre en az 6 karakter olmalı", variant: "destructive" });
        return false;
      }
      if (password !== confirmPassword) {
        toast({ title: "Hata", description: "Şifreler eşleşmiyor", variant: "destructive" });
        return false;
      }
      if (!fullName.trim()) {
        toast({ title: "Hata", description: "Ad soyad gerekli", variant: "destructive" });
        return false;
      }
      if (!phone.trim()) {
        toast({ title: "Hata", description: "Telefon numarası gerekli", variant: "destructive" });
        return false;
      }
      if (!workArea) {
        toast({ title: "Hata", description: "Çalışma alanı seçimi gerekli", variant: "destructive" });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({ title: "Hata", description: "E-posta veya şifre hatalı", variant: "destructive" });
          } else {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
          }
        } else {
          toast({ title: "Giriş Başarılı", description: "Hoş geldiniz!" });
          navigate("/staff/dashboard");
        }
      } else if (mode === "register") {
        const { error } = await signUp(email, password, fullName, phone, "staff", workArea);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({ title: "Hata", description: "Bu e-posta adresi zaten kayıtlı", variant: "destructive" });
          } else {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
          }
        } else {
          toast({ title: "Kayıt Başarılı", description: "Hoş geldiniz!" });
          navigate("/staff/dashboard");
        }
      } else if (mode === "forgot-password") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: "Hata", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "E-posta Gönderildi", description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
          setMode("login");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Görevli Girişi";
      case "register": return "Görevli Kaydı";
      case "forgot-password": return "Şifremi Unuttum";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login": return "Temizlik personeli giriş paneli";
      case "register": return "Yeni görevli hesabı oluşturun";
      case "forgot-password": return "Şifrenizi sıfırlamak için e-posta adresinizi girin";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <WaveBackground />
      
      <header className="relative py-6 px-6">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>
      
      <main className="relative flex-1 flex items-center justify-center px-6 pb-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-2xl gradient-forest mx-auto mb-8 flex items-center justify-center shadow-card">
            {mode === "forgot-password" ? (
              <KeyRound className="w-10 h-10 text-primary-foreground" />
            ) : mode === "register" ? (
              <UserPlus className="w-10 h-10 text-primary-foreground" />
            ) : (
              <Lock className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {getDescription()}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Adınız ve soyadınız"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 pl-12 rounded-xl text-base bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-14 pl-12 rounded-xl text-base bg-card"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline-block mr-2 text-secondary" />
                    Çalışma Alanı *
                  </label>
                  <Select value={workArea} onValueChange={setWorkArea}>
                    <SelectTrigger className="h-14 rounded-xl text-base bg-card">
                      <SelectValue placeholder="Çalışma alanınızı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {workAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id} className="py-3">
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                E-posta *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 rounded-xl text-base bg-card"
                />
              </div>
            </div>
            
            {mode !== "forgot-password" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Şifre *
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
            )}

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Şifre Tekrar *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 pl-12 rounded-xl text-base bg-card"
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold rounded-xl gradient-forest shadow-button hover:opacity-90 transition-opacity mt-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  İşleniyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {mode === "login" ? "Giriş Yap" : mode === "register" ? "Kayıt Ol" : "Şifre Sıfırla"}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot-password")}
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi Unuttum
                </button>
                <p className="text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-secondary font-medium hover:underline"
                  >
                    Kayıt Ol
                  </button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-secondary font-medium hover:underline"
                >
                  Giriş Yap
                </button>
              </p>
            )}
            {mode === "forgot-password" && (
              <button
                onClick={() => setMode("login")}
                className="text-secondary font-medium hover:underline"
              >
                Girişe Dön
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffAuth;
