import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APP_ROUTES } from "@/constants/site";
import { BadgeStatus } from "@/features/admin/components/BadgeStatus";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { SidePanel } from "@/features/admin/components/SidePanel";
import { AdminBooking, AdminCar, ReservationStatus, fetchBookings, fetchCars } from "@/features/admin/lib/adminApi";
import { SiteContentField, fetchSiteContent, mergeContentFields } from "@/features/home/content/siteContent";
import { VEHICLES } from "@/features/home/data/vehicles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdminSection = "dashboard" | "reservations" | "cars" | "content" | "settings";
type CalendarView = "month" | "week" | "day";
type ExistingCarEditor = Omit<AdminCar, "created_at">;
type NewCarEditor = Omit<AdminCar, "id" | "code" | "created_at"> & { id: "new"; code: null };
type CarEditor = ExistingCarEditor | NewCarEditor;

const emptyCar: CarEditor = {
  id: "new",
  code: null,
  name: "",
  category: "",
  image_url: "",
  seats: 5,
  fuel_type: "Petrol",
  transmission: "Manual",
  daily_rent_price: 0,
  purchase_price: 0,
  featured: false,
  active: true,
};

const CAR_IMAGE_BUCKET = "car-images";
const CAR_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const CAR_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : "");

const calendarStatusStyles: Record<
  ReservationStatus,
  { chip: string; card: string; dot: string; label: string }
> = {
  pending: {
    chip: "border-orange-300 bg-orange-100 text-orange-950 shadow-sm hover:bg-orange-200",
    card: "border-orange-300 bg-orange-50 hover:bg-orange-100",
    dot: "bg-orange-500",
    label: "Pendiente",
  },
  accepted: {
    chip: "border-emerald-300 bg-emerald-100 text-emerald-950 shadow-sm hover:bg-emerald-200",
    card: "border-emerald-300 bg-emerald-50 hover:bg-emerald-100",
    dot: "bg-emerald-500",
    label: "Aceptada",
  },
  rejected: {
    chip: "border-red-300 bg-red-100 text-red-950 shadow-sm hover:bg-red-200",
    card: "border-red-300 bg-red-50 hover:bg-red-100",
    dot: "bg-red-500",
    label: "Denegada",
  },
  cancelled: {
    chip: "border-slate-300 bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200",
    card: "border-slate-300 bg-slate-50 hover:bg-slate-100",
    dot: "bg-slate-400",
    label: "Cancelada",
  },
};

const getCalendarStatusStyle = (status: ReservationStatus) => calendarStatusStyles[status] ?? calendarStatusStyles.pending;

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [view, setView] = useState<CalendarView>("month");
  const [focusDate, setFocusDate] = useState(new Date());
  const [reservations, setReservations] = useState<AdminBooking[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carFilter, setCarFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<AdminBooking | null>(null);
  const [selectedReservationIds, setSelectedReservationIds] = useState<string[]>([]);
  const [carEditor, setCarEditor] = useState<CarEditor | null>(null);
  const [contentFields, setContentFields] = useState<SiteContentField[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingCarImage, setIsUploadingCarImage] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [bookingsResult, carsResult, contentResult] = await Promise.allSettled([fetchBookings(), fetchCars(), fetchSiteContent()]);

      if (bookingsResult.status === "fulfilled") {
        setReservations(bookingsResult.value);
      } else {
        console.error(bookingsResult.reason);
        toast.error("No se pudieron cargar las reservas de bookings");
      }

      if (carsResult.status === "fulfilled") {
        setCars(carsResult.value);
      } else {
        console.error(carsResult.reason);
        setCars([]);
        toast.error("No se pudieron cargar los coches");
      }

      if (contentResult.status === "fulfilled") {
        setContentFields(mergeContentFields(contentResult.value));
      } else {
        console.error(contentResult.reason);
        toast.error("No se pudieron cargar los textos de la web");
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const start = toDateInput(reservation.date);
        const end = toDateInput(reservation.end_date ?? reservation.date);

        if (statusFilter !== "all" && reservation.status !== statusFilter) return false;
        if (carFilter !== "all" && String(reservation.car_id) !== carFilter) return false;
        if (fromDate && start < fromDate) return false;
        if (toDate && end > toDate) return false;
        if (search) {
          const q = search.toLowerCase();
          return reservation.name.toLowerCase().includes(q) || reservation.contact.toLowerCase().includes(q);
        }

        return true;
      }),
    [reservations, statusFilter, carFilter, search, fromDate, toDate],
  );

  const calendarRange = useMemo(() => {
    if (view === "day") return { start: startOfDay(focusDate), end: endOfDay(focusDate) };
    if (view === "week") return { start: startOfWeek(focusDate), end: endOfWeek(focusDate) };
    return { start: startOfMonth(focusDate), end: endOfMonth(focusDate) };
  }, [view, focusDate]);

  const calendarReservations = filteredReservations.filter((reservation) => {
    const start = parseISO(reservation.date);
    const end = parseISO(reservation.end_date ?? reservation.date);
    return (
      isWithinInterval(start, calendarRange) ||
      isWithinInterval(end, calendarRange) ||
      isWithinInterval(calendarRange.start, { start, end })
    );
  });

  const monthDays = useMemo(() => {
    if (view !== "month") return [];
    const start = startOfWeek(startOfMonth(focusDate));
    const end = endOfWeek(endOfMonth(focusDate));
    return eachDayOfInterval({ start, end });
  }, [focusDate, view]);

  const getReservationInterval = (reservation: AdminBooking) => {
    const start = parseISO(reservation.date);
    const end = parseISO(reservation.end_date ?? reservation.date);
    return { start: startOfDay(start), end: endOfDay(end) };
  };

  const getRangeLabel = () => {
    if (view === "month") return format(focusDate, "LLLL yyyy");
    if (view === "week") return `${format(calendarRange.start, "PPP")} - ${format(calendarRange.end, "PPP")}`;
    return format(focusDate, "PPP");
  };

  const movePeriod = (direction: 1 | -1) => {
    if (view === "day") setFocusDate(addDays(focusDate, direction));
    if (view === "week") setFocusDate(direction > 0 ? addWeeks(focusDate, 1) : subWeeks(focusDate, 1));
    if (view === "month") setFocusDate(direction > 0 ? addMonths(focusDate, 1) : subMonths(focusDate, 1));
  };

  const getCarName = (carId: string | number | null) => {
    const car = cars.find((item) => String(item.code) === String(carId));
    const fallbackCar = VEHICLES.find((vehicle) => String(vehicle.id) === String(carId));
    return car?.name ?? fallbackCar?.name ?? "Sin coche";
  };

  const getReservationTitle = (reservation: AdminBooking) => `${reservation.name} - ${getCarName(reservation.car_id)}`;

  const visibleReservationIds = useMemo(() => filteredReservations.map((reservation) => reservation.id), [filteredReservations]);
  const areAllVisibleReservationsSelected =
    visibleReservationIds.length > 0 && visibleReservationIds.every((id) => selectedReservationIds.includes(id));

  const toggleReservationSelection = (reservationId: string) => {
    setSelectedReservationIds((current) =>
      current.includes(reservationId) ? current.filter((id) => id !== reservationId) : [...current, reservationId],
    );
  };

  const toggleAllVisibleReservations = () => {
    setSelectedReservationIds((current) => {
      if (areAllVisibleReservationsSelected) {
        return current.filter((id) => !visibleReservationIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleReservationIds]));
    });
  };

  const updateReservation = async (reservation: AdminBooking, patch: Partial<AdminBooking>) => {
    const { error } = await supabase.from("bookings").update(patch).eq("id", reservation.id);
    if (error) {
      toast.error("No se pudo guardar la reserva", { description: error.message });
      return;
    }

    toast.success("Reserva actualizada");
    await load();
  };

  const saveCar = async () => {
    if (!carEditor?.name.trim()) return;

    const payload = {
      name: carEditor.name.trim(),
      category: carEditor.category || null,
      image_url: carEditor.image_url || null,
      seats: Number(carEditor.seats),
      fuel_type: carEditor.fuel_type.trim() || "Petrol",
      transmission: carEditor.transmission.trim() || "Manual",
      daily_rent_price: Number(carEditor.daily_rent_price),
      purchase_price: Number(carEditor.purchase_price),
      featured: carEditor.featured,
      active: carEditor.active,
    };

    if (carEditor.id === "new") {
      const { error } = await supabase.from("cars").insert(payload);
      if (error) return toast.error("No se pudo crear el coche", { description: error.message });
      toast.success("Coche creado");
    } else {
      const { error } = await supabase.from("cars").update(payload).eq("id", carEditor.id);
      if (error) return toast.error("No se pudo actualizar el coche", { description: error.message });
      toast.success("Coche actualizado");
    }

    setCarEditor(null);
    await load();
  };

  const updateContentField = (key: string, value: string) => {
    setContentFields((current) => current.map((field) => (field.key === key ? { ...field, value } : field)));
  };

  const saveSiteContent = async () => {
    setIsSavingContent(true);

    const rows = contentFields.map((field) => ({
      key: field.key,
      section: field.section,
      label: field.label,
      value: field.value,
      input_type: field.inputType,
      sort_order: field.sortOrder,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });

    setIsSavingContent(false);

    if (error) {
      toast.error("No se pudieron guardar los textos", { description: error.message });
      return;
    }

    toast.success("Textos guardados");
    await load();
  };

  const uploadCarImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !carEditor) return;

    if (!CAR_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato no valido", { description: "Sube una imagen JPG, PNG o WebP." });
      return;
    }

    if (file.size > CAR_IMAGE_MAX_SIZE) {
      toast.error("Imagen demasiado grande", { description: "El maximo permitido es 5 MB." });
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const path = `cars/${Date.now()}-${safeName || "car"}.${extension}`;

    setIsUploadingCarImage(true);

    try {
      const { error } = await supabase.storage.from(CAR_IMAGE_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        toast.error("No se pudo subir la imagen", { description: error.message });
        return;
      }

      const { data } = supabase.storage.from(CAR_IMAGE_BUCKET).getPublicUrl(path);
      setCarEditor((current) => (current ? { ...current, image_url: data.publicUrl } : current));
      toast.success("Imagen subida");
    } finally {
      setIsUploadingCarImage(false);
    }
  };

  const deleteReservations = async (reservationIds: string[]) => {
    if (reservationIds.length === 0) return;

    const { error } = await supabase.from("bookings").delete().in("id", reservationIds);
    if (error) {
      toast.error("No se pudieron borrar las reservas", { description: error.message });
      return;
    }

    setSelectedReservationIds((current) => current.filter((id) => !reservationIds.includes(id)));
    setSelectedReservation((current) => (current && reservationIds.includes(current.id) ? null : current));
    toast.success(reservationIds.length === 1 ? "Reserva eliminada" : "Reservas eliminadas");
    await load();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("No se pudo cerrar sesion", { description: error.message });
      setIsLoggingOut(false);
      return;
    }

    toast.success("Sesion cerrada");
    navigate(APP_ROUTES.adminLogin, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <aside className="rounded-2xl border bg-white p-3">
          <p className="mb-2 px-2 text-xs uppercase text-muted-foreground">Admin Panel</p>
          {(["dashboard", "reservations", "cars", "content", "settings"] as AdminSection[]).map((item) => (
            <Button
              key={item}
              variant={section === item ? "default" : "ghost"}
              className="mb-1 w-full justify-start capitalize"
              onClick={() => setSection(item)}
            >
              {item === "dashboard"
                ? "Calendario"
                : item === "reservations"
                  ? "Lista de reservas"
                  : item === "cars"
                    ? "Coches"
                    : item === "content"
                      ? "Textos"
                      : "Ajustes"}
            </Button>
          ))}
          <Button className="mt-3 w-full" variant="outline" onClick={() => load()}>
            Recargar
          </Button>
          <Button className="mt-2 w-full" variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Cerrando..." : "Cerrar sesion"}
          </Button>
        </aside>

        <main className="space-y-4">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
              <CardTitle>
                {section === "dashboard"
                  ? "Calendario de reservas"
                  : section === "reservations"
                    ? "Reservas"
                    : section === "cars"
                      ? "Coches"
                      : section === "content"
                        ? "Editor de textos"
                        : "Ajustes"}
              </CardTitle>

              {(section === "dashboard" || section === "reservations") && (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="accepted">accepted</SelectItem>
                      <SelectItem value="rejected">rejected</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={carFilter} onValueChange={setCarFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Coche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los coches</SelectItem>
                      {cars.map((car) => (
                      <SelectItem key={car.id} value={String(car.code)}>
                        {car.name}
                      </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input placeholder="Buscar" className="w-[170px]" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                  <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                </div>
              )}
            </CardHeader>
          </Card>

          {section === "dashboard" && (
            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => movePeriod(-1)}>
                    ←
                  </Button>
                  <p className="font-medium capitalize">{getRangeLabel()}</p>
                  <Button variant="outline" onClick={() => movePeriod(1)}>
                    →
                  </Button>
                </div>
                <Select value={view} onValueChange={(value) => setView(value as CalendarView)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="day">Día</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                {view === "month" && (
                  <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
                    {monthDays.map((day) => {
                      const dayReservations = calendarReservations.filter((reservation) =>
                        isWithinInterval(day, getReservationInterval(reservation)),
                      );

                      return (
                        <div
                          key={day.toISOString()}
                          className={`min-h-28 rounded-lg border p-2 ${isSameMonth(day, focusDate) ? "bg-white" : "bg-slate-100"}`}
                        >
                          <p className={`mb-1 text-xs font-medium ${isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground"}`}>
                            {format(day, "d")}
                          </p>
                          <div className="space-y-1">
                            {dayReservations.slice(0, 2).map((reservation) => (
                              (() => {
                                const style = getCalendarStatusStyle(reservation.status);

                                return (
                                  <button
                                    key={`${reservation.id}-${day.toISOString()}`}
                                    type="button"
                                    className={`w-full rounded border px-2 py-1 text-left text-xs font-medium transition ${style.chip}`}
                                    onClick={() => setSelectedReservation(reservation)}
                                  >
                                    <span className="flex min-w-0 items-center gap-1.5">
                                      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                                      <span className="truncate">{getReservationTitle(reservation)}</span>
                                    </span>
                                  </button>
                                );
                              })()
                            ))}
                            {dayReservations.length > 2 && <p className="text-[11px]">+{dayReservations.length - 2} más</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {view !== "month" &&
                  calendarReservations.map((reservation) => {
                    const style = getCalendarStatusStyle(reservation.status);

                    return (
                      <button
                        key={reservation.id}
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left transition ${style.card}`}
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium">
                              <span className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`} />
                              <span className="truncate">
                                {getReservationTitle(reservation)}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {toDateInput(reservation.date)} → {toDateInput(reservation.end_date ?? reservation.date)}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                            {style.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                {!loading && calendarReservations.length === 0 && <p className="text-sm text-muted-foreground">No hay reservas en este rango.</p>}
              </CardContent>
            </Card>
          )}

          {section === "reservations" && (
            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
                <CardTitle>Lista de reservas</CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{selectedReservationIds.length} seleccionadas</p>
                  <ConfirmDialog
                    title="Eliminar reservas"
                    description={`Se eliminaran ${selectedReservationIds.length} reservas seleccionadas. Esta accion no se puede deshacer.`}
                    onConfirm={() => deleteReservations(selectedReservationIds)}
                  >
                    <Button variant="destructive" disabled={selectedReservationIds.length === 0}>
                      Eliminar seleccionadas
                    </Button>
                  </ConfirmDialog>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="p-3">
                        <Checkbox
                          checked={areAllVisibleReservationsSelected}
                          onCheckedChange={toggleAllVisibleReservations}
                          aria-label="Seleccionar reservas visibles"
                        />
                      </th>
                      <th className="p-3">Fechas</th>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Coche</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-t">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedReservationIds.includes(reservation.id)}
                            onCheckedChange={() => toggleReservationSelection(reservation.id)}
                            aria-label={`Seleccionar reserva de ${reservation.name}`}
                          />
                        </td>
                        <td className="p-3">
                          {toDateInput(reservation.date)} → {toDateInput(reservation.end_date ?? reservation.date)}
                        </td>
                        <td className="font-medium">{getReservationTitle(reservation)}</td>
                        <td>{reservation.contact}</td>
                        <td>{getCarName(reservation.car_id)}</td>
                        <td>
                          <BadgeStatus status={reservation.status} />
                        </td>
                        <td>{reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : "-"}</td>
                        <td className="space-x-1 p-3">
                          <Button size="sm" variant="outline" onClick={() => updateReservation(reservation, { status: "accepted" })}>
                            Aceptar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateReservation(reservation, { status: "rejected" })}>
                            Denegar
                          </Button>
                          <Button size="sm" onClick={() => setSelectedReservation(reservation)}>
                            Detalle
                          </Button>
                          <ConfirmDialog
                            title="Eliminar reserva"
                            description="Esta reserva se eliminara de bookings. Esta accion no se puede deshacer."
                            onConfirm={() => deleteReservations([reservation.id])}
                          >
                            <Button size="sm" variant="destructive">
                              Borrar
                            </Button>
                          </ConfirmDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {section === "cars" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestión de coches</CardTitle>
                  <Button onClick={() => setCarEditor(emptyCar)}>Añadir coche</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cars.map((car) => (
                  <div key={car.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex min-w-0 gap-3">
                      {car.image_url ? <img src={car.image_url} alt={car.name} className="h-16 w-24 rounded-md object-cover" /> : null}
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Codigo {car.code} · {car.category || "Sin categoria"} · {car.seats} plazas · {car.fuel_type} · {car.transmission}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Alquiler {car.daily_rent_price} · Compra {car.purchase_price} · {car.featured ? "Destacado" : "Normal"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCarEditor({
                            ...car,
                            category: car.category || "",
                            image_url: car.image_url || "",
                          })
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={car.active ? "secondary" : "default"}
                        onClick={async () => {
                          await supabase.from("cars").update({ active: !car.active }).eq("id", car.id);
                          await load();
                        }}
                      >
                        {car.active ? "Activo" : "Inactivo"}
                      </Button>
                      <ConfirmDialog
                        title="Eliminar coche"
                        description="Esta acción no se puede deshacer."
                        onConfirm={async () => {
                          await supabase.from("cars").delete().eq("id", car.id);
                          await load();
                        }}
                      >
                        <Button size="sm" variant="destructive">
                          Borrar
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "content" && (
            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
                <div>
                  <CardTitle>Textos de la pagina principal</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Edita los textos por bloques y guarda los cambios al final.</p>
                </div>
                <Button onClick={saveSiteContent} disabled={isSavingContent}>
                  {isSavingContent ? "Guardando..." : "Guardar textos"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(
                  contentFields.reduce<Record<string, SiteContentField[]>>((groups, field) => {
                    groups[field.section] = groups[field.section] ?? [];
                    groups[field.section].push(field);
                    return groups;
                  }, {}),
                ).map(([group, fields]) => (
                  <div key={group} className="rounded-lg border p-4">
                    <h3 className="mb-4 font-heading text-lg font-semibold">{group}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.key} className={field.inputType === "textarea" ? "md:col-span-2" : ""}>
                          <Label>{field.label}</Label>
                          {field.inputType === "textarea" ? (
                            <Textarea value={field.value} onChange={(event) => updateContentField(field.key, event.target.value)} rows={4} />
                          ) : (
                            <Input value={field.value} onChange={(event) => updateContentField(field.key, event.target.value)} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "settings" && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Aquí puedes añadir futuros ajustes de negocio.</CardContent>
            </Card>
          )}
        </main>
      </div>

      <SidePanel title="Editar reserva" open={Boolean(selectedReservation)} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        {selectedReservation && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Cliente</Label>
              <Input value={selectedReservation.name} onChange={(event) => setSelectedReservation({ ...selectedReservation, name: event.target.value })} />
              <Input value={selectedReservation.contact} onChange={(event) => setSelectedReservation({ ...selectedReservation, contact: event.target.value })} />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label>Inicio</Label>
                <Input
                  type="date"
                  value={toDateInput(selectedReservation.date)}
                  onChange={(event) => setSelectedReservation({ ...selectedReservation, date: event.target.value })}
                />
              </div>
              <div>
                <Label>Fin</Label>
                <Input
                  type="date"
                  value={toDateInput(selectedReservation.end_date ?? selectedReservation.date)}
                  onChange={(event) =>
                    setSelectedReservation({
                      ...selectedReservation,
                      end_date: event.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <Select
              value={selectedReservation.car_id ? String(selectedReservation.car_id) : "none"}
              onValueChange={(value) =>
                setSelectedReservation({
                  ...selectedReservation,
                  car_id: value === "none" ? null : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Asignar coche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin coche</SelectItem>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={String(car.code)}>
                    {car.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedReservation.status}
              onValueChange={(value) => setSelectedReservation({ ...selectedReservation, status: value as ReservationStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="accepted">accepted</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Notas"
              value={selectedReservation.notes ?? ""}
              onChange={(event) => setSelectedReservation({ ...selectedReservation, notes: event.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => updateReservation(selectedReservation, { status: "accepted" })}>
                Aceptar
              </Button>
              <Button variant="outline" onClick={() => updateReservation(selectedReservation, { status: "rejected" })}>
                Denegar
              </Button>
              <Button variant="outline" onClick={() => updateReservation(selectedReservation, { status: "cancelled" })}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  updateReservation(selectedReservation, {
                    name: selectedReservation.name,
                    contact: selectedReservation.contact,
                    date: selectedReservation.date,
                    end_date: selectedReservation.end_date,
                    car_id: selectedReservation.car_id,
                    status: selectedReservation.status,
                    notes: selectedReservation.notes,
                  })
                }
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        )}
      </SidePanel>

      <SidePanel title={carEditor?.id === "new" ? "Nuevo coche" : "Editar coche"} open={Boolean(carEditor)} onOpenChange={(open) => !open && setCarEditor(null)}>
        {carEditor && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Codigo</Label>
                <Input
                  value={carEditor.id === "new" ? "Automatico al guardar" : carEditor.code}
                  disabled
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={carEditor.category ?? ""} onChange={(event) => setCarEditor({ ...carEditor, category: event.target.value })} />
              </div>
            </div>

            <div>
              <Label>Nombre</Label>
              <Input value={carEditor.name} onChange={(event) => setCarEditor({ ...carEditor, name: event.target.value })} />
            </div>

            <div>
              <Label>URL de imagen</Label>
              <Input value={carEditor.image_url ?? ""} onChange={(event) => setCarEditor({ ...carEditor, image_url: event.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label>Subir imagen</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadCarImage}
                disabled={isUploadingCarImage}
              />
              {isUploadingCarImage ? <p className="text-xs text-muted-foreground">Subiendo imagen...</p> : null}
              {carEditor.image_url ? (
                <img src={carEditor.image_url} alt={carEditor.name || "Imagen del coche"} className="h-32 w-full rounded-md object-cover" />
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Plazas</Label>
                <Input
                  type="number"
                  min={1}
                  value={carEditor.seats}
                  onChange={(event) => setCarEditor({ ...carEditor, seats: Number(event.target.value) })}
                />
              </div>
              <div>
                <Label>Combustible</Label>
                <Input value={carEditor.fuel_type} onChange={(event) => setCarEditor({ ...carEditor, fuel_type: event.target.value })} />
              </div>
              <div>
                <Label>Transmision</Label>
                <Input value={carEditor.transmission} onChange={(event) => setCarEditor({ ...carEditor, transmission: event.target.value })} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Precio alquiler/dia</Label>
                <Input
                  type="number"
                  min={0}
                  value={carEditor.daily_rent_price}
                  onChange={(event) => setCarEditor({ ...carEditor, daily_rent_price: Number(event.target.value) })}
                />
              </div>
              <div>
                <Label>Precio compra</Label>
                <Input
                  type="number"
                  min={0}
                  value={carEditor.purchase_price}
                  onChange={(event) => setCarEditor({ ...carEditor, purchase_price: Number(event.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Visible en web</Label>
                <Select value={carEditor.active ? "yes" : "no"} onValueChange={(value) => setCarEditor({ ...carEditor, active: value === "yes" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Activo</SelectItem>
                    <SelectItem value="no">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destacado</Label>
                <Select value={carEditor.featured ? "yes" : "no"} onValueChange={(value) => setCarEditor({ ...carEditor, featured: value === "yes" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Si</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={saveCar}>Guardar coche</Button>
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export default AdminDashboardPage;
