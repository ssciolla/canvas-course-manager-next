export class DatabaseError extends Error {
  date: Date
  public name = 'DatabaseError'

  constructor (messageEnding: string) {
    super(`An error occurred while interacting with the application database: ${messageEnding}`)
    this.date = new Date()
  }
}
