import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Tooltip,
  makeStyles,
  tokens,
  Body1,
  Body1Strong,
  Divider,
} from '@fluentui/react-components'
import { Keyboard24Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  shortcutItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  shortcutKey: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: '600',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: '60px',
    textAlign: 'center',
  },
  shortcutDescription: {
    flex: 1,
    marginLeft: '16px',
  },
  sectionTitle: {
    marginTop: '16px',
    marginBottom: '8px',
    color: '#000000',
  },
  dialogContent: {
    maxWidth: '500px',
  },
})

const ShortcutsHelp: React.FC = () => {
  const styles = useStyles()
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    {
      section: '播放控制',
      items: [
        { key: 'Space / Enter', description: '播放/暂停当前视频，或播放选中的视频' },
        { key: '← →', description: '快退/快进 3 秒' },
      ]
    },
    {
      section: '视频列表导航',
      items: [
        { key: '↑ ↓', description: '切换左侧视频列表中的上一个/下一个视频' },
      ]
    },
    {
      section: '摄像头切换',
      items: [
        { key: 'W', description: '切换到前摄像头' },
        { key: 'S', description: '切换到后摄像头' },
        { key: 'A', description: '切换到左摄像头' },
        { key: 'D', description: '切换到右摄像头' },
      ]
    },
    {
      section: '文件操作',
      items: [
        { key: 'Delete / Backspace', description: '删除当前播放的四个视频文件（Mac用Backspace，Windows用Delete）' },
      ]
    },
  ]

  return (
    <Dialog 
      modalType="modal" 
      open={isOpen} 
      onOpenChange={(_, data) => setIsOpen(data.open)}
    >
      <DialogTrigger>
        <Tooltip content="查看快捷键说明" relationship="label">
          <Button
            icon={<Keyboard24Regular />}
            onClick={() => setIsOpen(true)}
          />
        </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>快捷键说明</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            <Body1>
              使用以下快捷键可以更高效地操作视频播放器：
            </Body1>
            
            {shortcuts.map((section, sectionIndex) => (
              <div key={section.section}>
                <Body1Strong className={styles.sectionTitle}>
                  {section.section}
                </Body1Strong>
                {section.items.map((shortcut, index) => (
                  <div className={styles.shortcutItem} key={index}>
                    <div className={styles.shortcutKey}>
                      {shortcut.key}
                    </div>
                    <div className={styles.shortcutDescription}>
                      <Body1>{shortcut.description}</Body1>
                    </div>
                  </div>
                ))}
                {sectionIndex < shortcuts.length - 1 && (
                  <Divider style={{ margin: '12px 0' }} />
                )}
              </div>
            ))}
            
            <Divider style={{ margin: '16px 0' }} />
            <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: '12px' }}>
              💡 提示：这些快捷键在整个应用中都可以使用，无需先点击视频播放器。
            </Body1>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">知道了</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default ShortcutsHelp
