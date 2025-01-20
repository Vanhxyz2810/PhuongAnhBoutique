import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ClothesStatus = 'available' | 'pending' | 'rented' | 'maintenance';

@Entity()
export class Clothes {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  ownerName!: string;

  @Column()
  rentalPrice!: number;

  @Column({
    type: 'varchar',
    default: 'available'
  })
  status!: ClothesStatus;

  @Column()
  image!: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 