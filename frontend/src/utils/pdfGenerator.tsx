// PDF 生成相關的工具函數
import React from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import JSZip from "jszip";
import { StoryData } from "./storyPlayer";

// 註冊字體
Font.register({
  family: "Noto Sans TC",
  src: "/Assets/NotoSansTC-VariableFont_wght.ttf",
});

Font.register({
  family: "Bopomofo Ruby",
  src: "/font/Bopomofo Ruby 1909 Regular.ttf",
});

// PDF 樣式
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 0,
  },
  fullPage: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  textOverlay: {
    position: "absolute",
    bottom: 40,
    left: "10%",
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 8,
  },
  storyText: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "Noto Sans TC",
    lineHeight: 1.5,
  },
  rubyText: {
    fontFamily: "Bopomofo Ruby",
    fontSize: 10,
  },
  coverPage: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8ff",
    padding: 40,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Noto Sans TC",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  coverSubtitle: {
    fontSize: 18,
    fontFamily: "Noto Sans TC",
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: 40,
  },
  coverImage: {
    width: 300,
    height: 200,
    objectFit: "cover",
    borderRadius: 8,
  },
});

/**
 * PDF 文檔組件
 */
const StoryPDFDocument: React.FC<{
  data: StoryData;
  storyLines: string[];
  showZhuyin?: boolean;
}> = ({ data, storyLines }) => (
  <Document>
    {/* 封面頁 */}
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.coverPage}>
        <Text style={pdfStyles.coverTitle}>我的故事書</Text>
        <Text style={pdfStyles.coverSubtitle}>
          創作日期：{new Date(data.addDate).toLocaleDateString("zh-TW")}
        </Text>
        {data.image_base64 && data.image_base64[0] && (
          <Image
            style={pdfStyles.coverImage}
            src={`data:image/png;base64,${data.image_base64[0]}`}
          />
        )}
      </View>
    </Page>

    {/* 故事內容頁面 */}
    {storyLines.map((line, index) => {
      const imageBase64 = data.image_base64?.[index];

      return (
        <Page key={index} size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.fullPage}>
            {imageBase64 && (
              <Image
                style={pdfStyles.storyImage}
                src={`data:image/png;base64,${imageBase64}`}
              />
            )}
            <View style={pdfStyles.textOverlay}>
              <Text style={pdfStyles.storyText}>{line}</Text>
            </View>
          </View>
        </Page>
      );
    })}
  </Document>
);

/**
 * PDF 生成器類
 */
export class PDFGenerator {
  /**
   * 生成PDF文件
   */
  static async generatePDF(
    data: StoryData,
    storyLines: string[],
    showZhuyin: boolean = false,
  ): Promise<Blob> {
    const pdfDocument = (
      <StoryPDFDocument
        data={data}
        storyLines={storyLines}
        showZhuyin={showZhuyin}
      />
    );

    return await pdf(pdfDocument).toBlob();
  }

  /**
   * 下載PDF文件
   */
  static async downloadPDF(
    data: StoryData,
    storyLines: string[],
    filename?: string,
    showZhuyin: boolean = false,
  ): Promise<void> {
    try {
      const pdfBlob = await this.generatePDF(data, storyLines, showZhuyin);
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `我的故事書_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF 下載失敗:", error);
      throw new Error("PDF 下載失敗");
    }
  }

  /**
   * 生成ZIP文件（包含圖片和PDF）
   */
  static async generateZIP(
    data: StoryData,
    storyLines: string[],
    showZhuyin: boolean = false,
  ): Promise<Blob> {
    const zip = new JSZip();

    try {
      // 添加PDF文件
      const pdfBlob = await this.generatePDF(data, storyLines, showZhuyin);
      zip.file("故事書.pdf", pdfBlob);

      // 添加圖片文件
      if (data.image_base64) {
        const imagesFolder = zip.folder("圖片");
        data.image_base64.forEach((imageBase64, index) => {
          if (imageBase64) {
            // 將base64轉換為blob
            const imageBlob = this.base64ToBlob(imageBase64, "image/png");
            imagesFolder?.file(`圖片_${index + 1}.png`, imageBlob);
          }
        });
      }

      // 添加故事文本文件
      const storyText = storyLines.join("\n\n");
      zip.file("故事內容.txt", storyText);

      // 添加故事信息文件
      const storyInfo = `故事創作資訊\n\n創作日期：${new Date(data.addDate).toLocaleDateString("zh-TW")}\n\n故事內容：\n${data.storyTale}`;
      zip.file("故事資訊.txt", storyInfo);

      return await zip.generateAsync({ type: "blob" });
    } catch (error) {
      console.error("生成ZIP失敗:", error);
      throw new Error("生成ZIP文件失敗");
    }
  }

  /**
   * 下載ZIP文件
   */
  static async downloadZIP(
    data: StoryData,
    storyLines: string[],
    filename?: string,
    showZhuyin: boolean = false,
  ): Promise<void> {
    try {
      const zipBlob = await this.generateZIP(data, storyLines, showZhuyin);
      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `我的故事書包_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP 下載失敗:", error);
      throw new Error("ZIP 下載失敗");
    }
  }

  /**
   * Base64 轉 Blob
   */
  private static base64ToBlob(
    base64: string,
    type: string = "image/png",
  ): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  /**
   * 預覽PDF（在新窗口中打開）
   */
  static async previewPDF(
    data: StoryData,
    storyLines: string[],
    showZhuyin: boolean = false,
  ): Promise<void> {
    try {
      const pdfBlob = await this.generatePDF(data, storyLines, showZhuyin);
      const url = URL.createObjectURL(pdfBlob);

      window.open(url, "_blank");

      // 延遲釋放URL，給瀏覽器時間處理
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("PDF 預覽失敗:", error);
      throw new Error("PDF 預覽失敗");
    }
  }
}
