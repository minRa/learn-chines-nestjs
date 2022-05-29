import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, userReadOnly } from '../models/user.schema';
import { UserRequestDto } from './dto/auth.request.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    // const CommentsModel = mongoose.model('comments', CommentsSchema);

    const result = await this.userModel.find();
    //   .populate('comments', CommentsModel);

    return result;
  }

  async findByIdAndUpdateImg(
    id: string,
    fileName: string,
  ): Promise<userReadOnly> {
    const user = await this.userModel.findById(id);

    user.imgUrl = `http://localhost:8000/media/${fileName}`;

    const newUser = await user.save();

    return newUser.readOnlyData;
  }

  async findUserByIdWithoutPassword(
    userId: string | Types.ObjectId,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }

  async finduserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async existsByEmail(email: string): Promise<any> {
    const result = await this.userModel.exists({ email });
    return result;
  }

  async create(user: UserRequestDto): Promise<User> {
    return await this.userModel.create(user);
  }
}
