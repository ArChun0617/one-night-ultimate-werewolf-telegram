export class GameEndError extends Error {
  constructor(message: string = 'This game is end') {
    super(message);
    this.name = 'GameEndError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, GameEndError.prototype);
  }
}