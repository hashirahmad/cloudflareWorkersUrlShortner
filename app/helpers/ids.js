import { customAlphabet } from 'nanoid'

export const idLowerABC = customAlphabet('abcdefghijklmnopqrstuvwxyz', 4)
export const idUpperABC = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 2)
export const idNumeric = customAlphabet('123456789', 2)
