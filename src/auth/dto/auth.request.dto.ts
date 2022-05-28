import { PickType } from '@nestjs/swagger';
import { User } from '../../models/user.schema';

export class UserRequestDto extends PickType(User, [
  'email',
  'password',
] as const) {}
