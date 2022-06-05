interface IUser {
  name: string;
  getName(n: number): string;
  setAge(age: number): void;
  save(name: string, age: number): Promise<IUser>;
}

type Mock<T> = {
  [P in keyof T]: 
    & T[P] 
    & { 
        setReturn: (v: any) => any, 
        mock: { 
          calls: {args: any[]}[]
        } 
      }
}

type State = Record<string, any>

const mock = <T extends State>(state: any = {}): Mock<T> => {
  return new Proxy(state, {
    get(target, property) {
      state[property] = state[property] ?? { mock: {calls: [] as any[] } };

      return new Proxy(() => {}, {
        apply(target, _this, args) {
          state[property].mock.calls.push({args});
          return state[property].returnValue;
        },
        get(target, innerProp) {
          if(innerProp == 'mock') {
            return state[property][innerProp];
          } else if (innerProp == 'setReturn') {
            return (value: any) => state[property].returnValue = value;
          }
        },
      })
    }
  }) as any;
}

const mockUser = mock<IUser>();

mockUser.getName(1);
mockUser.getName(12);
mockUser.getName.setReturn(12);

console.log(JSON.stringify(mockUser.getName.mock));
console.log(JSON.stringify(mockUser.getName(88)));
console.log(JSON.stringify(mockUser.getName.mock));
