import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './service/auth.service';
import { User, UserSchema } from '../models/user.schema';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from './auth.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
// option 2
// import * as dotenv from 'dotenv';
// dotenv.config();
// JwtModule.register({
//   secret: process.env.JWT_SECRET,
//   signOptions: { expiresIn: '1y' },
// }),

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository],
  exports: [JwtStrategy, UsersRepository],
})
export class AuthModule {}
