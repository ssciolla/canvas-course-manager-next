import { HttpModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { CanvasToken } from './canvas.model'
import { CanvasService } from './canvas.service'

import { UserService } from '../user/user.service'
import { getModelToken } from '@nestjs/sequelize'

const mockUserService = {
  upsertUser: jest.fn(),
  findUserByLoginId: jest.fn()
}

const mockCanvasTokenModel = {
  create: jest.fn()
}

const mockCanvasConfig = {
  instanceURL: 'https://example.instructure.edu',
  apiClientId: 'some long number',
  apiSecret: 'some long code'
}

const mockGetCanvasConfig = jest.fn().mockReturnValue(mockCanvasConfig)
const mockConfigService = { get: mockGetCanvasConfig }

describe('CanvasService', () => {
  let service: CanvasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        CanvasService,
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: getModelToken(CanvasToken),
          useValue: mockCanvasTokenModel
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    service = module.get<CanvasService>(CanvasService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
