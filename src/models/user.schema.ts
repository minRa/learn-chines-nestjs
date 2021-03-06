// import { Comments } from '../comments/comments.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as t from '../utils/io-ts-ext';

const options: SchemaOptions = {
  timestamps: true,
};

export const userReadOnly = t.type({
  id: t.string,
  email: t.string,
  name: t.string,
  imgUrl: t.string,
});
export type userReadOnly = t.TypeOf<typeof userReadOnly>;

export const UserType = t.type({
  email: t.string,
  name: t.string,
  password: t.string,
  imgUrl: t.string,
  readOnlyData: userReadOnly,
});
export type UserType = t.TypeOf<typeof UserType>;

@Schema(options)
export class User extends Document {
  @ApiProperty({
    example: 'amamov@kakao.com',
    description: 'email',
    required: true,
  })
  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'amamov',
    description: 'name',
    required: true,
  })
  @Prop({
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '23810',
    description: 'password',
    required: true,
  })
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Prop({
    default:
      'https://github.com/amamov/NestJS-solid-restapi-boilerplate/raw/main/docs/images/1.jpeg',
  })
  @IsString()
  imgUrl: string;

  readonly readOnlyData: userReadOnly;

  //   readonly comments: Comments[];
}

const _UserSchema = SchemaFactory.createForClass<UserType>(User);

_UserSchema.virtual('readOnlyData').get(function (this: User) {
  return {
    id: this.id,
    email: this.email,
    name: this.name,
    imgUrl: this.imgUrl,
    // comments: this.comments,
  };
});

// _CatSchema.virtual('comments', {
//   ref: 'comments',
//   localField: '_id',
//   foreignField: 'info',
// });
// _CatSchema.set('toObject', { virtuals: true });
// _CatSchema.set('toJSON', { virtuals: true });

export const UserSchema = _UserSchema;
