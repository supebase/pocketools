import { ClientResponseError } from 'pocketbase'

export const handlePocketbaseError = (err: any) => {
    if (err instanceof ClientResponseError) {
        throw createError({
            statusCode: err.status || 400,
            statusMessage: 'Database Error',
            data: err.response.data,
        })
    }
    throw err
}