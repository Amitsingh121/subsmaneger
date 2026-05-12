"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { cn } from "./utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
  /** Not used — kept for API compat */
  showOutsideDays?: boolean;
  classNames?: Record<string, string>;
}

function Calendar({
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const [viewDate, setViewDate] = React.useState<Date>(
    selected ?? new Date()
  );

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleSelect = (day: Date) => {
    if (disabled?.(day)) return;
    if (selected && isSameDay(day, selected)) {
      onSelect?.(undefined);
    } else {
      onSelect?.(day);
    }
  };

  return (
    <div className={cn("p-3 select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-medium text-foreground">
          {format(viewDate, "MMMM yyyy")}
        </span>

        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="h-8 flex items-center justify-center text-[0.75rem] font-normal text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewDate);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isDisabled = disabled?.(day) ?? false;
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(day)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-md text-sm transition-colors",
                // outside current month
                !isCurrentMonth && "text-muted-foreground opacity-40",
                // today highlight
                isTodayDate && !isSelected && "bg-accent text-accent-foreground font-semibold",
                // selected
                isSelected &&
                  "bg-primary text-primary-foreground font-semibold hover:bg-primary",
                // normal hover
                !isSelected && !isDisabled && isCurrentMonth &&
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                // disabled
                isDisabled && "opacity-30 cursor-not-allowed pointer-events-none",
              )}
              aria-label={format(day, "PPP")}
              aria-pressed={isSelected}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
