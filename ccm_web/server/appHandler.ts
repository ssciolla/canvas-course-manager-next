import path from 'path'

import type { Express, Request, Response, Router } from 'express'
import { IdToken, Provider } from 'ltijs'
import Database from 'ltijs-sequelize'

import { Config } from './config'

interface DevOptions {
  isDev: true
}

interface ProdOptions {
  isDev: false
  staticPath: string
}

class AppHandler {
  private readonly config: Config
  private readonly apiRouter: Router
  private readonly envOptions: DevOptions | ProdOptions

  constructor (
    config: Config,
    envOptions: DevOptions | ProdOptions,
    apiRouter: Router
  ) {
    this.config = config
    this.envOptions = envOptions
    this.apiRouter = apiRouter
  }

  // ltijs docs: https://cvmcosta.me/ltijs/#/
  async setupLTI (): Promise<Express> {
    const { server, db, lti } = this.config

    const dbPlugin = new Database(
      db.name,
      db.user,
      db.password,
      { host: db.host, dialect: 'postgres', logging: false }
    )

    let devMode
    let staticPath
    const cookieOptions = { secure: true, sameSite: 'None' }
    if (this.envOptions.isDev) {
      // Setting devMode to true because cookies seem to be lost during proxy?
      devMode = true
    } else {
      staticPath = this.envOptions.staticPath
    }

    const provider = Provider.setup(
      lti.encryptionKey, // Key used to sign cookies and tokens
      { plugin: dbPlugin },
      {
        // Reserved routes
        appRoute: '/',
        loginRoute: '/login',
        keysetRoute: '/keys',
        // Set secure to true if the testing platform is in a different domain and https is being used
        // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
        cookies: cookieOptions,
        staticPath,
        devMode
      }
    )

    provider.app.use('/api', this.apiRouter)

    // Set lti launch callback
    // When receiving successful LTI launch redirects to app.
    provider.onConnect(async (token: IdToken, req: Request, res: Response) => {
      console.log(token)
      if (!this.envOptions.isDev) {
        return res.sendFile(path.join(this.envOptions.staticPath, 'index.html'))
      }
      return provider.redirect(res, `http://localhost:${server.clientPort}`)
    })

    await provider.deploy({ port: server.port })

    await provider.registerPlatform({
      name: lti.platformURL,
      url: lti.platformURL,
      clientId: lti.clientID,
      authenticationEndpoint: lti.platformURL + lti.authEnding,
      accesstokenEndpoint: lti.platformURL + lti.tokenEnding,
      authConfig: {
        method: 'JWK_SET', key: lti.platformURL + lti.keysetEnding
      }
    })
    return provider.app
  }

  startApp (): void {
    console.log('Starting ltijs server...')
    this.setupLTI()
      .then(() => console.log('LTI application setup has completed.'))
      .catch((r) => {
        throw Error(`LTI code failed to initialize app: ${String(r)}`)
      })
  }
}

export default AppHandler
