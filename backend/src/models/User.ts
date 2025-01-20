import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rental } from './Rental';
import { Session } from './Session';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  phone!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({ default: 'user' })
  role!: string;

  @OneToMany(() => Rental, rental => rental.user)
  rentals!: Rental[];

  @OneToMany(() => Session, session => session.user)
  sessions!: Session[];
} 