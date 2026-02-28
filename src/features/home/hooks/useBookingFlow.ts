import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { ChangeEvent, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { BookingFormValues, Vehicle } from "@/features/home/types/home";

export interface BookingFlowState {
  dateRange: DateRange | undefined;
  selectedCar: Vehicle | null;
  customerDetails: BookingFormValues;
}

const initialDetails: BookingFormValues = {
  name: "",
  contact: "",
  notes: "",
};

export const useBookingFlow = () => {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [customerDetails, setCustomerDetails] = useState<BookingFormValues>(initialDetails);

  const normalizedRange = useMemo(() => {
    if (!dateRange?.from) {
      return null;
    }

    const startDate = startOfDay(dateRange.from);
    const effectiveTo = dateRange.to ?? dateRange.from;
    const endDate = startOfDay(addDays(effectiveTo, 1));
    const totalDays = differenceInCalendarDays(endDate, startDate);

    if (totalDays <= 0) {
      return null;
    }

    return { startDate, endDate, totalDays };
  }, [dateRange]);

  const totalPrice = useMemo(() => {
    if (!selectedCar || !normalizedRange) {
      return 0;
    }

    return Number((normalizedRange.totalDays * selectedCar.dailyRentPrice).toFixed(2));
  }, [normalizedRange, selectedCar]);

  const onCustomerFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCustomerDetails((current) => ({ ...current, [name]: value }));
  };

  const resetFlow = () => {
    setDateRange(undefined);
    setSelectedCar(null);
    setCustomerDetails(initialDetails);
  };

  return {
    state: {
      dateRange,
      selectedCar,
      customerDetails,
    } satisfies BookingFlowState,
    setDateRange,
    setSelectedCar,
    setCustomerDetails,
    onCustomerFieldChange,
    normalizedRange,
    totalPrice,
    resetFlow,
  };
};
