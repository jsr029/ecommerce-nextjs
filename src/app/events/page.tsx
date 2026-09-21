"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Event } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Ticket, Calendar } from "lucide-react";

const categoryLabels: Record<string, string> = {
  concert: "Concert",
  festival: "Festival",
  meetup: "Meetup",
  workshop: "Workshop",
  other: "Autre",
};

const categoryColors: Record<string, string> = {
  concert: "bg-purple-100 text-purple-700",
  festival: "bg-pink-100 text-pink-700",
  meetup: "bg-blue-100 text-blue-700",
  workshop: "bg-amber-100 text-amber-700",
  other: "bg-slate-100 text-slate-700",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // Oct 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsOnDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const filteredEvents = useMemo(() => {
    let list = events;
    if (filter !== "all") list = list.filter((e) => e.category === filter);
    if (selectedDate) {
      list = list.filter((e) => isSameDay(new Date(e.date), selectedDate));
    }
    return list.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events, filter, selectedDate]);

  // First day offset (Monday = 0)
  const startPad = (startOfMonth(currentMonth).getDay() + 6) % 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary-600" />
          Calendrier des événements
        </h1>
        <p className="text-slate-500 mt-1">
          Concerts, festivals, workshops et meetups
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-slate-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="py-1 font-normal">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dayEvents = eventsOnDay(day);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() =>
                    setSelectedDate(selected ? null : day)
                  }
                  className={`aspect-square rounded-lg text-sm relative flex flex-col items-center justify-center transition
                    ${!isSameMonth(day, currentMonth) ? "text-slate-300" : ""}
                    ${selected ? "bg-primary-600 text-white" : "hover:bg-slate-100"}
                    ${today && !selected ? "ring-2 ring-primary-400" : ""}
                  `}
                >
                  {format(day, "d")}
                  {dayEvents.length > 0 && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        selected ? "bg-white" : "bg-primary-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-3 text-xs text-primary-600 hover:underline w-full text-center"
            >
              Voir tous les événements
            </button>
          )}
        </div>

        {/* Event list */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", "concert", "festival", "workshop", "meetup"].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-normal transition ${
                  filter === c
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c === "all" ? "Tous" : categoryLabels[c]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              Aucun événement
              {selectedDate &&
                ` le ${format(selectedDate, "d MMMM yyyy", { locale: fr })}`}
              .
              <p className="text-sm mt-2">
                Lancez <code className="bg-slate-100 px-1 rounded">npm run seed</code> si la base est vide.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col sm:flex-row"
                >
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          categoryColors[event.category] || categoryColors.other
                        }`}
                      >
                        {categoryLabels[event.category] || event.category}
                      </span>
                      {event.featured && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-normal">
                          À ne pas manquer
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(event.date), "EEE d MMM yyyy · HH:mm", {
                          locale: fr,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {event.location}, {event.city}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary-700">
                        <Ticket className="w-4 h-4" />
                        {event.ticketPrice === 0
                          ? "Gratuit"
                          : `${event.ticketPrice} €`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
