export enum OptionType {
  string = 'string',
  boolean = 'boolean',
  array = 'array'
}

export enum OptionSubType {
  string = 'string',
}

export interface CopOption {
  flags: string[];
  type?: OptionType,
  subType?: OptionSubType,
  description?: string;
  conflict?: string[];
  nArgs?: number;
}

export interface Option extends CopOption {
  nArgs: number;
}
