import { ApiProperty } from '@nestjs/swagger';
import { IMessageResponse } from '../interfaces/message-response.interface';

export class MessageResponseDto implements IMessageResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}
