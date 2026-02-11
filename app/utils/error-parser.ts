import { ClientResponseError } from 'pocketbase'

export const parsePocketbaseError = (err: any): string => {
    if (!(err instanceof ClientResponseError)) return '发生未知错误'

    if (Object.keys(err.response?.data || {}).length > 0) {
        const errorData = Object.values(err.response.data)[0] as any
        return errorData.message || (typeof errorData === 'string' ? errorData : '输入数据验证失败')
    }

    if (err.status === 403) return '您没有权限执行此操作'
    if (err.status === 404) return '找不到请求的内容'

    return err.message || '服务器响应异常'
}