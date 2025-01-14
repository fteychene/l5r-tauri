export type RollResult = {
    skill?: string
    result: string
}

export interface RollFormInput {
    roll: number
    keep: number
    specialized: boolean
}
