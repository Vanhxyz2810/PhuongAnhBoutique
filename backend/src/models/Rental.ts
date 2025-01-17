import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm';
import { Clothes } from './Clothes';

@Entity()
export class Rental extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerName!: string;

  @Column()
  identityCard!: string;

  @Column('simple-array')
  clothesIds!: string[];

  @Column('simple-array')
  quantities!: number[];

  @Column()
  rentDate!: Date;

  @Column()
  returnDate!: Date;

  @Column()
  totalAmount!: number;

  @Column()
  isPaid!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
} 