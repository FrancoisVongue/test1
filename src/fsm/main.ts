type SimpleProces = {
  type: 'step',
  run: (...args: any[]) => Promise<any>
}
type SuccessiveProcess = {
  type: 'successively',
  children: Process[]
}
type ParallelProcess = {
  type: 'parallel',
  children: Process[]
}
type ConditionalProcess = {
  type: 'if',
  condition: boolean,
  then: Process,
  else: Process,
}
type Process =
  | SuccessiveProcess
  | ParallelProcess
  | ConditionalProcess
  | SimpleProces
  
const logAfter = async (ms: number, msg: string): Promise<any> => {
  return new Promise(res => setTimeout(() => (console.log(msg), res(void 0)), ms));
}

console.log('start');

const proc: Process = {
  type: 'successively',
  children: [
    {
      type: 'step',
      run: () => logAfter(700, 'step 1')
    },
    {
      type: 'step',
      run: async () => console.log('step 2'),
    },
    {
      type: 'parallel',
      children: [
        {
          type: 'step',
          run: () => logAfter(100, 'step 3')
        },
        {
          type: 'step',
          run: async () => console.log('step 4'),
        },
      ]
    },
    {
      type: 'if',
      condition: 2 > 5,
      then: {
        type: 'step',
        run: async () => console.log('step 5'),
      },
      else: {
        type: 'step',
        run: async () => console.log('step 6'),
      }
    },
  ]
}

export class FSM {
  run = async (p: Process): Promise<any> => {
    if (p.type === 'step') {
      return p.run();
    } else if (p.type === 'successively') {
      return p.children.reduce((acc, child) => {
        acc = acc.then(_ => this.run(child));
        return acc;
      }, Promise.resolve());
    } else if (p.type === 'parallel') {
      return Promise.all(p.children.map(this.run));
    } else if (p.type === 'if') {
      return p.condition ? this.run(p.then) : this.run(p.else);
    }
  }
}

const fsm = new FSM();
fsm.run(proc).then(_ => console.log('finish'));