import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  password: string; // hashed password
  name: string;
  createdAt: Date;
}

@Injectable()
export class UserRepository {
  // In-Memory storage
  private users: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const hashedPassword = this.hashPassword(data.password);

    const user: User = {
      id,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: new Date(),
    };

    this.users.set(id, user);
    return user;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.hashPassword(plainPassword) === hashedPassword;
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Helper method to get all users (for debugging)
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
