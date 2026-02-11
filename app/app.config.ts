export default defineAppConfig({
  ui: {
    colors: {
      primary: 'black',
      neutral: 'zinc',
    },

    main: {
      base: 'min-h-[calc(100vh-var(--ui-header-height))] mx-auto max-w-xl px-4',
    },

    modal: {
      slots: {
        overlay: 'backdrop-blur',
      },
    },

    drawer: {
      slots: {
        overlay: 'backdrop-blur',
        container: 'rounded-none',
        title: 'hidden',
        description: 'hidden',
      },
      compoundVariants: [
        {
          class: {
            content: 'inset-y-0 right-0 rounded-none',
          },
        },
      ],
    },
  },
})
