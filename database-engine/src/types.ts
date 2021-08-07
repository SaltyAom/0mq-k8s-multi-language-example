import type { Post } from '@prisma/client'

export interface CRUDDatabaseRequest {
    method: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
    data: CRUDRequest
}

export interface CRUDRequest {
    id: number
    title: string
    detail: string
}

export interface BatchDatabaseRequest {
    method: 'LIST'
    data: BatchRequest
}

export interface PingRequest {
    method: 'PING'
    data: null
}

export interface BatchRequest {
    batch: number
}

export type DatabaseRequest =
    | CRUDDatabaseRequest
    | BatchDatabaseRequest
    | PingRequest

export interface DatabaseRequestMap {
    CREATE: Promise<Post>
    READ: Promise<Post | null>
    UPDATE: Promise<Post>
    DELETE: Promise<Post>
    LIST: Promise<Promise<Post[]>>
}

export interface DatabaseResponse {
    success: boolean
    info: string
    data: Post | Post[] | null
}
