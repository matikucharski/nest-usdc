import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { TransferInterface } from './interface/blockchain.interface';

const TRANSFER_IFACE = new ethers.Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]);
const TRANSFER_TOPIC = TRANSFER_IFACE.getEvent('Transfer')!.topicHash;

@Injectable()
export class BlockchainService {
  private readonly provider: ethers.JsonRpcProvider;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('blockchain.rpcUrl')!;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getUSDCTransactionsForBlock(
    blockNumber: number
  ): Promise<TransferInterface[]> {
    if (blockNumber < 6307510) {
      return [];
    }

    // raw logs
    const logs = await this.provider.getLogs({
      address: this.configService.get<string>('blockchain.usdcAddress'),
      topics: [TRANSFER_TOPIC],
      fromBlock: blockNumber,
      toBlock: blockNumber
    });

    const results: TransferInterface[] = [];
    for (const log of logs) {
      try {
        const decoded = TRANSFER_IFACE.decodeEventLog(
          'Transfer',
          log.data,
          log.topics
        );
        results.push({
          txHash: log.transactionHash,
          from: decoded.from as string,
          to: decoded.to as string,
          value: (decoded.value as bigint).toString()
        });
      } catch {
        // skip malformed logs - maybe log some info or count number of malformed logs
      }
    }

    return results;
  }
}
