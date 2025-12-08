import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class GmailClient {
  private getOAuthClient(refreshToken: string) {
    const client: OAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({ refresh_token: refreshToken });
    return client;
  }

  async listMessages(refreshToken: string) {
    const auth = this.getOAuthClient(refreshToken);
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20
    });

    return response.data.messages || [];
  }

  async getMessage(refreshToken: string, id: string) {
    const auth = this.getOAuthClient(refreshToken);
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id
    });

    return response.data;
  }
}
