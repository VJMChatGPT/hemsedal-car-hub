import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
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
import { supabase } from "@/integrations/supabase/client";
import { BadgeStatus } from "@/features/admin/components/BadgeStatus";
import { SidePanel } from "@/features/admin/components/SidePanel";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { AdminCar, AdminReservation, ReservationStatus, fetchCars, fetchReservations } from "@/features/admin/lib/adminApi";
import { toast } from "sonner";

type AdminSection = "dashboard" | "reservations" | "cars" | "settings";
type CalendarView = "month" | "week" | "day";

const emptyCar = { id: "new", name: "", category: "", active: true };

const AdminDashboardPage = () => {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [view, setView] = useState<CalendarView>("month");
  const [focusDate, setFocusDate] = useState(new Date());
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carFilter, setCarFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [carEditor, setCarEditor] = useState<{ id: string; name: string; category: string; active: boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [reservationData, carData] = await Promise.all([fetchReservations(), fetchCars()]);
      setReservations(reservationData);
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
        if (statusFilter !== "all" && reservation.status !== statusFilter) return false;
        if (carFilter !== "all" && reservation.car_id !== carFilter) return false;
        if (fromDate && reservation.start_date < fromDate) return false;
        if (toDate && reservation.end_date > toDate) return false;
        if (search) {
          const q = search.toLowerCase();
          return reservation.customer_name.toLowerCase().includes(q) || reservation.customer_email.toLowerCase().includes(q);
        }
        return true;
      }),
    [reservations, statusFilter, carFilter, search, fromDate, toDate],
  );

  const calendarRange = useMemo(() => {
    if (view === "day") {
      return { start: focusDate, end: focusDate };
    }
    if (view === "week") {
      return { start: startOfWeek(focusDate), end: endOfWeek(focusDate) };
    }
    return { start: startOfMonth(focusDate), end: endOfMonth(focusDate) };
  }, [view, focusDate]);

  const calendarReservations = filteredReservations.filter((reservation) => {
    const start = parseISO(reservation.start_date);
    return isWithinInterval(start, calendarRange);
  });

  const movePeriod = (direction: 1 | -1) => {
    if (view === "day") setFocusDate(addDays(focusDate, direction));
    if (view === "week") setFocusDate(direction > 0 ? addWeeks(focusDate, 1) : subWeeks(focusDate, 1));
    if (view === "month") setFocusDate(direction > 0 ? addMonths(focusDate, 1) : subMonths(focusDate, 1));
  };

  const updateReservation = async (id: string, patch: Partial<AdminReservation>) => {
    const { error } = await supabase.from("reservations").update(patch).eq("id", id);
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
            <Button key={item} variant={section === item ? "default" : "ghost"} className="mb-1 w-full justify-start capitalize" onClick={() => setSection(item)}>
              {item === "dashboard" ? "Calendario" : item === "reservations" ? "Lista de reservas" : item === "cars" ? "Coches" : "Ajustes"}
            </Button>
          ))}
          <Button className="mt-4 w-full" variant="outline" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </Button>
        </aside>

        <main className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Filtros rápidos</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-6">
              <Input placeholder="Buscar por nombre/email" value={search} onChange={(event) => setSearch(event.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">pending</SelectItem><SelectItem value="accepted">accepted</SelectItem><SelectItem value="rejected">rejected</SelectItem><SelectItem value="cancelled">cancelled</SelectItem></SelectContent></Select>
              <Select value={carFilter} onValueChange={setCarFilter}><SelectTrigger><SelectValue placeholder="Coche" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los coches</SelectItem>{cars.map((car) => <SelectItem key={car.id} value={car.id}>{car.name}</SelectItem>)}</SelectContent></Select>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
              <Button variant="outline" onClick={load}>Recargar</Button>
            </CardContent>
          </Card>

          {section === "dashboard" && (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Calendario ({view})</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => movePeriod(-1)}>Anterior</Button>
                    <Button size="sm" variant="outline" onClick={() => setFocusDate(new Date())}>Hoy</Button>
                    <Button size="sm" variant="outline" onClick={() => movePeriod(1)}>Siguiente</Button>
                    <Select value={view} onValueChange={(value) => setView(value as CalendarView)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="month">Mes</SelectItem><SelectItem value="week">Semana</SelectItem><SelectItem value="day">Día</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{format(calendarRange.start, "dd MMM yyyy")} - {format(calendarRange.end, "dd MMM yyyy")}</p>
                {loading ? <p>Cargando calendario...</p> : calendarReservations.map((reservation) => (
                  <button key={reservation.id} className="w-full rounded-lg border p-3 text-left hover:bg-slate-50" onClick={() => setSelectedReservation(reservation)}>
                    <p className="font-medium">{reservation.customer_name} – {reservation.car?.name ?? "Sin coche"}</p>
                    <p className="text-sm text-muted-foreground">{reservation.start_date} → {reservation.end_date}</p>
                    <BadgeStatus status={reservation.status} />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "reservations" && (
            <Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-100 text-left"><tr><th className="p-3">Fechas</th><th>Cliente</th><th>Email</th><th>Coche</th><th>Estado</th><th>Creado</th><th></th></tr></thead><tbody>{filteredReservations.map((reservation) => <tr key={reservation.id} className="border-t"><td className="p-3">{reservation.start_date} → {reservation.end_date}</td><td>{reservation.customer_name}</td><td>{reservation.customer_email}</td><td>{reservation.car?.name ?? "Sin coche"}</td><td><BadgeStatus status={reservation.status} /></td><td>{new Date(reservation.created_at).toLocaleDateString()}</td><td className="space-x-1 p-3"><Button size="sm" variant="outline" onClick={() => updateReservation(reservation.id, { status: "accepted" })}>Aceptar</Button><Button size="sm" variant="outline" onClick={() => updateReservation(reservation.id, { status: "rejected" })}>Denegar</Button><Button size="sm" onClick={() => setSelectedReservation(reservation)}>Detalle</Button></td></tr>)}</tbody></table></CardContent></Card>
          )}

          {section === "cars" && (
            <Card>
              <CardHeader><div className="flex items-center justify-between"><CardTitle>Gestión de coches</CardTitle><Button onClick={() => setCarEditor(emptyCar)}>Añadir coche</Button></div></CardHeader>
              <CardContent className="space-y-2">
                {cars.map((car) => (
                  <div key={car.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div><p className="font-medium">{car.name}</p><p className="text-xs text-muted-foreground">{car.category || "Sin categoría"}</p></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCarEditor({ ...car, category: car.category || "" })}>Editar</Button>
                      <Button size="sm" variant={car.active ? "secondary" : "default"} onClick={async () => { await supabase.from("cars").update({ active: !car.active }).eq("id", car.id); await load(); }}>{car.active ? "Activo" : "Inactivo"}</Button>
                      <ConfirmDialog title="Eliminar coche" description="Esta acción no se puede deshacer." onConfirm={async () => { await supabase.from("cars").delete().eq("id", car.id); await load(); }}><Button size="sm" variant="destructive">Borrar</Button></ConfirmDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "settings" && <Card><CardContent className="p-6 text-sm text-muted-foreground">Aquí puedes añadir futuros ajustes de negocio.</CardContent></Card>}
        </main>
      </div>

      <SidePanel title="Editar reserva" open={Boolean(selectedReservation)} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        {selectedReservation && <div className="space-y-4"><div className="grid gap-2"><Label>Cliente</Label><Input value={selectedReservation.customer_name} onChange={(event) => setSelectedReservation({ ...selectedReservation, customer_name: event.target.value })} /><Input value={selectedReservation.customer_email} onChange={(event) => setSelectedReservation({ ...selectedReservation, customer_email: event.target.value })} /></div><div className="grid gap-2 md:grid-cols-2"><div><Label>Inicio</Label><Input type="date" value={selectedReservation.start_date} onChange={(event) => setSelectedReservation({ ...selectedReservation, start_date: event.target.value })} /></div><div><Label>Fin</Label><Input type="date" value={selectedReservation.end_date} onChange={(event) => setSelectedReservation({ ...selectedReservation, end_date: event.target.value })} /></div></div><Select value={selectedReservation.car_id ?? "none"} onValueChange={(value) => setSelectedReservation({ ...selectedReservation, car_id: value === "none" ? null : value })}><SelectTrigger><SelectValue placeholder="Asignar coche" /></SelectTrigger><SelectContent><SelectItem value="none">Sin coche</SelectItem>{cars.map((car) => <SelectItem key={car.id} value={car.id}>{car.name}</SelectItem>)}</SelectContent></Select><Select value={selectedReservation.status} onValueChange={(value) => setSelectedReservation({ ...selectedReservation, status: value as ReservationStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">pending</SelectItem><SelectItem value="accepted">accepted</SelectItem><SelectItem value="rejected">rejected</SelectItem><SelectItem value="cancelled">cancelled</SelectItem></SelectContent></Select><Input placeholder="Notas" value={selectedReservation.notes ?? ""} onChange={(event) => setSelectedReservation({ ...selectedReservation, notes: event.target.value })} /><div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => updateReservation(selectedReservation.id, { status: "accepted" })}>Aceptar</Button><Button variant="outline" onClick={() => updateReservation(selectedReservation.id, { status: "rejected" })}>Denegar</Button><Button variant="outline" onClick={() => updateReservation(selectedReservation.id, { status: "cancelled" })}>Cancelar</Button><Button onClick={() => updateReservation(selectedReservation.id, { customer_name: selectedReservation.customer_name, customer_email: selectedReservation.customer_email, start_date: selectedReservation.start_date, end_date: selectedReservation.end_date, car_id: selectedReservation.car_id, status: selectedReservation.status, notes: selectedReservation.notes, })}>Guardar cambios</Button></div></div>}
      </SidePanel>

      <SidePanel title={carEditor?.id === "new" ? "Nuevo coche" : "Editar coche"} open={Boolean(carEditor)} onOpenChange={(open) => !open && setCarEditor(null)}>
        {carEditor && <div className="space-y-3"><div><Label>Nombre</Label><Input value={carEditor.name} onChange={(event) => setCarEditor({ ...carEditor, name: event.target.value })} /></div><div><Label>Categoría</Label><Input value={carEditor.category} onChange={(event) => setCarEditor({ ...carEditor, category: event.target.value })} /></div><Select value={carEditor.active ? "yes" : "no"} onValueChange={(value) => setCarEditor({ ...carEditor, active: value === "yes" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Activo</SelectItem><SelectItem value="no">Inactivo</SelectItem></SelectContent></Select><Button onClick={saveCar}>Guardar coche</Button></div>}
      </SidePanel>
    </div>
  );
};

export default AdminDashboardPage;
