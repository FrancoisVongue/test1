/*
  WHY we make snapshot right after we created an empty map 
  and then we have value inside key (below)?
  we should not get any value
*/
export class IncrementalMap<T = number> {
  private store: Map<string, T>[] = [];
  private currentState: Map<string, T> = new Map();

  constructor() {}

  snapshot(n: number) {
    if(this.store[n]) {
      this.currentState = this.store[n];
    } else {
      this.store[n] = new Map(this.currentState);
      this.currentState = this.store[n];
    }
  }

  set(key: string, v: T) {
    this.currentState.set(key, v);
  }

  get(key: string): T {
    return this.currentState.get(key)!;
  }
}