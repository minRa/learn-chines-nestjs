import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User, userReadOnly } from '../../models/user.schema';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { HttpExceptionFilter } from '../../common/exceptions/http-exception.filter';
import { SuccessInterceptor } from '../../common/interceptors/success.interceptor';
import { ReadOnlyUserDto } from '../dto/auth.dto';
import { UserRequestDto } from '../dto/auth.request.dto';
import { JwtAuthGuard } from '../jwt/jwt.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '현재 유저 가져오기' })
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getCurrentUser(@CurrentUser() user: User): userReadOnly {
    return user.readOnlyData;
  }

  @ApiOperation({ summary: '모든 유저 가져오기' })
  @UseGuards(JwtAuthGuard)
  @Get('/all')
  getAllUser(): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @ApiResponse({
    status: 500,
    description: 'Server Error...',
  })
  @ApiResponse({
    status: 200,
    description: '성공!',
    type: ReadOnlyUserDto,
  })
  @ApiOperation({ summary: '회원가입' })
  @Post('/')
  signUp(@Body() body: UserRequestDto): Promise<userReadOnly> {
    return this.authService.signUp(body);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('/login')
  logIn(@Body() data: UserRequestDto): Promise<{ token: string }> {
    return this.authService.jwtLogIn(data);
  }
}
