import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeStepProps {
  dateRange: DateRange | undefined;
  summary: string;
  canContinue: boolean;
  onDateChange: (range: DateRange | undefined) => void;
  onNext: () => void;
}

export const DateRangeStep = ({ dateRange, summary, canContinue, onDateChange, onNext }: DateRangeStepProps) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        <CalendarIcon className="w-4 h-4 inline mr-2" />
        Rango de fechas *
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal bg-background", !dateRange?.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from
              ? dateRange.to
                ? `${format(dateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: es })}`
                : format(dateRange.from, "dd/MM/yyyy", { locale: es })
              : "Selecciona inicio y fin"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateChange}
            numberOfMonths={2}
            disabled={(currentDate) => currentDate < startOfDay(new Date())}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>

    {summary ? <p className="text-sm text-muted-foreground">{summary}</p> : null}

    <Button type="button" onClick={onNext} disabled={!canContinue} className="w-full">
      Continuar a selección de coche
    </Button>
  </div>
);
