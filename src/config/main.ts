type ConfigSetupValue<T> = {
  value?: T, // def value
  validate?: (v: T) => boolean
  mod: 'read' | 'write' | 'lock',
}
type ConfigSetup<T> = Record<string, ConfigSetupValue<T>>
type ResultConfig<T extends ConfigSetup<any>> = {
  [P in keyof T]: T[P]['value'];
}

function Config(this: any, setup: ConfigSetup<any>) {
  this.valueStorage = {};
  Object.entries(setup).forEach(([key, keyConfig]) => {
    const value = process.env[key] ?? keyConfig.value;
    this.valueStorage[key] = value;

    Object.defineProperty(
      this, 
      key, 
      {
        get() {
          if(keyConfig.mod !== 'lock') {
            return this.valueStorage[key];
          }
        },
        set(value) {
          if(keyConfig.mod === 'write') {
            this.valueStorage[key] = value;
          }
        },
        configurable: keyConfig.mod !== 'lock',
        enumerable: keyConfig.mod === 'read',
      }
    )
  })
}

type rmqConfigSetup = {
  RABBITMQ_HOST: ConfigSetupValue<string>,
  RABBITMQ_PORT: ConfigSetupValue<number>,
  RABBITMQ_USER: ConfigSetupValue<string>,
  RABBITMQ_PASSWORD: ConfigSetupValue<string>,
}

export const RABBITMQ: rmqConfigSetup = {
  RABBITMQ_HOST: {
    value: 'localhost',
    mod: 'read',
    validate: _ => true,
  },
  RABBITMQ_PORT: {
    mod: 'read',
  },
  RABBITMQ_USER: {
    mod: 'write',
  },
  RABBITMQ_PASSWORD: {
    mod: 'lock',
  },
};

const config: ResultConfig<rmqConfigSetup> = new (Config as any)(RABBITMQ);

console.log(config.RABBITMQ_PORT, 'port before write');
config.RABBITMQ_PORT = 1337;
console.log(config.RABBITMQ_PORT, 'port after write (readonly)');
console.log(config.RABBITMQ_USER, 'user before write');
config.RABBITMQ_USER = 'andrew';
console.log(config.RABBITMQ_USER, '   user after write (write allowed)');
console.log(config.RABBITMQ_HOST);
console.log(config.RABBITMQ_PASSWORD);