import { useState } from "react";
import { MapPin, Camera, Bell, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionRequestProps {
  onComplete: () => void;
  requiredPermissions?: ("location" | "camera" | "notifications")[];
}

const PermissionRequest = ({ 
  onComplete, 
  requiredPermissions = ["location", "camera", "notifications"] 
}: PermissionRequestProps) => {
  const { 
    permissions, 
    requestLocationPermission, 
    requestCameraPermission, 
    requestNotificationPermission 
  } = usePermissions();
  
  const [requesting, setRequesting] = useState<string | null>(null);

  const permissionItems = [
    {
      id: "location",
      title: "Konum",
      description: "Kirlilik konumunu belirlemek için gerekli",
      icon: MapPin,
      status: permissions.geolocation,
      request: requestLocationPermission,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "camera",
      title: "Kamera",
      description: "Kirlilik fotoğrafı çekmek için gerekli",
      icon: Camera,
      status: permissions.camera,
      request: requestCameraPermission,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: "notifications",
      title: "Bildirimler",
      description: "Yeni raporlar hakkında bilgilendirilmek için",
      icon: Bell,
      status: permissions.notifications === "granted" ? "granted" : permissions.notifications === "denied" ? "denied" : "prompt",
      request: requestNotificationPermission,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ].filter(item => requiredPermissions.includes(item.id as any));

  const handleRequestPermission = async (item: typeof permissionItems[0]) => {
    setRequesting(item.id);
    await item.request();
    setRequesting(null);
  };

  const allGranted = permissionItems.every(
    item => item.status === "granted"
  );

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gradient-sea mx-auto mb-8 flex items-center justify-center shadow-card">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          İzinler Gerekli
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Uygulamanın düzgün çalışması için aşağıdaki izinlere ihtiyacımız var
        </p>

        <div className="space-y-4 mb-8">
          {permissionItems.map((item) => {
            const Icon = item.icon;
            const isGranted = item.status === "granted";
            const isDenied = item.status === "denied";
            const isRequesting = requesting === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${
                  isGranted ? "border-secondary/50 bg-secondary/5" : 
                  isDenied ? "border-destructive/50 bg-destructive/5" : 
                  "border-border bg-card"
                } transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {isGranted && (
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {!isGranted && (
                      <Button
                        size="sm"
                        variant={isDenied ? "destructive" : "outline"}
                        className="mt-3"
                        onClick={() => handleRequestPermission(item)}
                        disabled={isRequesting}
                      >
                        {isRequesting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            İsteniyor...
                          </span>
                        ) : isDenied ? (
                          "Ayarlardan Etkinleştir"
                        ) : (
                          "İzin Ver"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-sea shadow-button hover:opacity-90 transition-opacity"
        >
          {allGranted ? "Devam Et" : "Daha Sonra"}
        </Button>
        
        {!allGranted && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Bazı özellikler izin vermeden çalışmayabilir
          </p>
        )}
      </div>
    </div>
  );
};

export default PermissionRequest;
