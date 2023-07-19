export class PromptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromptError'
  }
}
