// src/tokens/token.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from 'src/users/entity/user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @Column()
  provider: string; // 'google' | 'github' | 'gmail' | etc.

  @Column()
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;
}
