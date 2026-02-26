import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, EventLog } from 'ethers';
import { TransferInterface } from './interface/blockchain.interface';
import { isEventLogWithArgs } from './utils';

const USDC_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

@Injectable()
export class BlockchainService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly usdc: ethers.Contract;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('blockchain.rpcUrl')!;
    console.log(rpcUrl);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.usdc = new ethers.Contract(
      this.configService.get<string>('blockchain.usdcAddress')!,
      USDC_ABI,
      this.provider
    );
  }

  async getUSDCTransactionsForBlock(
    blockNumber: number
  ): Promise<TransferInterface[]> {
    if (blockNumber < 6307510) {
      return [];
    }
    // const bn = await this.provider.getBlockNumber();

    // provider.getLogs( returns raw data
    // const logs = await this.provider.getLogs({
    //   address: this.configService.get<string>('blockchain.usdcAddress'),
    //   fromBlock: blockNumber,
    //   toBlock: blockNumber
    // });

    // parsed logs with abi
    const events = await this.usdc.queryFilter(
      'Transfer',
      blockNumber,
      blockNumber
    );

    const validEvents = events.filter(isEventLogWithArgs); // filter out invalid events
    return validEvents.map((event: EventLog) => ({
      txHash: event.transactionHash,
      from: event.args.from as string,
      to: event.args.to as string,
      value: (event.args.value as bigint).toString()
    }));
  }
}
