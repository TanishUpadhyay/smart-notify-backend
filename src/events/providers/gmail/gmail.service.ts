import { Injectable } from '@nestjs/common';
import { NotificationProvider } from '../interface/provider.interface';
import { GmailClient } from './gmail.client';
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { CreateEventDTO } from 'src/events/dto/create-event.dto';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class GmailService implements NotificationProvider {
  constructor(
    private gmailClient: GmailClient,
    private userService: UsersService,
    private tokensService: TokensService,
    private evntsService: EventsService
  ) {}

  async fetchNotifications(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!user) return [];
    const token = await this.tokensService.getValidToken(user, 'google');
    if (!token) return [];

    if (!token.refreshToken) return [];

    const messages = await this.gmailClient.listMessages(token.refreshToken);

    const detailedMessages: CreateEventDTO[] = [];

    for (const msg of messages) {
      const full = await this.gmailClient.getMessage(
        token.refreshToken,
        msg.id || ''
      );

      const headers = full.payload?.headers;
      const subject = headers?.find((h) => h.name === 'Subject')?.value;
      //const date = headers?.find((h) => h.name === 'Date')?.value;
      //const from = headers?.find((h) => h.name === 'From')?.value;

      detailedMessages.push({
        userId: userId.toString(),
        providerMessageId: msg.id || '',
        source: 'gmail',
        title: subject || '(No Subject)',
        //content: from || '(Unknown Sender)',
        link: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
        eventDate: msg.internalDate
          ? new Date(parseInt(msg.internalDate))
          : new Date(),
        content: full.payload?.body?.data || ''
      });
    }

    await this.evntsService.saveEvents(detailedMessages, userId.toString());

    return detailedMessages;
  }
}
