import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Rental } from "./Rental";

export type ClothesStatus = 'available' | 'pending' | 'rented' | 'maintenance';

@Entity()
export class Clothes {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  ownerName!: string;

  @Column({ type: 'float' })
  rentalPrice!: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description!: string;

  @Column({ type: 'varchar' })
  image!: string;

  @Column({
    type: 'varchar',
    default: 'available'
  })
  status!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(() => Rental, rental => rental.clothes)
  rentals!: Rental[];
} 