
export class GameEndError extends Error {
  constructor(message: string = 'This game is end') {
    super(message);

  }
}
