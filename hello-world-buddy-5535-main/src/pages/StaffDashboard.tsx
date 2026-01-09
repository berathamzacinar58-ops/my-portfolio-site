import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Clock, CheckCircle, AlertCircle, Eye, RefreshCw, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, calculateDistance } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import WaveBackground from "@/components/WaveBackground";
import PermissionRequest from "@/components/PermissionRequest";

interface Report {
  id: string;
  location_name: string;
  description: string;
  image_url: string | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const statusConfig = {
  pending: {
    label: "Bekliyor",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
  in_progress: {
    label: "İşlemde",
    variant: "default" as const,
    icon: Clock,
  },
  completed: {
    label: "Tamamlandı",
    variant: "secondary" as const,
    icon: CheckCircle,
  },
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { latitude, longitude, loading: locationLoading, permissionGranted, refreshLocation } = useLocation(true);
  
  const [showPermissions, setShowPermissions] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/staff/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const permissionsRequested = localStorage.getItem("staff_permissions_requested");
    if (!permissionsRequested) {
      setShowPermissions(true);
    }
  }, []);

  const handlePermissionsComplete = () => {
    localStorage.setItem("staff_permissions_requested", "true");
    setShowPermissions(false);
    refreshLocation();
  };

  // Fetch reports
  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Calculate distances if we have location
        let reportsWithDistance = data as Report[];
        if (latitude && longitude) {
          reportsWithDistance = data.map((report: Report) => ({
            ...report,
            distance: calculateDistance(latitude, longitude, report.latitude, report.longitude),
          }));
          // Filter reports within 5km and sort by distance
          reportsWithDistance = reportsWithDistance
            .filter(r => (r.distance || 0) <= 5)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setReports(reportsWithDistance);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newReport = payload.new as Report;
            if (latitude && longitude) {
              newReport.distance = calculateDistance(latitude, longitude, newReport.latitude, newReport.longitude);
              if (newReport.distance <= 5) {
                setReports((prev) => [newReport, ...prev].sort((a, b) => (a.distance || 0) - (b.distance || 0)));
                // Show notification
                if (Notification.permission === "granted") {
                  new Notification("Yeni Rapor!", {
                    body: `${newReport.location_name} - ${newReport.description.substring(0, 50)}...`,
                  });
                }
                toast({
                  title: "Yeni Rapor!",
                  description: `${newReport.location_name} konumunda yeni kirlilik bildirimi`,
                });
              }
            } else {
              setReports((prev) => [newReport, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setReports((prev) =>
              prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, latitude, longitude, toast]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleUpdateStatus = async (reportId: string, newStatus: "in_progress" | "completed") => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }

      toast({
        title: "Durum Güncellendi",
        description: `Rapor durumu "${statusConfig[newStatus].label}" olarak değiştirildi.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showPermissions) {
    return (
      <PermissionRequest
        onComplete={handlePermissionsComplete}
        requiredPermissions={["location", "notifications"]}
      />
    );
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const inProgressCount = reports.filter((r) => r.status === "in_progress").length;
  const completedCount = reports.filter((r) => r.status === "completed").length;

  return (
    <div className="min-h-screen pb-8">
      <WaveBackground />
      
      {/* Header */}
      <header className="relative sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Görevli Paneli</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {permissionGranted && latitude && longitude ? (
                <>
                  <Navigation className="w-3 h-3 text-secondary" />
                  <span>Konum aktif - 5 km içindeki raporlar</span>
                </>
              ) : (
                <span>Konum bekleniyor...</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshLocation}
              className="rounded-full"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="relative max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <div className="text-3xl font-bold text-destructive">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Bekleyen</div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <div className="text-3xl font-bold text-primary">{inProgressCount}</div>
            <div className="text-sm text-muted-foreground">İşlemde</div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <div className="text-3xl font-bold text-secondary">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Tamamlanan</div>
          </div>
        </div>
        
        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Yakındaki Raporlar ({reports.length})
          </h2>
          
          {loadingReports ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Yakınınızda rapor bulunmuyor</p>
              <p className="text-sm">5 km içinde yeni raporlar geldiğinde burada göreceksiniz</p>
            </div>
          ) : (
            reports.map((report, index) => {
              const status = statusConfig[report.status];
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={report.id}
                  className="bg-card rounded-2xl p-4 shadow-card animate-fade-in cursor-pointer hover:shadow-card-hover transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex gap-4">
                    {report.image_url && (
                      <img
                        src={report.image_url}
                        alt="Kirlilik"
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {report.location_name}
                          {report.distance !== undefined && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {report.distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <Badge variant={status.variant} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-foreground text-sm line-clamp-2 mb-2">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(report.created_at)}
                        </span>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      
      {/* Report Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-50 flex items-end justify-center md:items-center"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-card rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt="Kirlilik"
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  {selectedReport.location_name}
                </div>
                <Badge variant={statusConfig[selectedReport.status].variant}>
                  {statusConfig[selectedReport.status].label}
                </Badge>
              </div>

              {selectedReport.distance !== undefined && (
                <div className="mb-4 p-3 bg-primary/10 rounded-xl">
                  <div className="flex items-center gap-2 text-primary">
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">{selectedReport.distance.toFixed(2)} km uzaklıkta</span>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-foreground mb-2">Açıklama</h3>
              <p className="text-muted-foreground mb-6">{selectedReport.description}</p>
              
              <div className="flex gap-3">
                {selectedReport.status === "pending" && (
                  <Button 
                    className="flex-1 gradient-sea"
                    onClick={() => handleUpdateStatus(selectedReport.id, "in_progress")}
                    disabled={updatingStatus}
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    İşleme Al
                  </Button>
                )}
                {selectedReport.status === "in_progress" && (
                  <Button 
                    className="flex-1 gradient-forest"
                    onClick={() => handleUpdateStatus(selectedReport.id, "completed")}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Tamamla
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
