import type { Moderation, ModerationType, UnparsedModeration } from "./room.type"
import type { User } from "./user.type"

// Type of likes for comments



export type ActionsUpdate = {
    senderID: string
    parentCommentID: number
}

export type Comment = {
    id: number
    time: Date
    user: User
    content: string
    moderation?: Moderation
    flagged?: boolean
    removed?: boolean
}

export type BotComment = {
    id: number
    time: Date
    botName: string
    content: string
    replies?: BotComment[]
    moderation: Moderation
}

export type LoggedComment = {
    id: number
    bot: Boolean
    time: Date
    userName: string
    content: string
    replies?: LoggedComment[]
    moderation?: Moderation
}

export type Reply = {
    comment: Comment
    parentID: number
}

// Type for comments sent to the server for broadcasting
export type ProposedComment = {
    user: User
    content: string
}
export type ProposedReply = {
    comment: ProposedComment
    parentID: number
}

/**
 * Types for unparsed Data
 */


// Type of comment specification JSON
export type UnparsedBotComment = {
    botName: string
    time: number
    content: string
    moderation: UnparsedModeration
    replies?: UnparsedBotComment[]
}