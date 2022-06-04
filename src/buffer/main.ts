type OrOptional<T extends string> = T | `${T}?`
type BufferValueType = 
  | OrOptional<'string'>
  | OrOptional<'u32'> 
  | OrOptional<'bool'> 
  | OrOptional<'date'>

type BufferSchemaType = 
  | BufferValueType
  | BufferSchema
  | [BufferSchema, boolean?] // [schema, optional?]
  | boolean

type BufferSchema = {
  ['__optional']?: boolean,
  [k: string]: BufferSchemaType
}

const userSchema: BufferSchema = {
  id: 'string',
  age: 'u32',
  name: 'string?',
  mail: {
    address: 'string',
    __optional: true
  },
  posts: [{
    id: 'string',
    text: 'string',
    createAt: 'date',
    draft: 'bool?',
  }, false]
}

class MyBuff<T> {
  constructor(public value: T) {}
}

class BufferSerializer<T = any> {
  constructor(private schema: BufferSchema) {
  }

  fromBuffer(buffer: MyBuff<T>): T {
    return buffer.value;
  }

  toBuffer(obj: T) {
    const bufferedEntries = Object
      .entries(this.schema)
      .filter(([key, type]) => {
        return key !== '__optional';
      })
      .map(([key, type]) => {
        const value = obj[key];
        if(value == null) {
          if (this.allowEmpty(type)) {
            return [key, value];
          } else {
            throw Error(`invalid type for key ${key} expected value but got ${value}`);
          }
        }
        return this.BufferEntry(key, type, value);
      });
    
    const bufferValue: T = Object.fromEntries(bufferedEntries);

    return new MyBuff<T>(bufferValue);
  }
  
  private allowEmpty(type): boolean {
    if(typeof type === 'string') {
      return type.endsWith('?');
    } else if (Array.isArray(type)) {
      const optinal = type[1];
      return optinal || false;
    } else if (typeof type == 'object') {
      const objSchema: BufferSchema = type;
      return objSchema?.['__optional'] || false;
    }
  }
  
  private BufferEntry(key, type, value) {
    if (typeof type === 'string') {
      if(type.startsWith('string')) {
        const actualType = typeof value;
        if (actualType !== 'string') {
          throw Error(`invalid type for key ${key} expected type: string actual type: ${actualType}`);
        }
        return [key, value];
      } else if (type.startsWith('u32')) {
        const actualType = typeof value;
        if (actualType !== 'number') {
          throw Error(`invalid type for key ${key} expected type: u32 actual type: ${actualType}`);
        }
        return [key, value];
      } else if (type.startsWith('bool')) {
        const actualType = typeof value;
        if (actualType !== 'boolean') {
          throw Error(`invalid type for key ${key} expected type: bool actual type: ${actualType}`);
        }
        return [key, value];
      } else if (type.startsWith('date')) {
        if (!(value instanceof Date)) {
          throw Error(`invalid type for key ${key} expected type: date actual type: ${typeof value}`);
        }
        return [key, value];
      }
    } else if (Array.isArray(type)) {
      if (!Array.isArray(value)) {
        throw Error(`invalid type for key ${key} expected type: array actual type: ${typeof value}`);
      }
      const innerValueSchema = type[0];
      const innerValueSerializer = new BufferSerializer(innerValueSchema);
      const bufferedValues = value.map(v => this.fromBuffer(innerValueSerializer.toBuffer(v)));
      return [key, bufferedValues];
    } else if (typeof type == 'object') {
      if (typeof value !== 'object') {
        throw Error(`invalid type for key ${key} expected type: object actual type: ${typeof value}`);
      }
      const innerValueSchema = type;
      const innerValueSerializer = new BufferSerializer(innerValueSchema);
      const bufferedValue = innerValueSerializer.toBuffer(value);
      return [key, this.fromBuffer(bufferedValue)];
    }
  }
}

const serializer = new BufferSerializer(userSchema);

const buffer = serializer.toBuffer({
  id: 'u1231',
  age: 30,
  name: 'whatever',
  mail: {
    address: 'New York 11st',
  },
  posts: [
    {
      id: 'p1',
      text: 'post1',
      createAt: new Date(),
      draft: true
    },
    {
      id: 'p2',
      text: 'post2',
      createAt: new Date(),
      draft: false
    },
  ]
});

const user = serializer.fromBuffer(buffer);
console.log(JSON.stringify(user, null, ' '));