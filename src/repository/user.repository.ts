
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository.js';
import { User } from '../models/user.model.js';



@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    userModel: Model<User>,
  ) {
    super(userModel);
  }

  // FIND BY EMAIL
  findByEmail(email: string) {
    return this.findOne({ email });
  }

  // FIND BY USERNAME
  findByUsername(username: string) {
    return this.findOne({ username });
  }

  // FIND BY EMAIL WITH PASSWORD
  findByEmailWithPassword(email: string) {
    return this.model
      .findOne({ email })
      .select('+password')
      .exec();
  }

  // CHECK EMAIL EXISTS
  async emailExists(email: string): Promise<boolean> {
    return !!(await this.findByEmail(email));
  }

  // CHECK USERNAME EXISTS
  async usernameExists(username: string): Promise<boolean> {
    return !!(await this.findByUsername(username));
  }
}
