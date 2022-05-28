import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../auth.repository';
import { UserRequestDto } from '../dto/auth.request.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(body: UserRequestDto) {
    const { email, password } = body;
    const isCatExist = await this.userRepository.existsByEmail(email);
    if (isCatExist) {
      throw new UnauthorizedException('this user already e');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
    });

    return user.readOnlyData;
  }

  async jwtLogIn(data: UserRequestDto) {
    const { email, password } = data;

    //* 해당하는 email이 있는지
    const user = await this.userRepository.finduserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    //* password가 일치한지
    const isPasswordValidated: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValidated) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    const payload = { email: email, sub: user.id };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
