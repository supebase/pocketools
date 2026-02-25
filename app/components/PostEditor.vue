<!-- components/PostEditor.vue -->
<template>
    <div class="post-editor">
      <!-- 文章标题 -->
      <input 
        v-model="post.title" 
        placeholder="文章标题"
        class="title-input"
      />
      
      <div class="editor-layout">
        <!-- 左侧：图片管理区 -->
        <div class="image-manager">
          <div class="image-toolbar">
            <h3>图片库</h3>
            <button @click="triggerUpload" class="upload-btn">
              上传图片
            </button>
          </div>
          
          <!-- 上传进度条 -->
          <div v-if="uploadingImages.length > 0" class="upload-progress">
            <div v-for="img in uploadingImages" :key="img.id" class="progress-item">
              <span>{{ img.name }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: img.progress + '%' }"></div>
              </div>
              <span>{{ img.progress }}%</span>
            </div>
          </div>
          
          <!-- 图片网格 -->
          <div class="image-grid" ref="imageGridRef">
            <div 
              v-for="img in uploadedImages" 
              :key="img.id"
              class="image-item"
              :class="{ 'dragging': img.isDragging }"
              draggable="true"
              @dragstart="handleDragStart($event, img)"
              @dragend="handleDragEnd(img)"
            >
              <!-- 图片预览 -->
              <div class="image-preview">
                <img :src="img.previewUrl" :alt="img.name" />
                
                <!-- 图片操作菜单 -->
                <div class="image-actions">
                  <button @click="replaceImage(img)" title="替换">
                    替换
                  </button>
                  <button @click="deleteImage(img)" title="删除">
                    删除
                  </button>
                  <button @click="editAlt(img)" title="编辑Alt文本">
                    编辑
                  </button>
                </div>
                
                <!-- Alt文本显示 -->
                <div v-if="img.alt" class="image-alt">{{ img.alt }}</div>
              </div>
              
              <!-- 点击插入按钮 -->
              <button 
                class="insert-btn" 
                @click="insertAtCursor(img)"
                title="点击插入到编辑器"
              >
                插入图片
              </button>
            </div>
          </div>
        </div>
        
        <!-- 右侧：Markdown编辑器 -->
        <div class="editor-area">
          <textarea
            ref="editorRef"
            v-model="post.content"
            class="markdown-editor"
            placeholder="在这里写文章... 支持Markdown语法"
            @drop="handleDrop"
            @dragover.prevent
          ></textarea>
          
          <!-- 预览切换（可选） -->
          <div class="editor-footer">
            <button @click="previewMode = !previewMode">
              {{ previewMode ? '编辑' : '预览' }}
            </button>
          </div>
          
          <!-- Markdown预览 -->
          <div v-if="previewMode" class="markdown-preview">
            <Markdown :source="post.content" />
          </div>
        </div>
      </div>
      
      <!-- 底部发布栏 -->
      <div class="publish-bar">
        <div class="publish-info">
          <span v-if="uploadingImages.length > 0">
            正在上传 {{ uploadingImages.length }} 张图片...
          </span>
          <span v-else>
            共 {{ uploadedImages.length }} 张图片，{{ wordCount }} 字
          </span>
        </div>
        <button 
          @click="publishPost" 
          class="publish-btn"
          :disabled="isPublishing || uploadingImages.length > 0"
        >
          <span v-if="isPublishing">发布中...</span>
          <span v-else>发布文章</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import Markdown from 'vue3-markdown-it'
  
  const { $pb } = useNuxtApp()
  
  // 文章数据
  const post = reactive({
    title: '',
    content: ''
  })
  
  // 图片管理
  const uploadedImages = ref([])      // 已上传的图片
  const uploadingImages = ref([])     // 上传中的图片
  const previewMode = ref(false)      // 预览模式
  const isPublishing = ref(false)     // 发布状态
  
  // 编辑器引用
  const editorRef = ref(null)
  const imageGridRef = ref(null)
  
  // 字数统计
  const wordCount = computed(() => {
    return post.content.trim().length
  })
  
  // 触发文件选择
  const triggerUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/jpeg,image/png,image/gif,image/webp'
    input.onchange = (e) => handleImageSelect(e.target.files)
    input.click()
  }
  
  // 处理图片选择
  const handleImageSelect = async (files) => {
    for (const file of files) {
      // 生成本地预览
      const previewUrl = URL.createObjectURL(file)
      const tempId = 'temp_' + Date.now() + '_' + file.name
      
      // 添加到上传队列
      const uploadItem = {
        id: tempId,
        file: file,
        name: file.name,
        previewUrl: previewUrl,
        progress: 0,
        alt: file.name.split('.')[0], // 默认alt为文件名
        serverData: null
      }
      
      uploadingImages.value.push(uploadItem)
      
      // 开始上传
      await uploadImage(uploadItem)
    }
  }
  
  // 上传单张图片
  const uploadImage = async (uploadItem) => {
    try {
      const formData = new FormData()
      formData.append('file', uploadItem.file)
      
      // 模拟进度（PocketBase原生不支持上传进度，这里用模拟）
      const progressInterval = setInterval(() => {
        if (uploadItem.progress < 90) {
          uploadItem.progress += 10
        }
      }, 200)
      
      // 实际上传
      const record = await $pb.collection('files').create(formData)
      
      clearInterval(progressInterval)
      uploadItem.progress = 100
      
      // 获取服务器URL
      const serverUrl = $pb.files.getURL(record, record.file)
      
      // 从上传队列移到已上传队列
      setTimeout(() => {
        const index = uploadingImages.value.findIndex(img => img.id === uploadItem.id)
        if (index !== -1) {
          uploadingImages.value.splice(index, 1)
          
          uploadedImages.value.push({
            id: record.id,
            name: uploadItem.name,
            previewUrl: uploadItem.previewUrl,
            serverUrl: serverUrl,
            alt: uploadItem.alt,
            isDragging: false
          })
        }
      }, 500) // 让100%显示一下再移除
      
    } catch (error) {
      console.error('上传失败:', error)
      // 移除失败的图片
      const index = uploadingImages.value.findIndex(img => img.id === uploadItem.id)
      if (index !== -1) {
        uploadingImages.value.splice(index, 1)
      }
      alert(`图片 ${uploadItem.name} 上传失败`)
    }
  }
  
  // 替换图片
  const replaceImage = async (oldImage) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const newFile = e.target.files[0]
      if (!newFile) return
      
      // 先删除旧的（如果是已上传到服务器的）
      if (oldImage.id && !oldImage.id.startsWith('temp_')) {
        try {
          await $pb.collection('files').delete(oldImage.id)
        } catch (error) {
          console.error('删除旧图片失败:', error)
        }
      }
      
      // 上传新图片
      const previewUrl = URL.createObjectURL(newFile)
      const tempId = 'temp_' + Date.now()
      
      const uploadItem = {
        id: tempId,
        file: newFile,
        name: newFile.name,
        previewUrl: previewUrl,
        progress: 0,
        alt: oldImage.alt
      }
      
      // 替换列表中的图片
      const index = uploadedImages.value.findIndex(img => img.id === oldImage.id)
      if (index !== -1) {
        uploadedImages.value.splice(index, 1)
      }
      
      uploadingImages.value.push(uploadItem)
      await uploadImage(uploadItem)
    }
    input.click()
  }
  
  // 删除图片
  const deleteImage = async (image) => {
    if (!confirm(`确定要删除图片 "${image.name}" 吗？`)) return
    
    // 如果已上传到服务器，删除服务器文件
    if (image.id && !image.id.startsWith('temp_')) {
      try {
        await $pb.collection('files').delete(image.id)
      } catch (error) {
        console.error('删除失败:', error)
        return
      }
    }
    
    // 从列表中移除
    const index = uploadedImages.value.findIndex(img => img.id === image.id)
    if (index !== -1) {
      // 释放预览URL
      URL.revokeObjectURL(image.previewUrl)
      uploadedImages.value.splice(index, 1)
    }
    
    // 同时从内容中移除图片引用（可选）
    const imageMarkdown = `![](${image.serverUrl || image.previewUrl})`
    post.content = post.content.replace(imageMarkdown, '')
  }
  
  // 编辑Alt文本
  const editAlt = (image) => {
    const newAlt = prompt('输入图片Alt文本:', image.alt)
    if (newAlt !== null) {
      image.alt = newAlt
    }
  }
  
  // 拖拽开始
  const handleDragStart = (event, image) => {
    image.isDragging = true
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'image',
      url: image.serverUrl || image.previewUrl,
      alt: image.alt,
      id: image.id
    }))
    event.dataTransfer.effectAllowed = 'copy'
  }
  
  // 拖拽结束
  const handleDragEnd = (image) => {
    image.isDragging = false
  }
  
  // 处理拖拽放下
  const handleDrop = (event) => {
    event.preventDefault()
    
    const data = event.dataTransfer.getData('text/plain')
    if (!data) return
    
    try {
      const imageData = JSON.parse(data)
      if (imageData.type === 'image') {
        insertAtCursor({
          serverUrl: imageData.url,
          alt: imageData.alt
        })
      }
    } catch (e) {
      // 如果不是JSON，可能是直接拖拽的文件
      if (event.dataTransfer.files.length > 0) {
        handleImageSelect(event.dataTransfer.files)
      }
    }
  }
  
  // 在光标位置插入图片
  const insertAtCursor = (image) => {
    const textarea = editorRef.value
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const imageMarkdown = `![${image.alt || ''}](${image.serverUrl})\n`
    
    post.content = 
      post.content.substring(0, start) + 
      imageMarkdown + 
      post.content.substring(end)
    
    // 移动光标到插入内容之后
    nextTick(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
    })
  }
  
  // 发布文章
  const publishPost = async () => {
    if (!post.title.trim()) {
      alert('请输入文章标题')
      return
    }
    
    if (!post.content.trim()) {
      alert('请输入文章内容')
      return
    }
    
    if (uploadingImages.value.length > 0) {
      alert('请等待所有图片上传完成')
      return
    }
    
    isPublishing.value = true
    
    try {
      // 这里可以添加额外的处理，比如从内容中提取所有图片ID
      
      const record = await $pb.collection('posts').create({
        title: post.title,
        content: post.content,
        author: $pb.authStore.record?.id
      })
      
      alert('文章发布成功！')
      
      // 清空表单或跳转
      post.title = ''
      post.content = ''
      
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败：' + error.message)
    } finally {
      isPublishing.value = false
    }
  }
  </script>
  
  <style scoped>
  .post-editor {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .title-input {
    width: 100%;
    padding: 12px;
    font-size: 24px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .editor-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    height: calc(100vh - 200px);
  }
  
  /* 图片管理区 */
  .image-manager {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .image-toolbar {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .image-toolbar h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .upload-btn {
    padding: 6px 12px;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .upload-progress {
    padding: 10px;
    background: #fff;
    border-bottom: 1px solid #ddd;
  }
  
  .progress-item {
    margin-bottom: 8px;
    font-size: 12px;
  }
  
  .progress-bar {
    height: 4px;
    background: #eee;
    border-radius: 2px;
    margin: 4px 0;
  }
  
  .progress-fill {
    height: 100%;
    background: #007aff;
    border-radius: 2px;
    transition: width 0.3s;
  }
  
  .image-grid {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .image-item {
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    background: white;
    transition: all 0.2s;
  }
  
  .image-item.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }
  
  .image-preview {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .image-preview:hover .image-actions {
    opacity: 1;
  }
  
  .image-actions button {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .image-actions button:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .image-alt {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  
  .insert-btn {
    width: 100%;
    padding: 6px;
    border: none;
    border-top: 1px solid #ddd;
    background: #f0f0f0;
    cursor: pointer;
    font-size: 12px;
  }
  
  .insert-btn:hover {
    background: #e0e0e0;
  }
  
  /* 编辑器区 */
  .editor-area {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .markdown-editor {
    flex: 1;
    padding: 15px;
    border: none;
    resize: none;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
  
  .markdown-editor:focus {
    outline: none;
  }
  
  .editor-footer {
    padding: 10px;
    border-top: 1px solid #ddd;
    background: #f9f9f9;
    display: flex;
    justify-content: flex-end;
  }
  
  .editor-footer button {
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  
  .markdown-preview {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background: #fff;
  }
  
  /* 发布栏 */
  .publish-bar {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .publish-btn {
    padding: 10px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .publish-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .publish-info {
    color: #666;
  }
  </style>