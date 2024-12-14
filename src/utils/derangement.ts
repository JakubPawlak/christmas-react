export function generateDerangement(participants: string[]): string[] {
    const n = participants.length;
    const indices = Array.from({ length: n }, (_, i) => i);
  
    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  
    let derangement: number[];
    do {
      derangement = shuffle(indices);
    } while (derangement.some((d, i) => d === i));
  
    return derangement.map(i => participants[i]);
  }
  