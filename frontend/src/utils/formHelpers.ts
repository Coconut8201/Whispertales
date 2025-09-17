// 表單管理工具函數
export interface CharacterRelationship {
  characterA: string;
  characterB: string;
  relation: string;
}

/**
 * 角色管理相關函數
 */
export class CharacterManager {
  /**
   * 新增角色
   */
  static addCharacter(characters: string[]): string[] {
    return [...characters, ""];
  }

  /**
   * 移除角色
   */
  static removeCharacter(characters: string[], index: number): string[] {
    const newCharacters = [...characters];
    newCharacters.splice(index, 1);
    return newCharacters;
  }

  /**
   * 更新角色名稱
   */
  static updateCharacter(characters: string[], index: number, value: string): string[] {
    const newCharacters = [...characters];
    newCharacters[index] = value;
    return newCharacters;
  }

  /**
   * 獲取所有有效角色（包括主角色）
   */
  static getAllValidCharacters(mainCharacter: string, otherCharacters: string[]): string[] {
    const allCharacters = [mainCharacter, ...otherCharacters];
    return allCharacters.filter(char => char.trim() !== "");
  }

  /**
   * 獲取除了指定角色外的其他角色
   */
  static getOtherCharacters(mainCharacter: string, otherCharacters: string[], excludeCharacter?: string): string[] {
    const allCharacters = this.getAllValidCharacters(mainCharacter, otherCharacters);
    return excludeCharacter 
      ? allCharacters.filter(char => char !== excludeCharacter)
      : allCharacters;
  }
}

/**
 * 角色關係管理相關函數
 */
export class RelationshipManager {
  /**
   * 新增關係
   */
  static addRelationship(relationships: CharacterRelationship[]): CharacterRelationship[] {
    return [...relationships, { characterA: '', characterB: '', relation: '' }];
  }

  /**
   * 移除關係
   */
  static removeRelationship(relationships: CharacterRelationship[], index: number): CharacterRelationship[] {
    return relationships.filter((_, i) => i !== index);
  }

  /**
   * 更新關係
   */
  static updateRelationship(
    relationships: CharacterRelationship[], 
    index: number, 
    field: keyof CharacterRelationship, 
    value: string
  ): CharacterRelationship[] {
    const newRelationships = [...relationships];
    newRelationships[index] = { ...newRelationships[index], [field]: value };
    return newRelationships;
  }

  /**
   * 驗證關係是否完整
   */
  static validateRelationship(relationship: CharacterRelationship): boolean {
    return !!(relationship.characterA && relationship.characterB && relationship.relation);
  }

  /**
   * 獲取所有有效關係
   */
  static getValidRelationships(relationships: CharacterRelationship[]): CharacterRelationship[] {
    return relationships.filter(this.validateRelationship);
  }
}

/**
 * 表單驗證函數
 */
export class FormValidator {
  /**
   * 驗證必填字段
   */
  static validateRequired(value: string, fieldName: string): { isValid: boolean; error?: string } {
    const isValid = value.trim() !== '';
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} 為必填項目`
    };
  }

  /**
   * 驗證角色名稱
   */
  static validateCharacterName(name: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: '角色名稱不能為空' };
    }
    
    if (name.length > 20) {
      return { isValid: false, error: '角色名稱不能超過20個字符' };
    }
    
    return { isValid: true };
  }

  /**
   * 驗證故事描述
   */
  static validateDescription(description: string): { isValid: boolean; error?: string } {
    if (!description.trim()) {
      return { isValid: false, error: '請輸入故事內容' };
    }
    
    if (description.length < 10) {
      return { isValid: false, error: '故事內容至少需要10個字符' };
    }
    
    if (description.length > 1000) {
      return { isValid: false, error: '故事內容不能超過1000個字符' };
    }
    
    return { isValid: true };
  }

  /**
   * 驗證重複角色名稱
   */
  static validateUniqueCharacters(mainCharacter: string, otherCharacters: string[]): { isValid: boolean; error?: string } {
    const allCharacters = CharacterManager.getAllValidCharacters(mainCharacter, otherCharacters);
    const uniqueCharacters = new Set(allCharacters);
    
    if (allCharacters.length !== uniqueCharacters.size) {
      return { isValid: false, error: '角色名稱不能重複' };
    }
    
    return { isValid: true };
  }
}

/**
 * 表單狀態管理器
 */
export class FormStateManager {
  /**
   * 初始化表單狀態
   */
  static getInitialState() {
    return {
      selectedStyle: "",
      selectedVoice: "",
      selectedBookType: "",
      mainCharacter: "",
      description: "",
      otherCharacters: [""],
      relationships: [{ characterA: '', characterB: '', relation: '' }],
      isLoading: false,
      isGenerated: false,
      shouldReload: false,
      errors: {} as Record<string, string>
    };
  }

  /**
   * 重置表單
   */
  static resetForm() {
    return this.getInitialState();
  }

  /**
   * 清除指定字段的錯誤
   */
  static clearFieldError(errors: Record<string, string>, fieldName: string): Record<string, string> {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
  }

  /**
   * 設置字段錯誤
   */
  static setFieldError(errors: Record<string, string>, fieldName: string, error: string): Record<string, string> {
    return { ...errors, [fieldName]: error };
  }

  /**
   * 驗證整個表單
   */
  static validateForm(formData: {
    description: string;
    mainCharacter: string;
    selectedBookType: string;
    otherCharacters: string[];
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // 驗證故事描述
    const descriptionValidation = FormValidator.validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error!;
    }

    // 驗證主角色
    const mainCharacterValidation = FormValidator.validateCharacterName(formData.mainCharacter);
    if (!mainCharacterValidation.isValid) {
      errors.mainCharacter = mainCharacterValidation.error!;
    }

    // 驗證繪本類型
    const bookTypeValidation = FormValidator.validateRequired(formData.selectedBookType, '繪本種類');
    if (!bookTypeValidation.isValid) {
      errors.selectedBookType = bookTypeValidation.error!;
    }

    // 驗證角色名稱唯一性
    const uniqueValidation = FormValidator.validateUniqueCharacters(formData.mainCharacter, formData.otherCharacters);
    if (!uniqueValidation.isValid) {
      errors.characters = uniqueValidation.error!;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}