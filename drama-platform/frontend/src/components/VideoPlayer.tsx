import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface Episode {
  id: string;
  number: number;
  title: string;
  duration: number;
  videoUrl: string;
  thumbnail?: string;
}

interface VideoPlayerProps {
  episodes: Episode[];
  currentEpisodeIndex: number;
  onEpisodeChange: (index: number) => void;
  onProgressUpdate: (episodeId: string, progress: number) => void;
  autoPlay?: boolean;
  savedProgress?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episodes,
  currentEpisodeIndex,
  onEpisodeChange,
  onProgressUpdate,
  autoPlay = false,
  savedProgress = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);

  const currentEpisode = episodes[currentEpisodeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (savedProgress > 0) {
        video.currentTime = savedProgress;
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // 每5秒保存一次进度
      if (Math.floor(video.currentTime) % 5 === 0) {
        onProgressUpdate(currentEpisode.id, video.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // 自动播放下一集
      if (currentEpisodeIndex < episodes.length - 1) {
        onEpisodeChange(currentEpisodeIndex + 1);
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentEpisode, currentEpisodeIndex, episodes.length, onEpisodeChange, onProgressUpdate, savedProgress]);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, currentEpisodeIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentEpisode.title,
        text: `观看 ${currentEpisode.title}`,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={currentEpisode.videoUrl}
        className="w-full h-auto"
        poster={currentEpisode.thumbnail}
        onClick={togglePlay}
      />
      
      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}
      
      {/* 播放按钮覆盖层 */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-pink-600 hover:bg-pink-700 rounded-full w-16 h-16"
          >
            <Play className="w-8 h-8 ml-1" />
          </Button>
        </div>
      )}
      
      {/* 控制栏 */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* 进度条 */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* 播放/暂停 */}
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            {/* 快退/快进 */}
            <Button
              onClick={() => skipTime(-10)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={() => skipTime(10)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            {/* 音量控制 */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            {/* 当前集信息 */}
            <span className="text-white text-sm">
              第{currentEpisode.number}集 - {currentEpisode.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 设置菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
                  播放速度: 0.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
                  播放速度: 1x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
                  播放速度: 1.25x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
                  播放速度: 1.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changePlaybackRate(2)}>
                  播放速度: 2x
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* 分享按钮 */}
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            
            {/* 全屏按钮 */}
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* 剧集列表 */}
      {episodes.length > 1 && (
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                选集 ({currentEpisodeIndex + 1}/{episodes.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 overflow-y-auto">
              {episodes.map((episode, index) => (
                <DropdownMenuItem
                  key={episode.id}
                  onClick={() => onEpisodeChange(index)}
                  className={index === currentEpisodeIndex ? 'bg-pink-100' : ''}
                >
                  第{episode.number}集 - {episode.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
