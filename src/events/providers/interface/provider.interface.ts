import { CreateEventDTO } from 'src/events/dto/create-event.dto';

export interface NotificationProvider {
  fetchNotifications(userId: number): Promise<CreateEventDTO[]>;
}
