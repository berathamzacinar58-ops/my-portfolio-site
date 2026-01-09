import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface PermissionState {
  camera: PermissionStatus | null;
  geolocation: PermissionStatus | null;
  notifications: NotificationPermission;
}

type PermissionStatus = "granted" | "denied" | "prompt";

export const usePermissions = () => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: null,
    geolocation: null,
    notifications: "default",
  });
  const [loading, setLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setLoading(true);
    
    try {
      // Check geolocation permission
      if (navigator.permissions) {
        try {
          const geoPermission = await navigator.permissions.query({ name: "geolocation" });
          setPermissions(prev => ({
            ...prev,
            geolocation: geoPermission.state as PermissionStatus,
          }));

          geoPermission.onchange = () => {
            setPermissions(prev => ({
              ...prev,
              geolocation: geoPermission.state as PermissionStatus,
            }));
          };
        } catch (e) {
          console.log("Geolocation permission check not supported");
        }

        // Check camera permission
        try {
          const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName });
          setPermissions(prev => ({
            ...prev,
            camera: cameraPermission.state as PermissionStatus,
          }));

          cameraPermission.onchange = () => {
            setPermissions(prev => ({
              ...prev,
              camera: cameraPermission.state as PermissionStatus,
            }));
          };
        } catch (e) {
          console.log("Camera permission check not supported");
        }
      }

      // Check notification permission
      if ("Notification" in window) {
        setPermissions(prev => ({
          ...prev,
          notifications: Notification.permission,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions(prev => ({ ...prev, geolocation: "granted" }));
          toast({
            title: "Konum İzni Verildi",
            description: "Konum bilginiz alınabilir.",
          });
          resolve(true);
        },
        () => {
          setPermissions(prev => ({ ...prev, geolocation: "denied" }));
          toast({
            title: "Konum İzni Reddedildi",
            description: "Konum özelliklerini kullanmak için izin gereklidir.",
            variant: "destructive",
          });
          resolve(false);
        }
      );
    });
  }, [toast]);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: "granted" }));
      toast({
        title: "Kamera İzni Verildi",
        description: "Fotoğraf çekebilirsiniz.",
      });
      return true;
    } catch {
      setPermissions(prev => ({ ...prev, camera: "denied" }));
      toast({
        title: "Kamera İzni Reddedildi",
        description: "Fotoğraf çekmek için kamera izni gereklidir.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast({
        title: "Bildirimler Desteklenmiyor",
        description: "Tarayıcınız bildirimleri desteklemiyor.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, notifications: permission }));
      
      if (permission === "granted") {
        toast({
          title: "Bildirim İzni Verildi",
          description: "Yeni raporlar için bildirim alacaksınız.",
        });
        return true;
      } else {
        toast({
          title: "Bildirim İzni Reddedildi",
          description: "Bildirim almak için izin gereklidir.",
          variant: "destructive",
        });
        return false;
      }
    } catch {
      return false;
    }
  }, [toast]);

  const requestAllPermissions = useCallback(async () => {
    await requestLocationPermission();
    await requestCameraPermission();
    await requestNotificationPermission();
  }, [requestLocationPermission, requestCameraPermission, requestNotificationPermission]);

  return {
    permissions,
    loading,
    requestLocationPermission,
    requestCameraPermission,
    requestNotificationPermission,
    requestAllPermissions,
    checkPermissions,
  };
};
