import { ClientResponseError } from 'pocketbase'

export const handlePocketbaseError = (err: ClientResponseError) => {
  if (err instanceof ClientResponseError) {
    throw createError({
      statusCode: err.status || 400,
      statusMessage: 'Database Error',
      data: err.response.data,
    })
  }
  throw err
}
