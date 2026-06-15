// Centralized age management system to reduce timer overhead
class AgeManager {
  private interval: NodeJS.Timeout | null = null;
  private currentAges: Map<string, number> = new Map();

  constructor() {
    this.startAgeTimer();
  }

  private startAgeTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Single 1-second interval for all age updates
    this.interval = setInterval(() => {
      this.currentAges.forEach((age, playerId) => {
        const newAge = age + 1;
        this.currentAges.set(playerId, newAge);
      });
    }, 1000);
  }

  // Register a player for age updates
  registerPlayer(playerId: string, initialAge: number) {
    this.currentAges.set(playerId, initialAge);
  }

  // Update a player's age (from server)
  updatePlayerAge(playerId: string, age: number) {
    this.currentAges.set(playerId, age);
  }

  // Get current age for a player
  getPlayerAge(playerId: string): number {
    return this.currentAges.get(playerId) || 0;
  }

  // Unregister a player
  unregisterPlayer(playerId: string) {
    this.currentAges.delete(playerId);
  }

  // Cleanup
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.currentAges.clear();
  }
}

export const ageManager = new AgeManager();
