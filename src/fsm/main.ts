type State = Record<string, any>
type SimpleProces<T extends State, A extends any[]> = {
  type: 'step',
  name: string,
  run: (state: T, ...args: [...A]) => Promise<void>
}
type SuccessiveProcess<T extends State, A extends any[]> = {
  type: 'successively',
  children: Process<T, A>[]
}
type ParallelProcess<T extends State, A extends any[]> = {
  type: 'parallel',
  children: Process<T, A>[]
}
type ConditionalProcess<T extends State, A extends any[]> = {
  type: 'if',
  condition: (state: T, ...args: A) => Promise<boolean>,
  then: Process<T, A>,
  else: Process<T, A>,
}
type Process<T extends State, A extends any[]> =
  | SuccessiveProcess<T, A>
  | ParallelProcess<T, A>
  | ConditionalProcess<T, A>
  | SimpleProces<T, A>

  
console.log('start');

type User = { age: number, name: string, item?: 'steak' | 'icecream' };
type Args = [number, string];
const proc: Process<User, Args> = {
  type: 'successively',
  children: [
    {
      type: 'step',
      name: 'add first arg to age',
      run: async (state, a: number, b: string) => {
        await sleepFor(200);
        state.age = state.age + a;
      }
    },
    {
      type: 'step',
      name: 'set name from second arg',
      run: async (state, a: number, b: string) => {
        await sleepFor(200);
        state.name = b
      }
    },
    {
      type: 'parallel',
      children: [
        {
          type: 'step',
          name: 'multiply first arg by age',
          run: async (state, a: number, b: string) => {
            await sleepFor(800);
            state.age = state.age * a;
          }
        },
        {
          type: 'step',
          name: 'divide age by first arg',
          run: async (state, a: number, b: string) => {
            await sleepFor(100);
            state.age = state.age / a;
          }
        }
      ]
    },
    {
      type: 'if',
      condition: async ({age, name}, a, b) => {
        if (age > 18) {
          return true;
        } else {
          return false;
        }
      },
      then: {
        type: 'step',
        name: 'give steak',
        run: async (state, a: number, b: string) => {
          await sleepFor(200);
          state.item = 'steak';
        }
      },
      else: {
        type: 'step',
        name: 'give icecream',
        run: async (state, a: number, b: string) => {
          await sleepFor(200);
          state.item = 'icecream';
        }
      }
    },
  ]
}

export class FSM<
  T extends State,
  A extends any[]
> {

  constructor(
    private state: T,
    private args: A
  ){
    console.log(`initial state:`);
    console.log(JSON.stringify(this.state, null, '  '));
  }

  run = async (p: Process<T, A>): Promise<any> => {
    if (p.type === 'step') {
      await p.run(this.state, ...this.args);
      console.log(`state after step: ${p.name}`);
      console.log(JSON.stringify(this.state, null, '  '));
    } else if (p.type === 'successively') {
      return p.children.reduce(
        (acc, child) => acc.then(_ => this.run(child)),
        Promise.resolve()
      );
    } else if (p.type === 'parallel') {
      return Promise.all(p.children.map(this.run));
    } else if (p.type === 'if') {
      const condition = await p.condition(this.state, ...this.args);
      return condition ? this.run(p.then) : this.run(p.else);
    }
  }
}

const fsm = new FSM<User, Args>(
  {age: 12, name: 'francois'},
  [2, 'Michael']
);
fsm.run(proc).then(_ => console.log('finish'));

async function sleepFor (ms: number): Promise<any> {
  return new Promise(res => setTimeout(() => res(void 0), ms));
}
async function logAfter (ms: number, msg: string): Promise<any> {
  return new Promise(res => setTimeout(() => (console.log(msg), res(void 0)), ms));
}