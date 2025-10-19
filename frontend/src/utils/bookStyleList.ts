// 圖片風格類型定義
export interface PicStyle {
  show_name: string; // 顯示名稱
  image_path: string; // 圖片路徑
  description: string; // 風格描述
  sd_name?: string; // SD 模型名稱（可選，用於後端）
  sdModelId?: string; // SD 模型 ID（可選，用於後端）
}

// 圖片風格列表
export const picStyleList: PicStyle[] = [
  {
    show_name: "卡通風格",
    image_path: "/src/images/cartoon_style.png",
    description: "色彩鮮豔、線條可愛的卡通世界",
    sd_name: "cartoon",
  },
  {
    show_name: "剪貼畫/拼貼風格",
    image_path: "/src/images/collage_style.jpg",
    description: "像剪紙一樣拼貼出來的創意圖畫",
    sd_name: "collage",
  },
  {
    show_name: "像素藝術",
    image_path: "/src/images/pixel_art_style.png",
    description: "像樂高積木一樣的方塊畫風",
    sd_name: "pixel_art",
  },
  {
    show_name: "低多邊形",
    image_path: "/src/images/low_poly_style.png",
    description: "用三角形和多邊形組成的幾何風格",
    sd_name: "low_poly",
  },
  {
    show_name: "油畫風格",
    image_path: "/src/images/oil_painting_style.png",
    description: "像畫家用油彩筆畫出來的美麗作品",
    sd_name: "oil_painting",
  },
  {
    show_name: "寫實風格",
    image_path: "/src/images/realistic_style.png",
    description: "就像真實照片一樣逼真的畫面",
    sd_name: "realistic",
  },
];
