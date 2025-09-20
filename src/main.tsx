import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import './index.css'
import { FluentProvider, createLightTheme } from '@fluentui/react-components'

// 创建自定义主题，将品牌色改为黑色
const customTheme = createLightTheme({
  10: '#000000',
  20: '#1a1a1a', 
  30: '#333333',
  40: '#4d4d4d',
  50: '#666666',
  60: '#808080',
  70: '#999999',
  80: '#b3b3b3',
  90: '#cccccc',
  100: '#e6e6e6',
  110: '#f0f0f0',
  120: '#f5f5f5',
  130: '#fafafa',
  140: '#fcfcfc',
  150: '#fdfdfd',
  160: '#ffffff',
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FluentProvider theme={customTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
)
