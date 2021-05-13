import { ExtractJwt, Strategy } from 'passport-jwt'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('lti.encryptionKey') as string
    })
  }

  async validate (payload: any): Promise<any> {
    console.log('payload')
    console.log(payload)
    console.log(payload.user)
    return {}
  }
}
