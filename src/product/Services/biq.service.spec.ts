import { Test, TestingModule } from '@nestjs/testing';
import { BiqService } from './biq.service';

describe('BiqService', () => {
  let service: BiqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiqService],
    }).compile();

    service = module.get<BiqService>(BiqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
