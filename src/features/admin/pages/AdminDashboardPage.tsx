import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeStatus } from "@/features/admin/components/BadgeStatus";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { SidePanel } from "@/features/admin/components/SidePanel";
import { AdminBooking, AdminCar, ReservationStatus, fetchBookings, fetchCars } from "@/features/admin/lib/adminApi";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdminSection = "dashboard" | "reservations" | "cars" | "settings";
type CalendarView = "month" | "week" | "day";

const emptyCar = { id: "new", name: "", category: "", active: true };

const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : "");

const AdminDashboardPage = () => {
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
  const [carEditor, setCarEditor] = useState<{ id: string; name: string; category: string; active: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [bookingData, carData] = await Promise.all([fetchBookings(), fetchCars()]);
      setReservations(bookingData);
      setCars(carData);
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
        if (carFilter !== "all" && reservation.car_id !== carFilter) return false;
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

  const activeReservations = useMemo(
    () => filteredReservations.filter((reservation) => reservation.status !== "cancelled"),
    [filteredReservations],
  );
  const cancelledReservations = useMemo(
    () => filteredReservations.filter((reservation) => reservation.status === "cancelled"),
    [filteredReservations],
  );

  const calendarRange = useMemo(() => {
    if (view === "day") return { start: startOfDay(focusDate), end: endOfDay(focusDate) };
    if (view === "week") return { start: startOfWeek(focusDate), end: endOfWeek(focusDate) };
    return { start: startOfMonth(focusDate), end: endOfMonth(focusDate) };
  }, [view, focusDate]);

  const calendarReservations = activeReservations.filter((reservation) => {
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

  const updateReservation = async (reservation: AdminBooking, patch: Partial<AdminBooking>) => {
    if (reservation.sourceTable === "reservations") {
      const reservationId = reservation.id.replace("reservation-", "");
      const mirroredPatch = {
        customer_name: patch.name,
        customer_email: patch.contact,
        start_date: patch.date,
        end_date: patch.end_date,
        car_id: patch.car_id,
        status: patch.status,
        notes: patch.notes,
      };

      const { error } = await supabase.from("reservations").update(mirroredPatch).eq("id", reservationId);
      if (error) {
        toast.error("No se pudo guardar la reserva", { description: error.message });
        return;
      }

      toast.success("Reserva actualizada");
      await load();
      return;
    }

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
    const payload = { name: carEditor.name.trim(), category: carEditor.category || null, active: carEditor.active };

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <aside className="rounded-2xl border bg-white p-3">
          <p className="mb-2 px-2 text-xs uppercase text-muted-foreground">Admin Panel</p>
          {(["dashboard", "reservations", "cars", "settings"] as AdminSection[]).map((item) => (
            <Button
              key={item}
              variant={section === item ? "default" : "ghost"}
              className="mb-1 w-full justify-start capitalize"
              onClick={() => setSection(item)}
            >
              {item === "dashboard" ? "Calendario" : item === "reservations" ? "Lista de reservas" : item === "cars" ? "Coches" : "Ajustes"}
            </Button>
          ))}
          <Button className="mt-3 w-full" variant="outline" onClick={() => load()}>
            Recargar
          </Button>
        </aside>

        <main className="space-y-4">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
              <CardTitle>
                {section === "dashboard" ? "Calendario de reservas" : section === "reservations" ? "Reservas" : section === "cars" ? "Coches" : "Ajustes"}
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
                        <SelectItem key={car.id} value={car.id}>
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
                              <button
                                key={`${reservation.id}-${day.toISOString()}`}
                                type="button"
                                className="w-full truncate rounded bg-slate-100 px-2 py-1 text-left text-xs text-foreground hover:bg-slate-200"
                                onClick={() => setSelectedReservation(reservation)}
                              >
                                {reservation.name}
                              </button>
                            ))}
                            {dayReservations.length > 2 && <p className="text-[11px]">+{dayReservations.length - 2} más</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {view !== "month" &&
                  calendarReservations.map((reservation) => (
                    <button
                      key={reservation.id}
                      type="button"
                      className="w-full rounded-lg border bg-white p-3 text-left hover:bg-slate-50"
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">
                          {reservation.name} – {reservation.car?.name ?? "Sin coche"}
                        </p>
                        <BadgeStatus status={reservation.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {toDateInput(reservation.date)} → {toDateInput(reservation.end_date ?? reservation.date)}
                      </p>
                    </button>
                  ))}
                {!loading && calendarReservations.length === 0 && <p className="text-sm text-muted-foreground">No hay reservas en este rango.</p>}
              </CardContent>
            </Card>
          )}

          {section === "reservations" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold">{filteredReservations.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-semibold">{filteredReservations.filter((reservation) => reservation.status === "pending").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Aceptadas</p>
                    <p className="text-2xl font-semibold">{filteredReservations.filter((reservation) => reservation.status === "accepted").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Canceladas (historial)</p>
                    <p className="text-2xl font-semibold">{cancelledReservations.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reservas activas (pendientes, aceptadas o denegadas)</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-slate-100 text-left">
                      <tr>
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
                      {activeReservations.map((reservation) => (
                        <tr key={reservation.id} className="border-t">
                          <td className="p-3">
                            {toDateInput(reservation.date)} → {toDateInput(reservation.end_date ?? reservation.date)}
                          </td>
                          <td>{reservation.name}</td>
                          <td>{reservation.contact}</td>
                          <td>{reservation.car?.name ?? "Sin coche"}</td>
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
                          </td>
                        </tr>
                      ))}
                      {!loading && activeReservations.length === 0 && (
                        <tr className="border-t">
                          <td className="p-4 text-sm text-muted-foreground" colSpan={7}>
                            No hay reservas activas con los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historial de cancelaciones</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="p-3">Fechas</th>
                        <th>Cliente</th>
                        <th>Contacto</th>
                        <th>Coche</th>
                        <th>Estado</th>
                        <th>Creado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelledReservations.map((reservation) => (
                        <tr key={reservation.id} className="border-t">
                          <td className="p-3">
                            {toDateInput(reservation.date)} → {toDateInput(reservation.end_date ?? reservation.date)}
                          </td>
                          <td>{reservation.name}</td>
                          <td>{reservation.contact}</td>
                          <td>{reservation.car?.name ?? "Sin coche"}</td>
                          <td>
                            <BadgeStatus status={reservation.status} />
                          </td>
                          <td>{reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))}
                      {!loading && cancelledReservations.length === 0 && (
                        <tr className="border-t">
                          <td className="p-4 text-sm text-muted-foreground" colSpan={6}>
                            No hay reservas canceladas en el historial para los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
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
                    <div>
                      <p className="font-medium">{car.name}</p>
                      <p className="text-xs text-muted-foreground">{car.category || "Sin categoría"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCarEditor({ ...car, category: car.category || "" })}>
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
              value={selectedReservation.car_id ?? "none"}
              onValueChange={(value) => setSelectedReservation({ ...selectedReservation, car_id: value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Asignar coche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin coche</SelectItem>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
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
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={carEditor.name} onChange={(event) => setCarEditor({ ...carEditor, name: event.target.value })} />
            </div>
            <div>
              <Label>Categoría</Label>
              <Input value={carEditor.category} onChange={(event) => setCarEditor({ ...carEditor, category: event.target.value })} />
            </div>
            <Select value={carEditor.active ? "yes" : "no"} onValueChange={(value) => setCarEditor({ ...carEditor, active: value === "yes" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Activo</SelectItem>
                <SelectItem value="no">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={saveCar}>Guardar coche</Button>
          </div>
        )}
      </SidePanel>
    </div>
  );
};

export default AdminDashboardPage;
