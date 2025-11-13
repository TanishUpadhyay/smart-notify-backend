import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

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
}
