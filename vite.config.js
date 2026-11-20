import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // relative asset paths so the build can be hosted from any folder
  plugins: [react(), tailwindcss()],
  // .claude/worktrees holds agent worktrees with their own copies of the tests
  test: { environment: 'node', exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'] },
})
