import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { TransferInterface } from './interface/blockchain.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('BlockchainController', () => {
  let controller: BlockchainController;
  // let blockchainService: BlockchainService;

  const mockBlockchainService = {
    getUSDCTransactionsForBlock: jest.fn()
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager }
      ]
    }).compile();

    controller = module.get<BlockchainController>(BlockchainController);
    // blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransfersForUSDC', () => {
    it('should call blockchainService.getUSDCTransactionsForBlock with correct block number', async () => {
      mockBlockchainService.getUSDCTransactionsForBlock.mockResolvedValue([]);

      await controller.getTransfersForUSDC({ block: 20000000 });

      expect(
        mockBlockchainService.getUSDCTransactionsForBlock
      ).toHaveBeenCalledWith(20000000);
    });

    it('should return the result from the service', async () => {
      const mockTransfers: TransferInterface[] = [
        {
          txHash: '0xabc123',
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          value: '1000000'
        }
      ];
      mockBlockchainService.getUSDCTransactionsForBlock.mockResolvedValue(
        mockTransfers
      );

      const result = await controller.getTransfersForUSDC({
        block: 20000000
      });

      expect(result).toEqual(mockTransfers);
    });

    it('should return empty array when service returns no transfers', async () => {
      mockBlockchainService.getUSDCTransactionsForBlock.mockResolvedValue([]);

      const result = await controller.getTransfersForUSDC({
        block: 1000
      });

      expect(result).toEqual([]);
    });

    it('should return multiple transfers when service returns them', async () => {
      const mockTransfers: TransferInterface[] = [
        {
          txHash: '0xabc',
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          value: '500000'
        },
        {
          txHash: '0xdef',
          from: '0x3333333333333333333333333333333333333333',
          to: '0x4444444444444444444444444444444444444444',
          value: '750000'
        }
      ];
      mockBlockchainService.getUSDCTransactionsForBlock.mockResolvedValue(
        mockTransfers
      );

      const result = await controller.getTransfersForUSDC({
        block: 20000000
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockTransfers);
    });

    it('should propagate service errors', async () => {
      mockBlockchainService.getUSDCTransactionsForBlock.mockRejectedValue(
        new Error('Service error')
      );

      await expect(
        controller.getTransfersForUSDC({ block: 20000000 })
      ).rejects.toThrow('Service error');
    });
  });
});
