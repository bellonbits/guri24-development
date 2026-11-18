import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-antd': ['antd', '@ant-design/icons'],
                    'vendor-charts': ['recharts'],
                    'vendor-maps': ['leaflet', 'react-leaflet', '@react-google-maps/api'],
                    'vendor-chat': ['@chatscope/chat-ui-kit-react'],
                    'vendor-motion': ['framer-motion', 'lucide-react'],
                },
            },
        },
    },
})
