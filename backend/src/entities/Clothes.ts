import { Entity, OneToMany } from "typeorm";
import { Rental } from "../models/Rental";

@Entity()
export class Clothes {
  // ... other fields

  @OneToMany(() => Rental, rental => rental.clothes)
  rentals: Rental[];
} 