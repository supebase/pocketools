<template>
  <UApp>
    <UHeader title="Pocketools" :toggle="false"></UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter>
      <LazyBuildEnvironment />
    </UFooter>
  </UApp>
</template>
