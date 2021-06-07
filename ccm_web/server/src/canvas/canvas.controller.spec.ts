import { Test, TestingModule } from '@nestjs/testing'

import { CanvasController } from './canvas.controller'
import { CanvasService } from './canvas.service'

const mockCanvasService = {
  getAuthURL: jest.fn(),
  createTokenForUser: jest.fn(),
  findToken: jest.fn()
}

describe('CanvasController', () => {
  let controller: CanvasController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CanvasService,
          useValue: mockCanvasService
        }
      ],
      controllers: [CanvasController]
    }).compile()

    controller = module.get<CanvasController>(CanvasController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
