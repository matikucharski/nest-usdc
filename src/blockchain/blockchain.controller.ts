import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BlockchainService } from './blockchain.service';
import { GetUSDCTransfersDto } from './dto/blockchain.input';
import { TransferInterface } from './interface/blockchain.interface';

@Controller('blockchain')
@UseInterceptors(CacheInterceptor)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('usdc-transfers/:block')
  getTransfersForUSDC(
    @Param() params: GetUSDCTransfersDto
  ): Promise<TransferInterface[]> {
    return this.blockchainService.getUSDCTransactionsForBlock(params.block);
  }
}
