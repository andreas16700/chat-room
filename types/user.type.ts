import type { RoomData } from "./room.type"


export type User = {
    id: string
    name: string
    mTurkId: string
    assignmentId: string
    hitId : string
}
export type UserExtended = {
    user: User
    accessCode: string
}
export type AccessInfo = {
    accessCode: string
    mTurkId: string
    assignmentId: string
    hitId : string
    user?: User
}

export type UserAssignment = {
    user?: UserExtended,
    room?: RoomData
}