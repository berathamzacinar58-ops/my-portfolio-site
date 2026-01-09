import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
}

export const useLocation = (watchPosition = false) => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionGranted: false,
  });

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Tarayıcınız konum özelliğini desteklemiyor",
        loading: false,
      }));
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      
      if (permission.state === "denied") {
        toast({
          title: "Konum İzni Gerekli",
          description: "Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.",
          variant: "destructive",
        });
        setLocation(prev => ({
          ...prev,
          error: "Konum izni reddedildi",
          loading: false,
          permissionGranted: false,
        }));
        return false;
      }

      return true;
    } catch {
      // Fallback for browsers that don't support permissions API
      return true;
    }
  }, [toast]);

  const getCurrentPosition = useCallback(() => {
    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionGranted: true,
        });
      },
      (error) => {
        let errorMessage = "Konum alınamadı";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Konum izni reddedildi";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Konum bilgisi mevcut değil";
            break;
          case error.TIMEOUT:
            errorMessage = "Konum isteği zaman aşımına uğradı";
            break;
        }
        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionGranted: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    let watchId: number | null = null;

    const initLocation = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      if (watchPosition) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
              loading: false,
              permissionGranted: true,
            });
          },
          (error) => {
            console.error("Location watch error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      } else {
        getCurrentPosition();
      }
    };

    initLocation();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchPosition, requestPermission, getCurrentPosition]);

  return { ...location, refreshLocation: getCurrentPosition };
};

// Calculate distance between two points in km (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
