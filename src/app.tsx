import { fs } from '@tauri-apps/api'
import { useState, useEffect, useRef, useCallback } from 'react'
import cln from 'classnames'
import {
  makeStyles,
  shorthands,
  Tab,
  TabList,
  Divider,
  tokens,
  Tooltip,
  Button,
  Caption1Stronger,
  Badge,
} from '@fluentui/react-components'
import {
  Record24Regular, Code24Regular, BookQuestionMark24Regular, Grid24Regular, VideoClip24Regular,
} from '@fluentui/react-icons'
import Player from './components/player'
import DirectoryAccess from './components/directory-access'
import FfmpegTerminal from './components/ffmpeg-terminal'
import FfmpegExport from './components/ffmpeg-export'
import FsSystem from './components/fs-system'
import CheckUpdate from './components/check-update'
import ShortcutsHelp from './components/shortcuts-help'
import { TypeEnum, type ModelState, type OriginVideo, type Video } from './model'

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  aside: {
    width: '330px',
    height: '100vh',
    backgroundColor: tokens.colorNeutralStroke3,
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
  },
  empty: {
    textAlign: 'center',
  },
  tabWrap: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.padding('10px'),
    rowGap: '20px',
    flexShrink: 0,
  },
  menuWrap: {
    ...shorthands.padding('20px'),
    overflowY: 'auto',
    flexGrow: 1,
    display: 'flex',
    rowGap: '14px',
    flexDirection: 'column',
  },
  eventTag: {
    flexGrow: '1',
    textAlign: 'right',
  },
  menuItem: {
    ...shorthands.padding('6px', '16px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.transition('all', '120ms'),
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    columnGap: '12px',
    color: tokens.colorNeutralForeground1,
    ':hover': {
      color: '#000000',
    },
  },
  menuItemIsActive: {
    color: tokens.colorPaletteRedBorderActive,
    ':hover': {
      color: tokens.colorPaletteRedBorderActive,
    },
  },
  content: {
    height: '100vh',
    ...shorthands.overflow('hidden', 'auto'),
    flexGrow: 1,
    backgroundColor: tokens.colorSubtleBackgroundHover,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.padding('20px'),
    position: 'relative',
  },
  headerLeft: {
    ...shorthands.gap('10px'),
    display: 'flex',
  },
  headerRight: {
    ...shorthands.gap('10px'),
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: 'inherit',
    '&:active': {
      color: 'inherit',
    },
  },
  player: {
    flexGrow: 1,
    minHeight: '1px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  },
})

const tabs = [
  {
    name: '所有',
    value: TypeEnum.所有,
  },
  {
    name: '事件',
    value: TypeEnum.事件,
  },
  {
    name: '哨兵',
    value: TypeEnum.哨兵,
  },
  {
    name: '记录仪',
    value: TypeEnum.行车记录仪,
  },
]

function App() {
  const styles = useStyles()
  const [filterType, setFilterType] = useState(TypeEnum.所有)
  const [state, setState] = useState<ModelState>({
    type: TypeEnum.所有,
    list: [],
    events: [],
  })
  const playerRef = useRef<any>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isGridLayout, setIsGridLayout] = useState(false)
  
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 阻止某些按键的默认行为
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(e.code)) {
        e.preventDefault()
      }
      
      const videoList = state.list
        .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
        .sort((a, b) => b.time - a.time)
      
      switch (e.code) {
        case 'Space':
        case 'Enter':
          // 播放/暂停切换，或播放选中的视频
          if (state.current && playerRef.current) {
            playerRef.current.togglePlayPause()
          } else if (videoList.length > 0) {
            onSelectVideo(videoList[selectedIndex]?.time)
          }
          break
          
        case 'KeyW':
          // 切换到前摄像头
          if (playerRef.current) {
            playerRef.current.selectCamera(0) // 前
          }
          break
          
        case 'KeyS':
          // 切换到后摄像头
          if (playerRef.current) {
            playerRef.current.selectCamera(1) // 后
          }
          break
          
        case 'KeyA':
          // 切换到左摄像头
          if (playerRef.current) {
            playerRef.current.selectCamera(2) // 左
          }
          break
          
        case 'KeyD':
          // 切换到右摄像头
          if (playerRef.current) {
            playerRef.current.selectCamera(3) // 右
          }
          break
          
        case 'ArrowLeft':
          // 后退3秒
          if (playerRef.current) {
            playerRef.current.seekRelative(-3)
          }
          break
          
        case 'ArrowRight':
          // 前进3秒
          if (playerRef.current) {
            playerRef.current.seekRelative(3)
          }
          break
        case 'Backspace':
          // command + backspace 删除文件夹
          if (e.metaKey) {
            if (state.current) {
              handleDeleteFolder(state.current)
            }
            break
          }
          // 删除当前视频
          if (playerRef.current) {
            playerRef.current.deleteFiles()
          }
          break
        case 'Delete':
          // 删除当前视频
          if (playerRef.current) {
            playerRef.current.deleteFiles()
          }
          break
          
        case 'ArrowUp':
          // 上一个视频
          if (videoList.length > 0) {
            const newIndex = Math.max(0, selectedIndex - 1)
            setSelectedIndex(newIndex)
            onSelectVideo(videoList[newIndex]?.time)
          }
          break
          
        case 'ArrowDown':
          // 下一个视频
          if (videoList.length > 0) {
            const newIndex = Math.min(videoList.length - 1, selectedIndex + 1)
            setSelectedIndex(newIndex)
            onSelectVideo(videoList[newIndex]?.time)
          }
          break
          
        default:
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [state, filterType, selectedIndex])
  function onFileSystemAccess(videos: OriginVideo[]) {
    setState({
      ...state,
      list: videos,
    })
  }
  const onSelectVideo = useCallback(async (value: number) => {
    if (state.current) {
      const {
        src_f, src_b, src_l, src_r,
      } = state.current
      URL.revokeObjectURL(src_f)
      URL.revokeObjectURL(src_b)
      URL.revokeObjectURL(src_l)
      URL.revokeObjectURL(src_r)
    }
    const origin = state.list.find(({ time }) => time === value)
    if (!origin) return
    
    // 更新选中的索引
    const videoList = state.list
      .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
      .sort((a, b) => b.time - a.time)
    const index = videoList.findIndex(({ time }) => time === value)
    if (index !== -1) {
      setSelectedIndex(index)
    }
    const [
      src_f_file,
      src_b_file,
      src_l_file,
      src_r_file,
    ] = [
      await origin.src_f.get(),
      await origin.src_b.get(),
      await origin.src_l.get(),
      await origin.src_r.get(),
    ]
    setState({
      ...state,
      current: {
        ...origin,
        src_f: src_f_file.url,
        src_f_name: src_f_file.name,
        src_f_path: origin.src_f.path,
        src_b: src_b_file.url,
        src_b_name: src_b_file.name,
        src_b_path: origin.src_b.path,
        src_l: src_l_file.url,
        src_l_name: src_l_file.name,
        src_l_path: origin.src_l.path,
        src_r: src_r_file.url,
        src_r_name: src_r_file.name,
        src_r_path: origin.src_r.path,
      },
    })
  }, [state])
  
  // 自动选中第一个视频
  useEffect(() => {
    if (state.list.length > 0 && !state.current) {
      const sortedVideos = state.list
        .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
        .sort((a, b) => b.time - a.time)
      
      if (sortedVideos.length > 0) {
        setSelectedIndex(0)
        onSelectVideo(sortedVideos[0].time)
      }
    }
  }, [state.list, filterType, state.current, onSelectVideo])
  
  const videoList = state.list
    .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
    .sort((a, b) => b.time - a.time)

  async function handleDelete(video: Video) {
    const origin = state.list.find(({ time }) => time === video.time)
    if (!origin)
      return

    const currentVideoList = state.list
      .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
      .sort((a, b) => b.time - a.time)
    const deletedVideoIndex = currentVideoList.findIndex(item => item.time === video.time)

    try {
      console.log('开始删除文件 (Web API):', origin)
      await Promise.all([
        origin.src_f.remove(),
        origin.src_b.remove(),
        origin.src_l.remove(),
        origin.src_r.remove(),
      ])
      console.log('文件删除成功 (Web API)')

      const newList = state.list.filter(item => item.time !== video.time)
      const newSortedVideoList = newList
        .filter(({ type }) => type === filterType || filterType === TypeEnum.所有)
        .sort((a, b) => b.time - a.time)

      if (newSortedVideoList.length === 0) {
        setState({
          ...state,
          list: newList,
          current: undefined,
        })
      } else {
        const nextIndex = Math.min(deletedVideoIndex, newSortedVideoList.length - 1)
        const nextVideoToSelect = newSortedVideoList[nextIndex]

        // Manually trigger the logic of onSelectVideo to avoid stale state
        const [
          src_f_file,
          src_b_file,
          src_l_file,
          src_r_file,
        ] = await Promise.all([
          nextVideoToSelect.src_f.get(),
          nextVideoToSelect.src_b.get(),
          nextVideoToSelect.src_l.get(),
          nextVideoToSelect.src_r.get(),
        ])

        setState(prevState => ({
          ...prevState,
          list: newList,
          current: {
            ...nextVideoToSelect,
            src_f: src_f_file.url,
            src_f_name: src_f_file.name,
            src_f_path: nextVideoToSelect.src_f.path,
            src_b: src_b_file.url,
            src_b_name: src_b_file.name,
            src_b_path: nextVideoToSelect.src_b.path,
            src_l: src_l_file.url,
            src_l_name: src_l_file.name,
            src_l_path: nextVideoToSelect.src_l.path,
            src_r: src_r_file.url,
            src_r_name: src_r_file.name,
            src_r_path: nextVideoToSelect.src_r.path,
          },
        }))
        setSelectedIndex(nextIndex)
      }

      alert('视频文件已成功删除！')

      // 检查文件夹是否为空
      if (origin.dirHandle) {
        let hasMp4Files = false
        const remainingFiles = []
        for await (const entry of origin.dirHandle.values()) {
          remainingFiles.push(entry.name)
          if (entry.name.endsWith('.mp4')) {
            hasMp4Files = true
            break
          }
        }

        if (!hasMp4Files) {
          const remainingFilesList = remainingFiles.join('\n')
          const confirmation = window.confirm(
            `当前文件夹已无MP4文件，剩余文件如下：\n\n${remainingFilesList}\n\n是否删除当前文件夹？`
          )
          if (confirmation) {
            try {
              if (origin.parentDirHandle && origin.dirHandle) {
                await origin.parentDirHandle.removeEntry(origin.dirHandle.name, { recursive: true })
                alert('文件夹已成功删除！')
                // 从列表中移除与已删除文件夹相关的所有视频
                setState(prevState => {
                  const newList = prevState.list.filter(item => item.dirHandle?.name !== origin.dirHandle?.name)
                  return {
                    ...prevState,
                    list: newList,
                  }
                })
              } else {
                alert('无法获取父目录句柄，无法自动删除。请手动删除。')
              }
            } catch (e) {
              console.error('删除文件夹时出错:', e)
              alert(`删除文件夹时出错: ${e}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('使用 Web API 删除文件时出错:', error)
      alert(`删除文件时出错: ${error}`)
    }
  }

  const handleDeleteFolder = async (video: Video) => {
    const origin = state.list.find(({ time }) => time === video.time)
    if (!origin || !origin.dirHandle || !origin.parentDirHandle) {
      alert('无法获取文件夹信息，无法删除。')
      return
    }

    const confirmation = window.confirm(
      `您确定要删除整个文件夹 "${origin.dirHandle.name}" 吗？\n\n此操作会删除该文件夹下的所有文件，且不可恢复！`
    )

    if (confirmation) {
      try {
        await origin.parentDirHandle.removeEntry(origin.dirHandle.name, { recursive: true })
        alert('文件夹已成功删除！')

        setState(prevState => {
          const newList = prevState.list.filter(item => item.dirHandle?.name !== origin.dirHandle?.name)
          const newCurrent = prevState.current?.dir === origin.dir ? undefined : prevState.current
          return {
            ...prevState,
            list: newList,
            current: newCurrent,
          }
        })
      } catch (e) {
        console.error('删除文件夹时出错:', e)
        alert(`删除文件夹时出错: ${e}`)
      }
    }
  }

  return (
    <>
      <div className={styles.root}>
        <div className={styles.aside}>
          <div>
            <div className={styles.tabWrap}>
              <TabList
                selectedValue={filterType}
                onTabSelect={(_, data) => setFilterType(data.value as TypeEnum)}
              >
                {
                  tabs.map(({ name, value }) => (
                    <Tab key={value} value={value}>{name}</Tab>
                  ))
                }
              </TabList>
            </div>
            <Divider />
          </div>
          <div className={styles.menuWrap}>
            {
              videoList.map((item) => (
                <div
                  className={cln(styles.menuItem, { [styles.menuItemIsActive]: item.time === state.current?.time })}
                  key={item.time}
                  onClick={() => onSelectVideo(item.time)}
                  onKeyDown={(e) => {
                    e.preventDefault()
                  }}
                  onKeyUp={(e) => {
                    e.preventDefault()
                  }}
                >
                  <Record24Regular />
                  {item.title}
                  <div className={styles.eventTag}>
                    {item.event ? <Badge color="danger" size="extra-small" /> : null}
                  </div>
                </div>
              ))
            }
            {!videoList.length && <div className={styles.empty}>暂无数据</div>}
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {window.__TAURI_IPC__
                ? <FsSystem onAccess={onFileSystemAccess} />
                : <DirectoryAccess onAccess={onFileSystemAccess} />}
              {window.__TAURI_IPC__ && state.current
                ? <FfmpegExport video={state.current} />
                : <FfmpegTerminal video={state.current} />}
            </div>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <Tooltip content={<>切换布局模式</>} relationship="label">
                <Button
                  icon={isGridLayout ? <VideoClip24Regular /> : <Grid24Regular />}
                  onClick={() => setIsGridLayout(!isGridLayout)}
                />
              </Tooltip>
            </div>
            <div className={styles.headerRight}>
              <ShortcutsHelp />
              <CheckUpdate />
              {/* <Tooltip
                content={<>查看源代码 (本项目<Caption1Stronger>不会上传</Caption1Stronger>您的隐私视频，并且接受公开的代码审查)</>}
                relationship="label"
              >
                <Button
                  icon={
                    <a
                      className={styles.link}
                      href="https://github.com/Mario34/tesla-camera"
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Code24Regular />
                    </a>
                  }
                />
              </Tooltip> */}
              {/* <Tooltip content={<>问题反馈</>} relationship="label">
                <Button
                  icon={
                    <a
                      className={styles.link}
                      href="https://github.com/Mario34/tesla-camera/issues/new?assignees=Mario34&labels=&template=%E6%84%8F%E8%A7%81%E6%88%96%E5%8F%8D%E9%A6%88.md&title=%E6%84%8F%E8%A7%81%E6%88%96%E5%8F%8D%E9%A6%88"
                      rel="noreferrer"
                      target="_blank"
                    >
                      <BookQuestionMark24Regular />
                    </a>
                  }
                />
              </Tooltip> */}
            </div>
          </div>
          <div className={styles.player}>
            <Player
              isGridLayout={isGridLayout}
              key={state.current?.time}
              playbackRate={playbackRate}
              ref={playerRef}
              video={state.current}
              onDelete={handleDelete}
              onDeleteFolder={handleDeleteFolder}
              onPlaybackRateChange={setPlaybackRate}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
