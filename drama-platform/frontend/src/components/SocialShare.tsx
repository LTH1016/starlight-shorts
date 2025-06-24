import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Send, 
  Link,
  QrCode,
  Download,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
  size?: 'sm' | 'md' | 'lg';
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (params: ShareParams) => string;
}

interface ShareParams {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  hashtags?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  title,
  description = '',
  url = window.location.href,
  imageUrl = '',
  hashtags = [],
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareParams: ShareParams = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    imageUrl: encodeURIComponent(imageUrl),
    hashtags: encodeURIComponent(hashtags.join(' '))
  };

  const platforms: SharePlatform[] = [
    {
      name: '微信',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      shareUrl: (params) => {
        // 微信分享需要通过二维码或复制链接
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${params.url}`;
      }
    },
    {
      name: '微博',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.31 8.17c-.36.04-.66.08-.95.15-.29.07-.54.16-.76.28-.22.12-.4.26-.54.42-.14.16-.21.34-.21.54 0 .16.04.3.13.42.09.12.21.18.36.18.11 0 .21-.03.3-.08.09-.05.17-.12.24-.2.07-.08.13-.17.18-.27.05-.1.08-.2.08-.3 0-.08-.02-.15-.05-.21-.03-.06-.08-.11-.14-.15-.06-.04-.13-.07-.21-.09-.08-.02-.17-.03-.26-.03-.13 0-.25.02-.36.06-.11.04-.21.1-.3.18-.09.08-.16.18-.21.29-.05.11-.08.23-.08.36 0 .18.04.35.13.51.09.16.21.3.36.42.15.12.33.22.54.3.21.08.44.12.69.12.29 0 .56-.05.81-.16.25-.11.47-.26.66-.45.19-.19.34-.42.45-.69.11-.27.16-.56.16-.87 0-.35-.06-.68-.19-.99-.13-.31-.31-.58-.54-.81-.23-.23-.5-.41-.81-.54-.31-.13-.64-.19-.99-.19-.4 0-.78.08-1.14.23-.36.15-.67.36-.93.63-.26.27-.46.59-.6.96-.14.37-.21.77-.21 1.2 0 .47.08.91.25 1.32.17.41.4.77.69 1.08.29.31.63.55 1.02.72.39.17.81.26 1.26.26.51 0 .98-.1 1.41-.29.43-.19.8-.45 1.11-.78.31-.33.55-.72.72-1.17.17-.45.26-.93.26-1.44 0-.55-.09-1.06-.28-1.53-.19-.47-.45-.88-.78-1.23-.33-.35-.72-.62-1.17-.81-.45-.19-.94-.29-1.47-.29z"/>
        </svg>
      ),
      color: 'bg-red-500 hover:bg-red-600',
      shareUrl: (params) => 
        `https://service.weibo.com/share/share.php?url=${params.url}&title=${params.title}&pic=${params.imageUrl}`
    },
    {
      name: 'QQ空间',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      shareUrl: (params) => 
        `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${params.url}&title=${params.title}&desc=${params.description}&pics=${params.imageUrl}`
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'bg-sky-500 hover:bg-sky-600',
      shareUrl: (params) => 
        `https://twitter.com/intent/tweet?url=${params.url}&text=${params.title}&hashtags=${params.hashtags}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: (params) => 
        `https://www.facebook.com/sharer/sharer.php?u=${params.url}&quote=${params.title}`
    },
    {
      name: 'Telegram',
      icon: <Send className="w-5 h-5" />,
      color: 'bg-blue-400 hover:bg-blue-500',
      shareUrl: (params) => 
        `https://t.me/share/url?url=${params.url}&text=${params.title}`
    }
  ];

  const handlePlatformShare = (platform: SharePlatform) => {
    if (platform.name === '微信') {
      // 微信分享显示二维码
      handleWeChatShare();
    } else {
      const shareUrl = platform.shareUrl(shareParams);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleWeChatShare = () => {
    // 生成二维码或显示复制链接提示
    copyToClipboard();
    toast.success('链接已复制，请在微信中粘贴分享');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (err) {
        console.log('分享取消或失败');
      }
    } else {
      setIsOpen(true);
    }
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-6 w-6 p-0',
          icon: 'w-3 h-3',
          showText: false
        };
      case 'lg':
        return {
          button: 'h-10 px-4',
          icon: 'w-5 h-5',
          showText: true
        };
      default: // md
        return {
          button: 'h-8 px-3',
          icon: 'w-4 h-4',
          showText: true
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <>
      <Button
        onClick={handleNativeShare}
        variant="outline"
        className={`flex items-center ${sizeClasses.showText ? 'space-x-2' : ''} ${sizeClasses.button} bg-black/50 hover:bg-black/70 border-0 text-white hover:text-white`}
      >
        <Share2 className={sizeClasses.icon} />
        {sizeClasses.showText && <span>分享</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>分享到</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 社交平台按钮 */}
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <Button
                  key={platform.name}
                  onClick={() => handlePlatformShare(platform)}
                  className={`${platform.color} text-white flex flex-col items-center space-y-1 h-16`}
                >
                  {platform.icon}
                  <span className="text-xs">{platform.name}</span>
                </Button>
              ))}
            </div>
            
            {/* 复制链接 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">复制链接</label>
              <div className="flex space-x-2">
                <Input
                  value={url}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className={copied ? 'bg-green-50 border-green-200' : ''}
                >
                  {copied ? (
                    <span className="text-green-600">已复制</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* 二维码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">扫码分享</label>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  <img
                    src={generateQRCode()}
                    alt="分享二维码"
                    className="w-32 h-32"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                使用微信扫一扫分享给好友
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialShare;
