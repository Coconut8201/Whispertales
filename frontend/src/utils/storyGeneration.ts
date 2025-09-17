// 故事生成相關的業務邏輯
import { GenStory } from './tools/fetch';
import { sdmodel, sdmodel_list } from './sdmodel_list';
import { CharacterRelationship } from './formHelpers';

export interface StoryFormData {
  style: string;
  bookType: string;
  mainCharacter: string;
  description: string;
  otherCharacters: string[];
  relationships: CharacterRelationship[];
  selectedVoice: string;
}

export interface FormattedRelationship {
  role1: string;
  role2: string;
  role12Relative: string;
}

/**
 * 格式化角色關係
 */
export const formatRelationships = (relationships: CharacterRelationship[]): FormattedRelationship[] => {
  return relationships
    .filter(rel => rel.characterA && rel.characterB && rel.relation)
    .map(rel => ({
      role1: rel.characterA,
      role2: rel.characterB,
      role12Relative: rel.relation
    }));
};

/**
 * 驗證表單數據
 */
export const validateStoryForm = (formData: StoryFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.description.trim()) {
    errors.push('請輸入故事內容');
  }

  if (!formData.bookType) {
    errors.push('請選擇繪本種類');
  }

  if (!formData.mainCharacter.trim()) {
    errors.push('請輸入主角色名稱');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 獲取風格選項
 */
export const getStyleOptions = (searchQuery: string): string[] => {
  const options: sdmodel[] = sdmodel_list;
  return [
    searchQuery,
    ...options.map((option) => option.show_name),
  ];
};

/**
 * 根據風格名稱找到對應的模型
 */
export const findModelByStyleName = (styleName: string): sdmodel | undefined => {
  return sdmodel_list.find((model) => model.show_name === styleName);
};

/**
 * 生成故事
 */
export const generateStory = async (formData: StoryFormData): Promise<{
  success: boolean;
  storyId?: string;
  message?: string;
}> => {
  const validation = validateStoryForm(formData);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.errors.join(', ')
    };
  }

  try {
    const targetModel = findModelByStyleName(formData.style);
    const formattedRelationship = formatRelationships(formData.relationships);
    
    const data = {
      style: targetModel?.sd_name || "fantasyWorld_v10.safetensors",
      bookType: formData.bookType,
      mainCharacter: formData.mainCharacter,
      description: formData.description,
      otherCharacters: formData.otherCharacters.filter((character) => character !== ""),
      sdModelId: targetModel?.sdModelId || "",
      relationships: formattedRelationship,
    };

    const result = await GenStory(data, formData.selectedVoice);
    
    if (result && result.success) {
      return {
        success: true,
        storyId: result.storyId
      };
    } else {
      return {
        success: false,
        message: '故事生成失敗，請重試'
      };
    }
  } catch (error) {
    console.error('故事生成錯誤:', error);
    return {
      success: false,
      message: '發生錯誤，請稍後重試'
    };
  }
};