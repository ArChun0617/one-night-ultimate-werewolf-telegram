
export const Clock = {
  getRandomDelay: (): number => {
    return ((Math.random() * 2.5) + 5) * 1000;
  }
};
