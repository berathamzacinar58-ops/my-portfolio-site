import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Send, Upload, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import WaveBackground from "@/components/WaveBackground";
import PermissionRequest from "@/components/PermissionRequest";

const CitizenReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const { latitude, longitude, loading: locationLoading, error: locationError, refreshLocation } = useLocation(false);
  
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/citizen/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check if permissions have been requested before
    const permissionsRequested = localStorage.getItem("citizen_permissions_requested");
    if (!permissionsRequested) {
      setShowPermissions(true);
    }
  }, []);

  const handlePermissionsComplete = () => {
    localStorage.setItem("citizen_permissions_requested", "true");
    setShowPermissions(false);
    refreshLocation();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "Fotoğraf gerekli",
        description: "Lütfen kirlilik alanının fotoğrafını çekin veya yükleyin.",
        variant: "destructive",
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "Konum gerekli",
        description: "Lütfen konum izni verin veya konumunuzu yenileyin.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Açıklama gerekli",
        description: "Lütfen kirlilik hakkında kısa bir açıklama yazın.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get user's profile id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profil bulunamadı");
      }

      // Upload image to storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      // Create report
      const { error: reportError } = await supabase
        .from("reports")
        .insert({
          reporter_id: profile.id,
          latitude,
          longitude,
          location_name: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          description,
          image_url: urlData.publicUrl,
        });

      if (reportError) {
        throw reportError;
      }
      
      toast({
        title: "Rapor Gönderildi! ✓",
        description: "Bildiriminiz için teşekkür ederiz. Yakındaki görevlilere bildirim gönderildi.",
      });
      
      navigate("/citizen/success");
    } catch (error: any) {
      console.error("Report submission error:", error);
      toast({
        title: "Hata",
        description: error.message || "Rapor gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showPermissions) {
    return (
      <PermissionRequest 
        onComplete={handlePermissionsComplete}
        requiredPermissions={["location", "camera"]}
      />
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <WaveBackground />
      
      {/* Header */}
      <header className="relative sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Kirlilik Bildirimi</h1>
              <p className="text-sm text-muted-foreground">Fotoğraf çekin ve rapor gönderin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <LogOut className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>
      
      <main className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Image Upload Section */}
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Kirlilik Fotoğrafı *
          </label>
          
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img 
                src={imagePreview} 
                alt="Seçilen fotoğraf" 
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-foreground/80 flex items-center justify-center hover:bg-foreground transition-colors"
              >
                <X className="w-5 h-5 text-background" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all">
                <Camera className="w-10 h-10 text-primary mb-2" />
                <span className="text-sm font-medium text-primary">Fotoğraf Çek</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              
              <label className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-secondary/30 bg-secondary/5 cursor-pointer hover:bg-secondary/10 hover:border-secondary/50 transition-all">
                <Upload className="w-10 h-10 text-secondary mb-2" />
                <span className="text-sm font-medium text-secondary">Galeriden Seç</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Location Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-semibold text-foreground mb-3">
            <MapPin className="w-4 h-4 inline-block mr-2 text-primary" />
            Konum *
          </label>
          <div className="bg-card rounded-xl p-4 shadow-card">
            {locationLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Konum alınıyor...</span>
              </div>
            ) : locationError ? (
              <div className="text-destructive">{locationError}</div>
            ) : latitude && longitude ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary font-medium">
                  <MapPin className="w-4 h-4" />
                  Konum Alındı
                </div>
                <p className="text-sm text-muted-foreground">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                <input
                  type="text"
                  placeholder="Konum adı (opsiyonel): örn. Pendik Sahil"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ) : (
              <Button variant="outline" onClick={refreshLocation}>
                <MapPin className="w-4 h-4 mr-2" />
                Konumu Al
              </Button>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Açıklama *
          </label>
          <Textarea
            placeholder="Kirlilik hakkında detaylı bilgi verin. Örn: Plastik şişeler, yiyecek atıkları, sigara izmaritleri..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-32 rounded-xl text-base bg-card resize-none"
          />
        </div>
        
        {/* Submit Button */}
        <div className="animate-fade-in pt-4" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold rounded-xl gradient-sea shadow-button hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Gönderiliyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Raporu Gönder
              </span>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CitizenReport;
