import { AnimatePresence, motion } from "framer-motion";
import { events } from "../../../lib/data/sampleData";
import EventForm from "../form/EventForm";
import EventCard from "./EventCard";
import type { AppEvent } from "../../../lib/types";
import { useEffect, useState } from "react";

type Props = {
  formOpen: boolean;
  setFormOpen: (isOpen: boolean) => void;
  formToggle: (event: AppEvent | null) => void;
  selectedEvent: AppEvent | null;
};

export default function EventDashboard({ formOpen, setFormOpen, formToggle, selectedEvent }: Props) {
  const [appEvents, setAppEvents] = useState<AppEvent[]>([]);


  const handleCreateEvent = (event: AppEvent) => {
    setAppEvents(prev => [...prev, event]);
  };

  const handleUpdateEvent = (updatedEvent: AppEvent) => {
    setAppEvents(prevState => {
      return prevState.map(event => event.id === updatedEvent.id ? updatedEvent : event);
    });
  }

  const handleDeleteEvent = (eventId: string) => {
    setAppEvents(prevState => prevState.filter(event => event.id !== eventId));
  };

  useEffect(() => {
    setAppEvents(events);
  }, []);

  return (
    <div className="flex flex-row w-full gap-6">
      <div className="w-3/5">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-4">
              {appEvents.map(event => (
                <EventCard
                  formToggle={formToggle}
                  deleteEvent={handleDeleteEvent}
                  key={event.id}
                  event={event} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-2/5 overflow-hidden">
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <EventForm
                key={selectedEvent ? selectedEvent.id : 'new'}
                setFormOpen={setFormOpen}
                createEvent={handleCreateEvent}
                selectedEvent={selectedEvent ?? undefined}
                updateEvent={handleUpdateEvent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
