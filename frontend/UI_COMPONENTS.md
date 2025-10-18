# 🎨 WhisperTales 兒童友好 UI 組件庫

## 概述

基於 **shadcn/ui** 和 **Tailwind CSS** 打造的兒童友好 UI 組件庫，專為 3-8 歲兒童設計，提供色彩豐富、互動性強、易於使用的介面元素。

## 🌟 查看展示頁面

啟動開發伺服器後，訪問以下網址查看所有組件的實際效果：

```
http://localhost:3151/ui-demo
```

## 📦 已安裝的依賴

- `class-variance-authority` - 組件樣式變體管理
- `clsx` - 條件性 className 組合
- `tailwind-merge` - Tailwind 類名合併工具
- `lucide-react` - 美觀的圖標庫
- `@radix-ui/react-slot` - 組件組合工具

## 🎨 設計系統

### 色彩方案

我們的設計系統使用兒童友好的色彩：

- **主色調 (Primary)**: `#ff6b6b` - 溫暖紅色
- **次要色 (Secondary)**: `#4ecdc4` - 薄荷綠
- **強調色 (Accent)**: `#ffd93d` - 陽光黃
- **成功色 (Success)**: `#6bcf7f` - 草綠色
- **警告色 (Warning)**: `#ffb347` - 橙色
- **資訊色 (Info)**: `#74b9ff` - 天空藍

### 圓角尺寸

- `children-sm`: 12px
- `children-md`: 16px
- `children-lg`: 24px
- `children-xl`: 32px

### 陰影效果

- `shadow-children-soft`: 輕柔陰影
- `shadow-children-medium`: 中等陰影
- `shadow-children-strong`: 強烈陰影

## 🧩 可用組件

### 1. Button (按鈕)

位置：`src/components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button';

// 基本用法
<Button>點擊我</Button>

// 不同變體
<Button variant="default">主要按鈕</Button>
<Button variant="secondary">次要按鈕</Button>
<Button variant="success">成功按鈕</Button>
<Button variant="warning">警告按鈕</Button>
<Button variant="accent">強調按鈕</Button>
<Button variant="outline">外框按鈕</Button>
<Button variant="ghost">透明按鈕</Button>

// 不同尺寸
<Button size="sm">小按鈕</Button>
<Button size="default">預設按鈕</Button>
<Button size="lg">大按鈕</Button>

// 帶圖標
import { Sparkles } from 'lucide-react';
<Button>
  <Sparkles className="w-5 h-5 mr-2" />
  創作故事
</Button>
```

### 2. Card (卡片)

位置：`src/components/ui/card.tsx`

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>卡片標題</CardTitle>
    <CardDescription>卡片描述文字</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片內容區域</p>
  </CardContent>
  <CardFooter>
    <Button>操作按鈕</Button>
  </CardFooter>
</Card>
```

### 3. Input (輸入框)

位置：`src/components/ui/input.tsx`

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="輸入你的名字..." />
<Input type="password" placeholder="輸入密碼" />
```

### 4. Badge (徽章)

位置：`src/components/ui/badge.tsx`

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>預設徽章</Badge>
<Badge variant="secondary">次要徽章</Badge>
<Badge variant="success">成功徽章</Badge>
<Badge variant="warning">警告徽章</Badge>
<Badge variant="accent">強調徽章</Badge>
<Badge variant="outline">外框徽章</Badge>
```

### 5. Loading (載入動畫)

位置：`src/components/ui/loading.tsx`

```tsx
import { Loading } from '@/components/ui/loading';

<Loading />
<Loading size="sm" emoji="🎨" message="載入中..." />
<Loading size="lg" emoji="✨" message="正在創造故事..." />
```

### 6. Hero (頁面標題橫幅)

位置：`src/components/ui/hero.tsx`

```tsx
import { Hero } from '@/components/ui/hero';

<Hero
  title="✨ WisperTales ✨"
  subtitle="用你的想像力創造故事！"
  emoji="📚"
  gradient="rainbow"
/>

// 不同漸層效果
<Hero gradient="primary" />
<Hero gradient="secondary" />
<Hero gradient="accent" />
<Hero gradient="rainbow" />
```

### 7. StatCard (統計卡片)

位置：`src/components/ui/stat-card.tsx`

```tsx
import { StatCard } from '@/components/ui/stat-card';

<StatCard
  emoji="🎨"
  value="50+"
  label="繪畫風格"
  color="primary"
/>

<StatCard
  emoji="📖"
  value={1000}
  label="故事創作"
  color="secondary"
/>
```

## 🎯 使用範例

### 完整頁面範例

查看 `src/components/ChildrenUIDemo.tsx` 獲取完整的頁面範例，包含：

- Hero 標題區
- 統計卡片展示
- 表單輸入
- 互動按鈕
- 載入狀態
- 卡片佈局

### 快速開始建立新頁面

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hero } from '@/components/ui/hero';

const MyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary">
      <Hero
        title="我的頁面"
        subtitle="歡迎來到這裡！"
        emoji="🌟"
      />

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>開始使用</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>立即開始</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyPage;
```

## 🎨 自定義主題

所有主題色彩都定義在 `tailwind.config.js` 中，可以根據需求調整：

```js
colors: {
  children: {
    primary: {
      DEFAULT: '#ff6b6b',
      light: '#ff8a80',
      dark: '#ff5252',
    },
    // ... 其他色彩
  },
}
```

## 💡 設計原則

1. **大而清晰**：所有互動元素都足夠大，方便兒童點擊
2. **色彩豐富**：使用鮮豔但不刺眼的色彩吸引注意
3. **視覺回饋**：懸停、點擊都有明確的視覺反饋
4. **圓角設計**：所有組件都使用圓角，更加友好
5. **動畫效果**：適度的動畫讓介面更生動

## 📱 響應式設計

所有組件都支援響應式設計，在手機、平板、桌面上都能良好顯示。

## 🔧 開發建議

1. 優先使用已有組件而非從零開始
2. 保持一致的色彩使用
3. 適當使用表情符號增加趣味性
4. 注意文字大小和可讀性
5. 測試互動效果在觸控設備上的表現

## 🚀 後續擴展

未來可以考慮添加的組件：

- [ ] Dialog (對話框)
- [ ] Toast (提示訊息)
- [ ] Progress (進度條)
- [ ] Tabs (標籤頁)
- [ ] Select (下拉選單)
- [ ] Textarea (多行輸入框)
- [ ] Checkbox & Radio (勾選框和單選框)
- [ ] Avatar (頭像)
- [ ] Tooltip (提示框)

## 📝 注意事項

- 所有組件都使用 TypeScript，確保類型安全
- 使用 `@/` 路徑別名引入組件
- 遵循 React 最佳實踐和 Hook 規則
- 確保所有互動元素都有適當的無障礙屬性

---

**享受創作兒童友好的使用者介面！** 🎨✨
