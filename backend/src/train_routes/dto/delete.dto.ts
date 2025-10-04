import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteDto {
  @ApiProperty({
    description: 'Train route unique identifier to delete',
    example: 'uuid',
    format: 'uuid',
  })
  @IsString()
  id: string;
}
