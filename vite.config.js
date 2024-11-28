import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        dialogue: 'dialogue-page.html',
        diceRoll: 'dice-roll-page.html',
        profile: 'profile-page.html',
        shop: 'shop-page.html'
      }
    }
  }
})
