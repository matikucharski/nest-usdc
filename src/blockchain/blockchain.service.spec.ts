import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ethers } from 'ethers';

interface MockProviderInterface {
  getLogs: jest.Mock;
}
// Mock ethers at module level
jest.mock('ethers', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('ethers');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ethers: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...actual.ethers,
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getLogs: jest.fn()
      })),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      Interface: actual.ethers.Interface
    }
  };
});

describe('BlockchainService', () => {
  let service: BlockchainService;
  let mockProvider: MockProviderInterface;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'blockchain.rpcUrl': 'https://mock-rpc-url.com',
        'blockchain.usdcAddress': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      };
      return config[key];
    })
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);

    // Access the mocked provider instance
    mockProvider = service.provider as unknown as MockProviderInterface;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUSDCTransactionsForBlock', () => {
    it('should return empty array for blocks before USDC deployment (< 6307510)', async () => {
      const result = await service.getUSDCTransactionsForBlock(1000);
      expect(result).toEqual([]);
      expect(mockProvider.getLogs).not.toHaveBeenCalled();
    });

    it('should return empty array for block 0', async () => {
      const result = await service.getUSDCTransactionsForBlock(0);
      expect(result).toEqual([]);
    });

    it('should call provider.getLogs for blocks >= 6307510', async () => {
      mockProvider.getLogs.mockResolvedValue([]);
      const blockNumber = 6307510;

      await service.getUSDCTransactionsForBlock(blockNumber);

      expect(mockProvider.getLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          fromBlock: blockNumber,
          toBlock: blockNumber
        })
      );
    });

    it('should return empty array when no logs are found', async () => {
      mockProvider.getLogs.mockResolvedValue([]);

      const result = await service.getUSDCTransactionsForBlock(20000000);
      expect(result).toEqual([]);
    });

    it('should decode Transfer logs and return transfer data', async () => {
      const iface = new ethers.Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ]);
      const encodedFrom = '0x1111111111111111111111111111111111111111';
      const encodedTo = '0x2222222222222222222222222222222222222222';
      const encodedValue = 1000000n;
      const txHash = '0xabc123';

      const encoded = iface.encodeEventLog('Transfer', [
        encodedFrom,
        encodedTo,
        encodedValue
      ]);

      mockProvider.getLogs.mockResolvedValue([
        {
          transactionHash: txHash,
          data: encoded.data,
          topics: encoded.topics
        }
      ]);

      const result = await service.getUSDCTransactionsForBlock(20000000);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        txHash: txHash,
        from: encodedFrom,
        to: encodedTo,
        value: encodedValue.toString()
      });
    });

    it('should handle multiple transfer logs', async () => {
      const iface = new ethers.Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ]);

      const encoded1 = iface.encodeEventLog('Transfer', [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
        500000n
      ]);
      const encoded2 = iface.encodeEventLog('Transfer', [
        '0x3333333333333333333333333333333333333333',
        '0x4444444444444444444444444444444444444444',
        750000n
      ]);

      mockProvider.getLogs.mockResolvedValue([
        {
          transactionHash: '0xabc',
          data: encoded1.data,
          topics: encoded1.topics
        },
        {
          transactionHash: '0xdef',
          data: encoded2.data,
          topics: encoded2.topics
        }
      ]);

      const result = await service.getUSDCTransactionsForBlock(20000000);

      expect(result).toHaveLength(2);
      expect(result[0].txHash).toBe('0xabc');
      expect(result[0].value).toBe('500000');
      expect(result[1].txHash).toBe('0xdef');
      expect(result[1].value).toBe('750000');
    });

    it('should skip malformed logs without throwing', async () => {
      const iface = new ethers.Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ]);
      const validEncoded = iface.encodeEventLog('Transfer', [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
        100n
      ]);

      mockProvider.getLogs.mockResolvedValue([
        {
          transactionHash: '0xbad',
          data: '0xdeadbeef',
          topics: ['0xbadtopic']
        },
        {
          transactionHash: '0xgood',
          data: validEncoded.data,
          topics: validEncoded.topics
        }
      ]);

      const result = await service.getUSDCTransactionsForBlock(20000000);

      expect(result).toHaveLength(1);
      expect(result[0].txHash).toBe('0xgood');
    });

    it('should propagate provider errors', async () => {
      mockProvider.getLogs.mockRejectedValue(new Error('RPC error'));

      await expect(
        service.getUSDCTransactionsForBlock(20000000)
      ).rejects.toThrow('RPC error');
    });
  });
});
