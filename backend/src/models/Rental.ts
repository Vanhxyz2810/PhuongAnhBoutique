import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Clothes } from './Clothes';
import { User } from './User';

export enum RentalStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export type PaymentMethod = 'cash' | 'transfer';

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

  @Column({
    type: 'varchar',
    nullable: true
  })
  identityCard: string;

  @Column({ type: 'timestamp' })
  rentDate: Date;

  @Column({ type: 'timestamp' })
  returnDate: Date;

  @Column()
  totalAmount!: number;

  @Column({
    type: 'varchar',
    enum: Object.values(RentalStatus),
    default: RentalStatus.PENDING
  })
  status!: RentalStatus;

  @Column() 
  clothesId!: string;

  @Column({ nullable: true })
  paymentQR: string;

  @Column({ nullable: true })
  bankTransactionId?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

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

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Clothes)
  @JoinColumn({ name: 'clothesId' })
  clothes!: Clothes;

  @ManyToOne(() => User, user => user.rentals)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  userId!: number;

  @Column({
    type: 'varchar',
    enum: ['cash', 'transfer'],
    default: 'transfer'
  })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'time', nullable: true })
  pickupTime!: string;

  @Column({
    type: 'boolean',
    default: false
  })
  hasFeedback: boolean;

  @Column({
    type: 'integer',
    nullable: true
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: true
  })
  feedbackMessage: string;

  @Column('simple-array', {
    nullable: true
  })
  feedbackImages: string[];

  @Column({ 
    type: 'timestamp', 
    nullable: true 
  })
  feedbackAt: Date;

  @Column('simple-json', { nullable: true })
  cccdInfo: {
    cccd: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    queQuan: string;
    noiThuongTru: string;
  } | null;
} 