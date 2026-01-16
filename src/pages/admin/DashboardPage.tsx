import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-primary dark:text-textMainLight">
            Báo cáo & Thống kê
          </h1>
          <p className="text-text-sub-dark dark:text-text-sub-light text-base md:text-lg max-w-2xl">
            Tổng quan tình hình cứu trợ và hiệu quả hoạt động hệ thống trong 24h qua.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-card-dark dark:bg-card rounded-lg px-3 py-2 border border-border">
            <span className="material-symbols-outlined text-text-sub-dark dark:text-text-sub-light mr-2 text-sm">
              calendar_today
            </span>
            <span className="text-text-main-dark dark:text-text-main-light text-sm font-medium">
              01/10/2023 - 07/10/2023
            </span>
          </div>
          <Button variant="outline" size="md" className="gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Xuất Excel</span>
          </Button>
          <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span>Xuất Báo Cáo PDF</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card className="bg-card-dark dark:bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-text-sub-dark dark:text-text-sub-light text-sm font-semibold uppercase tracking-wider">
                Tổng yêu cầu
              </p>
              <div className="size-8 rounded-full bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">sos</span>
              </div>
            </div>
            <p className="text-text-main-dark dark:text-text-main-light text-4xl font-black">
              1,240
            </p>
            <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-500/10 w-fit px-2 py-1 rounded">
              <span className="material-symbols-outlined text-base">trending_up</span>
              <span>+12% hôm qua</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-dark dark:bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-text-sub-dark dark:text-text-sub-light text-sm font-semibold uppercase tracking-wider">
                Đã xử lý
              </p>
              <div className="size-8 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </div>
            </div>
            <p className="text-text-main-dark dark:text-text-main-light text-4xl font-black">850</p>
            <div className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-500/10 w-fit px-2 py-1 rounded">
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>98% đúng hạn</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-dark dark:bg-card border-border hover:border-red-500/50 transition-colors group">
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-text-sub-dark dark:text-text-sub-light text-sm font-semibold uppercase tracking-wider">
                Khu vực báo động
              </p>
              <div className="size-8 rounded-full bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">warning</span>
              </div>
            </div>
            <p className="text-text-main-dark dark:text-text-main-light text-4xl font-black">3</p>
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium bg-yellow-500/10 w-fit px-2 py-1 rounded">
              <span>Yên Bái, Lào Cai, Hà Giang</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-dark dark:bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-text-sub-dark dark:text-text-sub-light text-sm font-semibold uppercase tracking-wider">
                Tồn kho thiết yếu
              </p>
              <div className="size-8 rounded-full bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">inventory</span>
              </div>
            </div>
            <p className="text-text-main-dark dark:text-text-main-light text-4xl font-black">
              Ổn định
            </p>
            <div className="flex items-center gap-1 text-text-sub-dark dark:text-text-sub-light text-sm font-medium bg-text-sub-dark/10 dark:bg-text-sub-light/10 w-fit px-2 py-1 rounded">
              <span>Đủ cung ứng 7 ngày tới</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-surface-dark dark:bg-surface-light border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-text-main-dark dark:text-text-main-light text-lg font-bold">
                Xu hướng cứu trợ 7 ngày qua
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-text-sub-dark dark:text-text-sub-light">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  Yêu cầu
                </span>
                <span className="flex items-center gap-1 text-xs text-text-sub-dark dark:text-text-sub-light">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Đã xử lý
                </span>
              </div>
            </div>
            <div className="relative h-[300px] w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-border">
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-text-sub-dark dark:text-text-sub-light w-8">
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="ml-10 flex-1 flex items-end justify-between h-full gap-4">
                {[40, 55, 75, 90, 60, 50, 30].map((height, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 h-full justify-end w-full group cursor-pointer"
                  >
                    <div
                      className="w-full max-w-[40px] bg-primary/20 hover:bg-primary/40 rounded-t-sm relative transition-all duration-300"
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className="absolute bottom-0 w-full bg-primary rounded-t-sm"
                        style={{ height: `${height * 0.8}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-text-sub-dark dark:text-text-sub-light">
                      0{index + 1}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="bg-surface-dark dark:bg-surface-light border-border">
          <CardContent className="p-6">
            <h3 className="text-text-main-dark dark:text-text-main-light text-lg font-bold mb-4">
              Trạng thái yêu cầu
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center relative mb-6">
              <div className="relative size-48 rounded-full border-[16px] border-border flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(#137fec 0% 65%, #f59e0b 65% 85%, #ef4444 85% 100%)',
                    maskImage: 'radial-gradient(transparent 55%, black 56%)',
                    WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)',
                  }}
                ></div>
                <div className="flex flex-col items-center z-10">
                  <span className="text-3xl font-black text-text-main-dark dark:text-text-main-light">
                    65%
                  </span>
                  <span className="text-xs text-text-sub-dark dark:text-text-sub-light">
                    Đã hoàn thành
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-text-sub-dark dark:text-text-sub-light">
                    Đã hoàn thành
                  </span>
                </div>
                <span className="text-sm font-bold text-text-main-dark dark:text-text-main-light">
                  850
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-text-sub-dark dark:text-text-sub-light">
                    Đang xử lý
                  </span>
                </div>
                <span className="text-sm font-bold text-text-main-dark dark:text-text-main-light">
                  260
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-text-sub-dark dark:text-text-sub-light">
                    Chưa xử lý
                  </span>
                </div>
                <span className="text-sm font-bold text-text-main-dark dark:text-text-main-light">
                  130
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
