<template>
    <div class="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center p-6 transition-colors duration-500">
      <div class="max-w-2xl w-full">
        <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          
          <div class="bg-black text-white p-8">
            <div class="flex items-center gap-3 mb-3">
              <UIcon name="i-heroicons-circle-stack" class="w-8 h-8 text-white" />
              <h1 class="text-2xl font-bold tracking-tighter">PocketBase 配置指引</h1>
            </div>
            <p class="text-neutral-400 text-sm font-mono uppercase tracking-widest">
              Database connection required to continue
            </p>
          </div>
  
          <div class="p-8 space-y-8">
            <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex gap-3">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div class="text-sm text-red-800 dark:text-red-300">
                <span class="font-bold">连接失败：</span> 无法访问 PocketBase 服务。请确保你的数据库已启动并正确配置。
              </div>
            </div>
  
            <div class="space-y-8">
              <div class="flex gap-4">
                <div class="shrink-0 w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-mono text-sm font-bold">1</div>
                <div class="space-y-2">
                  <h3 class="font-bold text-neutral-900 dark:text-white tracking-tight">启动 PocketBase 服务</h3>
                  <p class="text-sm text-neutral-500 leading-relaxed">在终端中运行以下命令（默认端口 8090）：</p>
                  <div class="bg-neutral-900 rounded-lg p-4 font-mono text-[13px] text-neutral-300 border border-neutral-800">
                    <div class="text-neutral-500 mb-1"># Unix / macOS</div>
                    <div class="text-green-400">./pocketbase serve</div>
                    <div class="text-neutral-500 mt-3 mb-1"># Windows</div>
                    <div class="text-green-400">pocketbase.exe serve</div>
                  </div>
                </div>
              </div>
  
              <div class="flex gap-4">
                <div class="shrink-0 w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-mono text-sm font-bold">2</div>
                <div class="flex-1 space-y-3">
                  <h3 class="font-bold text-neutral-900 dark:text-white tracking-tight">初始化数据表 (Collections)</h3>
                  <p class="text-sm text-neutral-500 leading-relaxed">
                    访问 <UKbd>http://127.0.0.1:8090/_/</UKbd> 并创建以下集合：
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
                      <div class="flex items-center gap-2 font-bold text-sm">
                        <UIcon name="i-heroicons-document-text" class="text-primary-500" /> posts
                      </div>
                      <ul class="text-[12px] text-neutral-500 space-y-1 font-mono">
                        <li>• content (plain text)</li>
                        <li>• user (relation -> users)</li>
                      </ul>
                    </div>
                    <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
                      <div class="flex items-center gap-2 font-bold text-sm">
                        <UIcon name="i-heroicons-chat-bubble-left-right" class="text-primary-500" /> comments
                      </div>
                      <ul class="text-[12px] text-neutral-500 space-y-1 font-mono">
                        <li>• post (relation -> posts)</li>
                        <li>• email (plain text)</li>
                        <li>• comment (plain text)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="flex gap-4">
                <div class="shrink-0 w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-mono text-sm font-bold">3</div>
                <div class="space-y-2">
                  <h3 class="font-bold text-neutral-900 dark:text-white tracking-tight">设置 API 权限 (API Rules)</h3>
                  <p class="text-sm text-neutral-500 leading-relaxed">
                    为了让前端正常运行，请将 <span class="text-neutral-900 dark:text-white font-medium italic">List/View</span> 和 <span class="text-neutral-900 dark:text-white font-medium italic">Create</span> 的权限设置为 "Everyone"。
                  </p>
                </div>
              </div>
            </div>
  
            <div class="pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <UButton
                block
                size="xl"
                color="neutral"
                label="完成配置，点击刷新"
                @click="reload"
              />
            </div>
          </div>
        </div>
  
        <p class="mt-8 text-center text-xs text-neutral-400 font-mono">
          PREVIEW MODE • DATABASE_URL: http://127.0.0.1:8090
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const reload = () => {
    window.location.reload()
  }
  </script>