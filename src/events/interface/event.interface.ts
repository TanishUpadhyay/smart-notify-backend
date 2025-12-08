import { EventEntity } from '../entity/event.entity';

//crud operations for events will be defined here
export interface IEventService {
  //createEvent(eventData: CreateEventDTO): Promise<EventEntity>;
  getEventById(eventId: string): Promise<EventEntity>;
  getAllEvents(): Promise<EventEntity[]>;
  getEventsBySource(source: string): Promise<EventEntity[]>;
  markEventAsRead(eventId: string): Promise<EventEntity>;
  deleteEvent(eventId: string): Promise<void>;
  saveEvents(events: EventEntity[], userId: string): Promise<void>;
}
