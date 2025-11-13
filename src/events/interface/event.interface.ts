import { EventEntity } from '../entity/event.entity';

//crud operations for events will be defined here
export interface IEventService {
  //createEvent(eventData: CreateEventDTO): Promise<EventEntity>;
  getEventById(eventId: number): Promise<EventEntity>;
  getAllEvents(): Promise<EventEntity[]>;
  getEventsBySource(source: string): Promise<EventEntity[]>;
  markEventAsRead(eventId: number): Promise<EventEntity>;
  deleteEvent(eventId: number): Promise<void>;
}
