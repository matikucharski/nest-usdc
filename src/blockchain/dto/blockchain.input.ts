import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUSDCTransfersDto {
  // define transform here for each DTO or globally via enableImplicitConversion of transformOptions in ValidationPipe
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Block number must be a number' }
  )
  @IsInt({ message: 'Block number must be an integer' })
  @Min(1, { message: 'Block number must be greater than 0' })
  block: number;
}
