import React from 'react';
import { Facebook, Twitter, Instagram, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const socialItems = [
  {
    icon: Facebook,
    href: '#',
    className: 'text-[#1877F2] border-[#1877F2]/40 hover:bg-[#1877F2] hover:text-white',
  },
  {
    icon: Twitter,
    href: '#',
    className: 'text-[#1DA1F2] border-[#1DA1F2]/40 hover:bg-[#1DA1F2] hover:text-white',
  },
  {
    icon: Instagram,
    href: '#',
    className:
      'text-pink-500 border-pink-500/40 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white',
  },
  {
    icon: Plus,
    href: '#',
    className: 'text-muted-foreground border-border hover:bg-foreground hover:text-background',
  },
];

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4">
      {/* 🌍 Background map / earth */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-15"
        style={{
          backgroundImage: "url('/images/world-map.png')", // đổi path nếu cần
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        <Card className="w-full max-w-2xl border-none shadow-none bg-transparent">
          <CardContent className="text-center animate-slideInUp">
            {/* 404 */}
            <h1 className="text-8xl md:text-[11rem] font-light text-foreground opacity-90 mb-6 select-none">
              404
            </h1>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Trang không tồn tại
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto">
              Đường dẫn bạn truy cập có thể đã bị xóa hoặc không còn tồn tại.
            </p>

            {/* Action */}
            <Button
              size="lg"
              onClick={() => navigate(-1)}
              className="gap-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft size={18} />
              Quay về trang trước
            </Button>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-5 mt-10">
              {socialItems.map(({ icon: Icon, href, className }, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  className={`rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg ${className}`}
                  asChild
                >
                  <a href={href}>
                    <Icon size={18} />
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Error404;
