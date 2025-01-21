import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Clothes } from './Clothes';
import { User } from './User';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderCode!: string;

  @Column()
  customerName!: string;

  @Column()
  phone!: string;

  @Column()
  identityCard!: string;

  @Column()
  rentDate!: Date;

  @Column()
  returnDate!: Date;

  @Column()
  totalAmount!: number;

  @Column({
    type: 'varchar',
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  @Column()
  clothesId!: string;

  @Column({ nullable: true })
  paymentQR: string;

  @Column({ nullable: true })
  bankTransactionId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;

  @Column({ nullable: true })
  pendingExpireAt: Date;

  @Column({ nullable: true })
  paymentUrl: string;

  @Column({ nullable: true })
  expireAt: Date;

  @ManyToOne(() => Clothes)
  @JoinColumn({ name: 'clothesId' })
  clothes!: Clothes;

  @ManyToOne(() => User, user => user.rentals)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  userId!: number;
} 