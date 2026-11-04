export const randomSeed = (): number => crypto.getRandomValues(new Uint32Array(1))[0]

export const randomId = (): string => crypto.randomUUID()
