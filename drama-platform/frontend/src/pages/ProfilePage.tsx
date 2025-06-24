import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Heart,
  Clock,
  Star,
  Gift,
  HelpCircle,
  MessageCircle,
  Share2,
  Shield,
  Smartphone,
  Wifi,
  Volume2,
  ChevronRight,
  LogOut,
  Edit
} from 'lucide-react';

interface ProfilePageProps {
  className?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  className = ''
}) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  // 模拟用户数据
  const userStats = {
    watchedDramas: 156,
    favorites: 43,
    watchTime: '1240小时',
    level: 'VIP会员'
  };

  const menuItems = [
    {
      section: '个人设置',
      items: [
        { icon: Edit, label: '编辑资料', action: () => {} },
        { icon: Bell, label: '通知设置', action: () => {}, rightElement: <Switch checked={notifications} onCheckedChange={setNotifications} /> },
        { icon: Moon, label: '深色模式', action: () => {}, rightElement: <Switch checked={darkMode} onCheckedChange={setDarkMode} /> },
      ]
    },
    {
      section: '播放设置',
      items: [
        { icon: Volume2, label: '自动播放', action: () => {}, rightElement: <Switch checked={autoPlay} onCheckedChange={setAutoPlay} /> },
        { icon: Wifi, label: '仅WiFi播放', action: () => {}, rightElement: <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} /> },
        { icon: Download, label: '下载管理', action: () => {} },
      ]
    },
    {
      section: '更多功能',
      items: [
        { icon: Gift, label: '邀请好友', action: () => {} },
        { icon: Star, label: '评价应用', action: () => {} },
        { icon: Share2, label: '分享应用', action: () => {} },
        { icon: MessageCircle, label: '意见反馈', action: () => {} },
        { icon: HelpCircle, label: '帮助中心', action: () => {} },
        { icon: Shield, label: '隐私政策', action: () => {} },
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* 用户信息卡片 */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {/* 头像 */}
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-foreground">短剧爱好者</h2>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  {userStats.level}
                </Badge>
              </div>
              <p className="text-muted-foreground">ID: 888888</p>
            </div>

            {/* 编辑按钮 */}
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Button>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{userStats.watchedDramas}</div>
              <div className="text-sm text-muted-foreground">已看短剧</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{userStats.favorites}</div>
              <div className="text-sm text-muted-foreground">收藏</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{userStats.watchTime}</div>
              <div className="text-sm text-muted-foreground">观看时长</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">9.2</div>
              <div className="text-sm text-muted-foreground">平均评分</div>
            </div>
          </div>
        </Card>

        {/* 快捷功能 */}
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-xs">我的收藏</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span className="text-xs">观看历史</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Download className="w-6 h-6 text-green-500" />
            <span className="text-xs">离线下载</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-xs">我的评分</span>
          </Button>
        </div>

        {/* 设置菜单 */}
        <div className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="p-0 overflow-hidden">
              <div className="p-4 bg-muted/50">
                <h3 className="font-medium text-foreground">{section.section}</h3>
              </div>
              
              <div className="divide-y divide-border">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={item.action}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{item.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.rightElement || <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* 会员升级卡片 */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">升级VIP会员</h3>
              <p className="text-sm text-muted-foreground">
                享受无广告观看、抢先看新剧、高清画质等特权
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              立即升级
            </Button>
          </div>
        </Card>

        {/* 退出登录 */}
        <Card className="p-0 overflow-hidden">
          <Button
            variant="ghost"
            className="w-full p-4 h-auto justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            退出登录
          </Button>
        </Card>

        {/* 版本信息 */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>短剧平台 v1.0.0</p>
          <p>© 2024 短剧平台. All rights reserved.</p>
        </div>

        {/* 底部安全距离 */}
        <div className="h-20" />
      </div>
    </div>
  );
};
