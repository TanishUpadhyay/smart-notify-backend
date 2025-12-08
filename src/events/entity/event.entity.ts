import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  source: string; // e.g., "gmail","github" etc.

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  link?: string;

  @Column({ type: 'boolean', nullable: true })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  eventDate: Date;

  @Column({ type: 'text' })
  content: string;

  @Column()
  userId: string; // whose event is this

  @Column()
  providerMessageId: string; // unique ID from Gmail/GitHub etc.

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
