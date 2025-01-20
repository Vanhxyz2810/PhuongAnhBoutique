import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  token!: string;

  @ManyToOne(() => User, user => user.sessions)
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  expiresAt!: Date;

  @Column({ default: true })
  isValid!: boolean;
} 