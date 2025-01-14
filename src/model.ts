export type RollResult = {
    skill?: string
    dice: number,
    keep: number,
    result: string,
    rolls: number[]
}

export interface RollFormInput {
    roll: number
    keep: number
    specialized: boolean
}
