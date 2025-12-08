import { RoleForm } from "../types/story";

/**
 * 構建故事生成提示詞
 * 注意：圖片生成必須使用英文提示詞，中文提示詞不會觸發圖片生成
 */
export const buildStoryPrompt = (roleform: RoleForm): string => {
    const { style, mainCharacter, description, otherCharacters } = roleform;

    // 故事內容用中文（支援良好）
    const storyPromptChinese = `
請創作一個兒童繪本故事：

故事設定：
- 風格：${style || "童話風格"}
- 主角：${mainCharacter || "小動物"}
- 主角描述：${description || "善良可愛"}
- 其他角色：${otherCharacters?.join("、") || "無"}

故事要求：
1. 適合 5-10 歲兒童閱讀
2. 長度約 300-500 字
3. 包含生動的對話和動作描寫
4. 傳達正面的價值觀（如友誼、勇氣、善良等）
5. 結局溫馨圓滿
    `.trim();

    // 圖片生成指令必須用英文（實測中文無法觸發圖片生成）
    const imagePromptEnglish = `

After writing the story, please create an illustration for this children's book:

Image Requirements:
- Show the most exciting or heartwarming scene from the story
- Feature the main character "${mainCharacter}" ${otherCharacters && otherCharacters.length > 0 ? `and other characters: ${otherCharacters.join(", ")}` : ""}
- Style: ${style} art style
- Use warm, bright colors to create a fairy-tale atmosphere
- The scene should be vibrant and lively, suitable for children's books
- Show interaction and emotion between characters
- Use soft lighting and delicate brushstrokes to create a magical and cozy feeling
- Make it engaging and age-appropriate for 5-10 year old children

Please write the complete story first in Chinese, then generate one beautiful illustration.
    `.trim();

    // TODO 測試時註解
    // return storyPromptChinese + "\n" + imagePromptEnglish;
    
    return "Show me two picture of a nano banana dish in a fancy restaurant with a Gemini theme"
  }
