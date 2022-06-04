import { IncrementalMap } from "./main";

describe('inc map', () => {
  it('should preserve snapshots in memory', () => {
    const map = new IncrementalMap();
    map.snapshot(0);
    map.set('key', 10);
    map.snapshot(1);
    map.set('key', 20);

    const valueAtSecondSnapshot = map.get('key');
    map.snapshot(0);
    const valueAtFirstSnapshot =  map.get('key');
    
    expect(valueAtFirstSnapshot).toBe(10);
    expect(valueAtSecondSnapshot).toBe(20);
  })
})