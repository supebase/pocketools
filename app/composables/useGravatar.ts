export const useGravatar = () => {
  const generateSha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase())
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
     * 获取 Cravatar/Gravatar 头像地址
     * @param email 邮箱地址
     * @param size 尺寸 (默认 64)
     * @param fallback 默认图片 (默认 mp - 神秘人物)
     */
  const getAvatarUrl = async (email: string, size = 64, fallback = 'mp') => {
    const hash = await generateSha256(email)

    return `https://cn.cravatar.com/avatar/${hash}?s=${size}&r=G&d=${fallback}`
  }

  return {
    getAvatarUrl,
  }
}
