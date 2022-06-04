const task = async <T>(value: T) => {
    await new Promise((r) => setTimeout(r, 100 * Math.random()));
    console.log(value);
};


type AsyncFn = (...args: any[]) => Promise<any>;

class Queue {
  constructor(
    private aQ: Promise<any> = Promise.resolve()
  ){}

  add(t: AsyncFn) {
    this.aQ = this.aQ.then(t);
    return this.aQ;
  }
}

const queue = new Queue();

Promise.all([
    task(1),
    task(2),
    task(3),
    task(4),
])
.then(async v => {
  await Promise.all([
      queue.add(() => task(1)),
      queue.add(() => task(2)),
      queue.add(() => task(3)),
      queue.add(() => task(4)),
  ]);
}).then(_ => {
  console.log('finish');
})