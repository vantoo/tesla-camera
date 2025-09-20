import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  makeStyles,
  shorthands,
  tokens,
  Slider,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
} from '@fluentui/react-components'
import { Pause24Filled, Play24Filled, Delete24Regular } from '@fluentui/react-icons'
import MiniPlay from './mini-player'
import dayjs from 'dayjs'
import { useDelayPlay } from '../tool'

import { type Video, CameraEnum } from '../model'

const useStyles = makeStyles({
  root: {
    ...shorthands.padding(0, '20px'),
  },
  videoWrap: {
    display: 'block',
    position: 'relative',
  },
  video: {
    width: 'auto',
    height: 'auto',
    maxHeight: 'calc(100vh - 180px)', // 统一使用calc，预留180px给控制栏和边距
    aspectRatio: '4 / 3',
    backgroundColor: tokens.colorNeutralBackground5Selected,
  },
  time: {
    position: 'absolute',
    top: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    minWidth: '280px',
    color: tokens.colorNeutralBackground1Hover,
    fontSize: '18px',
    fontWeight: 500,
    ...shorthands.padding('4px', '8px'),
    letterSpacing: '2px',
    backgroundColor: tokens.colorNeutralStencil1Alpha,
    ...shorthands.borderRadius('2px'),
  },
  controlWrap: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
    ...shorthands.margin('10px', '0', '0', '0'),
    position: 'relative',
    zIndex: 100,
  },
  slider: {
    flexGrow: 1,
  },
  sliderTime: {
    minWidth: '40px',
    textAlign: 'center',
  },
  iconButton: {
    cursor: 'pointer',
    ':active': {
      color: tokens.colorNeutralForeground2,
    },
  },
  empty: {

  },
  filePath: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground2,
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    ...shorthands.padding('4px', '0'),
    lineHeight: '1.3',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  controlsContainer: {
    display: 'flex',
    alignItems: 'stretch',
    ...shorthands.gap('20px'),
    ...shorthands.margin('10px', '0', '0', '0'),
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('8px'),
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: '200px',
    height: 'calc(100vh - 180px)', // 统一高度设置
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  rightControls: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('8px'),
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: '200px',
    height: 'calc(100vh - 180px)', // 统一高度设置
    justifyContent: 'flex-start',
  },
  speedControl: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  speedLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    ...shorthands.margin('0', '0', '4px', '0'),
  },
  speedRadioGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  speedRadioItem: {
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('4px'),
  },
  deleteButton: {
    width: '100%',
  },
  layoutToggleButton: {
    width: '100%',
    ...shorthands.margin('0', '0', '8px', '0'),
  },
  deleteDialogContent: {
    maxWidth: '600px',
    minWidth: '400px',
  },
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    ...shorthands.gap('10px'),
    position: 'relative',
    zIndex: 1,
    flexGrow: 1,
    minHeight: 0, // Add this for same reason as above
    maxHeight: 'calc(100vh - 240px)', // 统一高度设置，预留240px给时间显示和控制栏
    aspectRatio: '16 / 9', // 添加宽高比约束
  },
  gridVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground5Selected,
    objectFit: 'contain',
    minHeight: 0,
    maxHeight: 'calc((100vh - 240px) / 2 - 5px)', // 动态计算每个视频的最大高度，减去间距
  },
  gridVideoLabel: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: tokens.colorNeutralStencil1Alpha,
    color: tokens.colorNeutralBackground1Hover,
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius('2px'),
    fontSize: '12px',
    fontWeight: 500,
  },
  gridTimeDisplay: {
    backgroundColor: '#000000',
    color: '#ffffff',
    textAlign: 'center',
    ...shorthands.padding('8px', '16px'),
    ...shorthands.borderRadius('4px'),
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '1px',
    ...shorthands.margin('0', '0', '10px', '0'),
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flexGrow: 1,
    minHeight: 0, // Add this to prevent content from overflowing flex container
  },
  layoutButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.padding('10px', '0'),
    ...shorthands.margin('0', '0', '10px', '0'),
  },
  filePathList: {
    textAlign: 'left',
    fontSize: '12px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    wordBreak: 'break-all',
    ...shorthands.margin('10px', '0'),
    ...shorthands.padding('0'),
    listStyle: 'none',
  },
  filePathItem: {
    ...shorthands.padding('4px', '0'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke3),
    '&:last-child': {
      borderBottom: 'none',
    },
  },
})

interface PlayerProps {
  video?: Video
  playbackRate?: number
  onPlaybackRateChange?: (rate: number) => void
  isGridLayout?: boolean
  onDelete?: (video: Video) => void
  onDeleteFolder?: (video: Video) => void
}

function getSrc(camera: CameraEnum, video: Video): string {
  switch (camera) {
    case CameraEnum.前:
      return video.src_f
    case CameraEnum.后:
      return video.src_b
    case CameraEnum.左:
      return video.src_l
    case CameraEnum.右:
      return video.src_r
  }
}

function fmtTime(time: number) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

const Player = forwardRef<any, React.PropsWithChildren<PlayerProps>>((props, ref) => {
  const styles = useStyles()
  const [currentCamera, setCurrentCamera] = useState(CameraEnum.前)
  const [currentTime, setCurrentTime] = useState(CameraEnum.前)
  const [paused, setPaused] = useState(true)
  const [duration, setDuration] = useState(0)
  const currentPlaybackRate = props.playbackRate || 1
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const isGridLayout = props.isGridLayout || false
  const videoRef = useRef<HTMLVideoElement>(null)
  const gridVideoRefs = useRef<{
    front: HTMLVideoElement | null,
    back: HTMLVideoElement | null,
    left: HTMLVideoElement | null,
    right: HTMLVideoElement | null,
  }>({
    front: null,
    back: null,
    left: null,
    right: null,
  })
  const { delayPlay } = useDelayPlay()
  
  // 布局切换时同步视频
  React.useEffect(() => {
    if (props.video) {
      setTimeout(() => {
        syncAllVideos()
      }, 100) // 给视频元素一些时间来加载
    }
  }, [isGridLayout, props.video])
  
  function onSelectCamera(val: CameraEnum) {
    if (!videoRef.current) return
    setCurrentCamera(val)
    const prePaused = videoRef.current.paused
    const currentTime = videoRef.current.currentTime
    videoRef.current.pause()
    videoRef.current.src = getSrc(val, props.video!)
    videoRef.current.currentTime = currentTime
    if (!prePaused) {
      delayPlay(videoRef.current)
    }
  }
  function onTimeupdate() {
    if (!videoRef.current) return
    if (videoRef.current.currentTime >= videoRef.current.duration) {
      setCurrentTime(videoRef.current.duration)
      videoRef.current.pause()
    } else {
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  function play() {
    if (isGridLayout) {
      Object.values(gridVideoRefs.current).forEach(video => {
        if (video) {
          video.play()
        }
      })
    } else if (videoRef.current) {
      videoRef.current.play()
    }
    setPaused(false)
  }
  function pause() {
    if (isGridLayout) {
      Object.values(gridVideoRefs.current).forEach(video => {
        if (video) {
          video.pause()
        }
      })
    } else if (videoRef.current) {
      videoRef.current.pause()
    }
    setPaused(true)
  }
  function onLoadedMetadata() {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    videoRef.current.playbackRate = currentPlaybackRate
  }
  function onSeek(val: number) {
    if (isGridLayout) {
      // 四分屏模式
      const prePaused = gridVideoRefs.current.front?.paused ?? true
      Object.values(gridVideoRefs.current).forEach(video => {
        if (video) {
          video.pause()
          video.currentTime = val
        }
      })
      setCurrentTime(val)
      
      // 如果拖拽到视频末尾，保持暂停状态
      if (val >= duration) {
        setPaused(true)
      } else if (!prePaused) {
        Object.values(gridVideoRefs.current).forEach(video => {
          if (video) {
            delayPlay(video)
          }
        })
      }
    } else {
      // 单视频模式
      if (!videoRef.current) return
      const prePaused = videoRef.current.paused
      videoRef.current.pause()
      setCurrentTime(val)
      videoRef.current.currentTime = val
      
      // 如果拖拽到视频末尾，保持暂停状态
      if (val >= duration) {
        setPaused(true)
      } else if (!prePaused) {
        delayPlay(videoRef.current)
      }
    }
  }
  function onPlaybackRateChange(rate: number) {
    if (props.onPlaybackRateChange) {
      props.onPlaybackRateChange(rate)
    }
    
    if (isGridLayout) {
      // 四分屏模式：设置所有视频的播放速度
      Object.values(gridVideoRefs.current).forEach(video => {
        if (video) {
          video.playbackRate = rate
        }
      })
    } else if (videoRef.current) {
      // 单视频模式
      videoRef.current.playbackRate = rate
    }
  }
  function onDeleteFiles() {
    setShowDeleteConfirm(true)
  }
  function confirmDelete() {
    if (props.onDelete && props.video) {
      props.onDelete(props.video)
    }
    setShowDeleteConfirm(false)
  }
  function cancelDelete() {
    setShowDeleteConfirm(false)
  }

  React.useEffect(() => {
    if (showDeleteConfirm) {
      setTimeout(() => {
        deleteButtonRef.current?.focus()
      }, 100)
    }
  }, [showDeleteConfirm])
  
  
  function syncAllVideos() {
    if (!props.video) return
    
    const currentVideoTime = isGridLayout ? 
      (gridVideoRefs.current.front?.currentTime || 0) : 
      (videoRef.current?.currentTime || 0)
    
    const isPaused = isGridLayout ? 
      (gridVideoRefs.current.front?.paused ?? true) : 
      (videoRef.current?.paused ?? true)
    
    if (isGridLayout) {
      // 同步所有网格视频
      Object.values(gridVideoRefs.current).forEach(video => {
        if (video) {
          video.currentTime = currentVideoTime
          video.playbackRate = currentPlaybackRate
          if (!isPaused) {
            delayPlay(video)
          } else {
            video.pause()
          }
        }
      })
    } else {
      // 同步单个视频
      if (videoRef.current) {
        videoRef.current.currentTime = currentVideoTime
        videoRef.current.playbackRate = currentPlaybackRate
        if (!isPaused) {
          delayPlay(videoRef.current)
        } else {
          videoRef.current.pause()
        }
      }
    }
    
    setCurrentTime(currentVideoTime)
    setPaused(isPaused)
  }
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    togglePlayPause: () => {
      if (paused) {
        play()
      } else {
        pause()
      }
    },
    selectCamera: (cameraIndex: number) => {
      const cameras = [CameraEnum.前, CameraEnum.后, CameraEnum.左, CameraEnum.右]
      if (cameras[cameraIndex] !== undefined) {
        onSelectCamera(cameras[cameraIndex])
      }
    },
    seekRelative: (seconds: number) => {
      // 如果视频已经播放完毕，则不允许快进
      if (seconds > 0 && currentTime >= duration) {
        return
      }
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))

      // 如果快进到视频末尾，设置到末尾位置并暂停
      if (newTime >= duration) {
        if (isGridLayout) {
          Object.values(gridVideoRefs.current).forEach(video => {
            if (video) {
              video.pause()
              video.currentTime = duration
            }
          })
        } else if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = duration
        }
        setCurrentTime(duration)
        setPaused(true)
      } else {
        onSeek(newTime)
      }
    },
    deleteFiles: () => {
      onDeleteFiles()
    }
  }), [paused, currentTime, duration, isGridLayout])

  const controlBar = (
    <div className={styles.controlWrap}>
      {
          paused
            ? <Play24Filled
                className={styles.iconButton}
                onClick={play}
              />
            : <Pause24Filled
                className={styles.iconButton}
                onClick={pause}
              />
        }
      <div className={styles.sliderTime}>{fmtTime(currentTime)}</div>
      <Slider
        className={styles.slider}
        max={duration}
        min={0}
        value={currentTime}
        onChange={(_, data) => onSeek(data.value)}
      />
      <div className={styles.sliderTime}>{fmtTime(duration)}</div>
    </div>
  )

  return (
    <div className={styles.root}>
      {
        props.video ? (
          <div className={styles.root}>
            <div className={styles.controlsContainer}>
              {/* 左侧：文件路径信息面板 */}
              <div className={styles.leftPanel}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  文件信息
                </div>
                
                {/* 文件夹路径 */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: tokens.colorNeutralForeground1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📁 文件夹</span>
                    <Button
                      appearance="outline"
                      icon={<Delete24Regular />}
                      style={{ 
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#000000'
                      }}
                      onClick={() => props.onDeleteFolder?.(props.video!)}
                    >
                      删除文件夹
                    </Button>
                  </div>
                  <div style={{ fontSize: '11px', color: tokens.colorNeutralForeground2, fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.3' }}>
                    {(() => {
                      const fullPath = props.video.src_f_path || props.video.src_f_name;
                      const lastSlashIndex = fullPath.lastIndexOf('/');
                      return lastSlashIndex !== -1 ? fullPath.substring(0, lastSlashIndex) : '当前目录';
                    })()}
                  </div>
                </div>
                
                {/* 各个视频文件名 */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: tokens.colorNeutralForeground1 }}>
                    🎥 视频文件
                  </div>
                  <div className={styles.filePath}>
                    <strong>前:</strong> {(() => {
                      const fullPath = props.video.src_f_path || props.video.src_f_name;
                      const lastSlashIndex = fullPath.lastIndexOf('/');
                      return lastSlashIndex !== -1 ? fullPath.substring(lastSlashIndex + 1) : fullPath;
                    })()}
                  </div>
                  <div className={styles.filePath}>
                    <strong>后:</strong> {(() => {
                      const fullPath = props.video.src_b_path || props.video.src_b_name;
                      const lastSlashIndex = fullPath.lastIndexOf('/');
                      return lastSlashIndex !== -1 ? fullPath.substring(lastSlashIndex + 1) : fullPath;
                    })()}
                  </div>
                  <div className={styles.filePath}>
                    <strong>左:</strong> {(() => {
                      const fullPath = props.video.src_l_path || props.video.src_l_name;
                      const lastSlashIndex = fullPath.lastIndexOf('/');
                      return lastSlashIndex !== -1 ? fullPath.substring(lastSlashIndex + 1) : fullPath;
                    })()}
                  </div>
                  <div className={styles.filePath}>
                    <strong>右:</strong> {(() => {
                      const fullPath = props.video.src_r_path || props.video.src_r_name;
                      const lastSlashIndex = fullPath.lastIndexOf('/');
                      return lastSlashIndex !== -1 ? fullPath.substring(lastSlashIndex + 1) : fullPath;
                    })()}
                  </div>
                </div>
              </div>
              
              {/* 中间：视频播放区域 */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {isGridLayout ? (
                  // 四分屏布局
                  <>
                    <div className={styles.gridContainer}>
                      {/* 时间显示 - 黑色底栏 */}
                      <div className={styles.gridTimeDisplay}>
                        {dayjs(props.video.time + currentTime * 1000).format('YYYY年MM月DD日 HH:mm:ss')}
                      </div>

                      <div className={styles.gridLayout}>
                        {/* 前摄像头 */}
                        <div style={{ position: 'relative' }}>
                          <video
                            muted
                            className={styles.gridVideo}
                            ref={(el) => { gridVideoRefs.current.front = el }}
                            onLoadedMetadata={() => {
                              if (gridVideoRefs.current.front) {
                                setDuration(gridVideoRefs.current.front.duration)
                                gridVideoRefs.current.front.playbackRate = currentPlaybackRate
                              }
                            }}
                            onTimeUpdate={() => {
                              if (gridVideoRefs.current.front) {
                                setCurrentTime(gridVideoRefs.current.front.currentTime)
                              }
                            }}
                          >
                            <source src={props.video.src_f} type="video/mp4" />
                          </video>
                          <div className={styles.gridVideoLabel}>前</div>
                        </div>

                        {/* 后摄像头 */}
                        <div style={{ position: 'relative' }}>
                          <video
                            muted
                            className={styles.gridVideo}
                            ref={(el) => { gridVideoRefs.current.back = el }}
                          >
                            <source src={props.video.src_b} type="video/mp4" />
                          </video>
                          <div className={styles.gridVideoLabel}>后</div>
                        </div>

                        {/* 左摄像头 */}
                        <div style={{ position: 'relative' }}>
                          <video
                            muted
                            className={styles.gridVideo}
                            ref={(el) => { gridVideoRefs.current.left = el }}
                          >
                            <source src={props.video.src_l} type="video/mp4" />
                          </video>
                          <div className={styles.gridVideoLabel}>左</div>
                        </div>

                        {/* 右摄像头 */}
                        <div style={{ position: 'relative' }}>
                          <video
                            muted
                            className={styles.gridVideo}
                            ref={(el) => { gridVideoRefs.current.right = el }}
                          >
                            <source src={props.video.src_r} type="video/mp4" />
                          </video>
                          <div className={styles.gridVideoLabel}>右</div>
                        </div>
                      </div>
                    </div>
                    {controlBar}
                  </>
                ) : (
                  // 单视频布局
                  <>
                    <div className={styles.videoWrap}>
                      <video
                        muted
                        className={styles.video}
                        id="player"
                        ref={videoRef}
                        onLoadedMetadata={onLoadedMetadata}
                        onPause={() => setPaused(true)}
                        onPlay={() => setPaused(false)}
                        onTimeUpdate={onTimeupdate}
                      >
                        <source src={getSrc(currentCamera, props.video)} type="video/mp4" />
                      </video>
                      {
                          [CameraEnum.前, CameraEnum.后, CameraEnum.左, CameraEnum.右].map(camera => (
                            <MiniPlay
                              camera={camera}
                              currentTime={currentTime}
                              isActive={currentCamera === camera}
                              key={camera}
                              paused={paused}
                              src={getSrc(camera, props.video!)}
                              onClick={() => onSelectCamera(camera)}
                            />
                          ))
                        }
                      <div className={styles.time}>
                        {dayjs(props.video.time + currentTime * 1000).format('YYYY年MM月DD日 HH:mm:ss')}
                      </div>
                    </div>
                    {controlBar}
                  </>
                )}
              </div>
              
              {/* 右侧：控制面板 */}
              <div className={styles.rightControls}>
                {/* 删除按钮 */}
                <Dialog open={showDeleteConfirm} onOpenChange={(_, data) => setShowDeleteConfirm(data.open)}>
                  <DialogTrigger>
                    <Button 
                      appearance="outline"
                      className={styles.deleteButton} 
                      icon={<Delete24Regular />}
                      style={{ 
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#000000'
                      }}
                      onClick={onDeleteFiles}
                    >
                      删除文件
                    </Button>
                  </DialogTrigger>
                  <DialogSurface>
                    <DialogBody>
                      <DialogTitle>确认删除</DialogTitle>
                      <DialogContent className={styles.deleteDialogContent}>
                        <p>确定要删除以下4个文件吗？</p>
                        <ul className={styles.filePathList}>
                          <li className={styles.filePathItem}>
                            <strong>前摄像头:</strong><br />
                            {props.video.src_f_path || props.video.src_f_name}
                          </li>
                          <li className={styles.filePathItem}>
                            <strong>后摄像头:</strong><br />
                            {props.video.src_b_path || props.video.src_b_name}
                          </li>
                          <li className={styles.filePathItem}>
                            <strong>左摄像头:</strong><br />
                            {props.video.src_l_path || props.video.src_l_name}
                          </li>
                          <li className={styles.filePathItem}>
                            <strong>右摄像头:</strong><br />
                            {props.video.src_r_path || props.video.src_r_name}
                          </li>
                        </ul>
                      </DialogContent>
                      <DialogActions>
                        <Button appearance="secondary" onClick={cancelDelete}>
                          取消
                        </Button>
                        <Button
                          autoFocus
                          appearance="primary"
                          ref={deleteButtonRef}
                          style={{
                            backgroundColor: '#000000',
                            borderColor: '#000000'
                          }}
                          onClick={confirmDelete}
                        >
                          确认删除
                        </Button>
                      </DialogActions>
                    </DialogBody>
                  </DialogSurface>
                </Dialog>
                
                {/* 倍速播放控制 */}
                <div className={styles.speedControl}>
                  <div className={styles.speedLabel}>播放速度</div>
                  <RadioGroup
                    className={styles.speedRadioGroup}
                    layout="vertical"
                    value={currentPlaybackRate.toString()}
                    onChange={(_, data) => onPlaybackRateChange(parseFloat(data.value))}
                  >
                    <div className={styles.speedRadioItem}>
                      <Radio label="0.5x" value="0.5" />
                    </div>
                    <div className={styles.speedRadioItem}>
                      <Radio label="1x" value="1" />
                    </div>
                    <div className={styles.speedRadioItem}>
                      <Radio label="2x" value="2" />
                    </div>
                    <div className={styles.speedRadioItem}>
                      <Radio label="5x" value="5" />
                    </div>
                    <div className={styles.speedRadioItem}>
                      <Radio label="10x" value="10" />
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            暂无数据
          </div>
        )
      }

    </div>
  )
})

Player.displayName = 'Player'

export default Player
