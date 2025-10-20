/**
 * Gemini AI 使用範例
 * 展示如何使用 GeminiAI 類別生成故事和圖片
 */

import { GeminiAI } from './geminiAI';

// ============================================
// 範例 1: 基本文字生成
// ============================================
async function example1_basicTextGeneration() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    temperature: 0.8,
    responseModalities: ['TEXT'], // 只生成文字
  });

  const story = await gemini.generateText('寫一個關於小兔子的冒險故事');
  console.log('生成的故事：', story);
}

// ============================================
// 範例 2: 生成故事 + 圖片
// ============================================
async function example2_storyWithImage() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    temperature: 0.9,
    responseModalities: ['TEXT', 'IMAGE'], // 同時生成文字和圖片
    aspectRatio: '16:9', // 設定圖片比例
  });

  const prompt = `
    生成一個兒童故事，內容是關於一隻勇敢的小兔子去森林探險的故事。
    同時生成一張配圖，展示小兔子在森林中的場景。
  `;

  const content = await gemini.generateContent(prompt);

  console.log('故事文字：', content.text);

  if (content.images && content.images.length > 0) {
    console.log(`生成了 ${content.images.length} 張圖片`);

    // 儲存圖片
    content.images.forEach((image, index) => {
      gemini.saveImage(image.data, `./story_image_${index}.png`);
      console.log(`圖片已儲存: story_image_${index}.png`);
    });
  }
}

// ============================================
// 範例 3: 串流生成故事 + 圖片（推薦用於即時顯示）
// ============================================
async function example3_streamStoryWithImage() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    temperature: 0.9,
    responseModalities: ['TEXT', 'IMAGE'],
    aspectRatio: '4:3',
  });

  const prompt = `
    創作一個關於小女孩和她的魔法貓咪的故事。
    請生成故事文字和一張插圖。
  `;

  let fullText = '';
  const images: any[] = [];

  console.log('開始串流生成...\n');

  for await (const chunk of gemini.generateContentStream(prompt)) {
    if (chunk.isComplete) {
      console.log('\n\n✅ 生成完成！');
      break;
    }

    // 處理文字串流
    if (chunk.text) {
      process.stdout.write(chunk.text); // 即時輸出文字
      fullText += chunk.text;
    }

    // 處理圖片
    if (chunk.image) {
      images.push(chunk.image);
      console.log('\n\n📸 收到圖片！');
    }
  }

  // 儲存圖片
  images.forEach((image, index) => {
    gemini.saveImage(image.data, `./stream_story_image_${index}.png`);
    console.log(`圖片已儲存: stream_story_image_${index}.png`);
  });

  return { text: fullText, images };
}

// ============================================
// 範例 4: 為 Whispertales 專案設計的故事生成
// ============================================
async function example4_whispertalesStoryGeneration() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    temperature: 0.85,
    responseModalities: ['TEXT', 'IMAGE'],
    aspectRatio: '16:9',
    maxOutputTokens: 4096,
  });

  // 故事設定
  const storyConfig = {
    characters: [
      { name: '小明', role: '主角', description: '一個勇敢的8歲男孩' },
      { name: '小白', role: '夥伴', description: '一隻會說話的白色小狗' },
    ],
    theme: '友誼與勇氣',
    setting: '神秘的魔法森林',
  };

  const prompt = `
    請創作一個兒童故事，包含以下設定：

    角色：
    ${storyConfig.characters.map(c => `- ${c.name}（${c.role}）：${c.description}`).join('\n')}

    主題：${storyConfig.theme}
    場景：${storyConfig.setting}

    故事要求：
    1. 適合5-8歲兒童閱讀
    2. 長度約300-500字
    3. 包含對話和動作描寫
    4. 傳達正面的價值觀

    同時請生成一張插圖，展示故事中最精彩的場景。
  `;

  console.log('🎨 開始生成 Whispertales 故事...\n');

  let storyText = '';
  let storyImage: any = null;

  for await (const chunk of gemini.generateContentStream(prompt)) {
    if (chunk.isComplete) {
      console.log('\n\n✅ 故事生成完成！');
      break;
    }

    if (chunk.text) {
      process.stdout.write(chunk.text);
      storyText += chunk.text;
    }

    if (chunk.image) {
      storyImage = chunk.image;
      console.log('\n\n📸 故事插圖已生成！');
    }
  }

  // 儲存結果
  if (storyImage) {
    gemini.saveImage(storyImage.data, './whispertales_story.png');
  }

  return {
    story: storyText,
    image: storyImage,
    metadata: storyConfig,
  };
}

// ============================================
// 範例 5: 只生成圖片
// ============================================
async function example5_imageOnly() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    responseModalities: ['IMAGE'], // 只生成圖片
    aspectRatio: '1:1',
  });

  const prompt = '一隻可愛的小兔子在彩虹下跳舞，卡通風格，色彩繽紛';

  const content = await gemini.generateContent(prompt);

  if (content.images && content.images.length > 0) {
    gemini.saveImage(content.images[0].data, './rabbit_dancing.png');
    console.log('✅ 圖片已生成並儲存');
  }
}

// ============================================
// 範例 6: 多輪對話生成故事
// ============================================
async function example6_chatStoryCreation() {
  const gemini = new GeminiAI(process.env.GEMINI_API_KEY!, {
    model: 'gemini-2.5-flash-image',
    temperature: 0.8,
  });

  const chat = gemini.startChat();

  // 第一輪：設定故事背景
  const round1 = await chat.sendMessage('我想創作一個關於太空探險的兒童故事');
  console.log('AI：', round1.response.text());

  // 第二輪：添加角色
  const round2 = await chat.sendMessage('主角是一個9歲的女孩叫做星星');
  console.log('AI：', round2.response.text());

  // 第三輪：生成完整故事
  const round3 = await chat.sendMessage('請根據以上設定，創作一個完整的故事');
  console.log('AI：', round3.response.text());
}

// ============================================
// 執行範例（取消註解來測試）
// ============================================

// example1_basicTextGeneration();
// example2_storyWithImage();
// example3_streamStoryWithImage();
// example4_whispertalesStoryGeneration();
// example5_imageOnly();
// example6_chatStoryCreation();

export {
  example1_basicTextGeneration,
  example2_storyWithImage,
  example3_streamStoryWithImage,
  example4_whispertalesStoryGeneration,
  example5_imageOnly,
  example6_chatStoryCreation,
};
