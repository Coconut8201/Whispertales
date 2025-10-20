/**
 * 故事相關的型別定義
 */

// 定義角色表單的詳細型別
export interface RoleForm {
  style:string,
  mainCharacter:string,
  description:string,
  otherCharacters:Array<string>,
  relationships?: Array<{
      role1:string,
      role2:string,
      relationship:string,
  }>,
}

// 定義故事生成請求的型別
export interface StoryRequestBody {
  roleform: RoleForm;
  voiceModelName: string;
}
