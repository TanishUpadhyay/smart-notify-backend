/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IEventService } from './interface/event.interface';
import { EventEntity } from './entity/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectLogger } from 'src/common/Logger';
import { Logger } from 'winston';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService implements IEventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectLogger() private readonly logger: Logger
  ) {}

  async getEventById(eventId: number): Promise<EventEntity> {
    try {
      const event = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.id = :id', { id: eventId })
        .getOne();
      if (!event) {
        this.logger.warn(`Event with ID ${eventId} not found.`);
        throw new InternalServerErrorException('Event not found');
      }
      return event;
    } catch (error) {
      this.logger.error(
        `Error fetching event by ID ${eventId}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error fetching event');
    }
  }

  async getAllEvents(): Promise<EventEntity[]> {
    try {
      const events = await this.eventRepository
        .createQueryBuilder('event')
        .getMany();
      return events;
    } catch (error) {
      this.logger.error(
        `Error fetching all events: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error fetching events');
    }
  }

  async getEventsBySource(source: string): Promise<EventEntity[]> {
    try {
      const events = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.source = :source', { source })
        .getMany();
      return events;
    } catch (error) {
      this.logger.error(
        `Error fetching events by source ${source}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error fetching events');
    }
  }

  async markEventAsRead(eventId: number): Promise<EventEntity> {
    try {
      const event = await this.getEventById(eventId);
      event.isRead = true;
      return await this.eventRepository.save(event);
    } catch (error) {
      this.logger.error(
        `Error marking event ID ${eventId} as read: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error updating event');
    }
  }

  async deleteEvent(eventId: number): Promise<void> {
    try {
      const event = await this.getEventById(eventId);
      event.isDeleted = true;
      await this.eventRepository.save(event);
    } catch (error) {
      this.logger.error(
        `Error deleting event ID ${eventId}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error deleting event');
    }
  }
}
