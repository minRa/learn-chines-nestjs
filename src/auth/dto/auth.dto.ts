import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../../models/user.schema';

export class ReadOnlyUserDto extends PickType(User, [
  'email',
  'name',
  'password',
] as const) {
  @ApiProperty({
    example: '3280199',
    description: 'id',
  })
  id: string;
}
