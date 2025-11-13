import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { CreateEventDTO } from './dto/create-event.dto';
import { plainToInstance } from 'class-transformer';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllEvents(): Promise<CreateEventDTO[]> {
    const events = await this.eventService.getAllEvents();
    return plainToInstance(CreateEventDTO, events, {
      excludeExtraneousValues: true
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getEventById(@Param('id') id: number): Promise<CreateEventDTO> {
    const event = await this.eventService.getEventById(id);
    return plainToInstance(CreateEventDTO, event, {
      excludeExtraneousValues: true
    });
  }

  @Get('source/:source')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getEventsBySource(
    @Param('source') source: string
  ): Promise<CreateEventDTO[]> {
    const events = await this.eventService.getEventsBySource(source);
    return plainToInstance(CreateEventDTO, events, {
      excludeExtraneousValues: true
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: number): Promise<void> {
    await this.eventService.deleteEvent(id);
  }
}
