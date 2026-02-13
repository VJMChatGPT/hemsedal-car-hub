import { Badge } from "@/components/ui/badge";

const statusMap = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

export const BadgeStatus = ({ status }: { status: keyof typeof statusMap }) => (
  <Badge variant="outline" className={statusMap[status]}>
    {status}
  </Badge>
);
