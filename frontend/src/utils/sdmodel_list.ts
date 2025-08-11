import illustriousStorybook from '../images/illustrious_storybook_landscapes_animals.png';
import realisticVision from '../images/realistic_vision.png';
import jIll from '../images/j_ill.png';
import storybookRedmond from '../images/storybook_redmond.png';
import storybookIllustration from '../images/storybook_illustration_style.png';
import cartoon3d from '../images/3dcartoon.png';

export interface sdmodel{
    sd_name: string,
    show_name: string,
    image_path: string;
    sdModelId: string;
}

export const sdmodel_list: sdmodel[] = [
    { sd_name: "zbaseHighQualityAesthetic_sdxlV30.safetensors", show_name: "奇幻卡通風格", image_path: illustriousStorybook, sdModelId: "illustriousStorybook"},  
    { sd_name: "realisticVisionV60B1_v51HyperVAE.safetensors [f47e942ad4]", show_name: "寫實風格", image_path: realisticVision, sdModelId: "realisticVision"},
    { sd_name: "AnythingV5V3_v5PrtRE.safetensors", show_name: "可愛卡通風格", image_path: jIll, sdModelId: "jIll"},
    { sd_name: "SD XL v1.0 VAE Fix.safetensors [e6bb9ea85b]", show_name: "卡通繪本風格", image_path: storybookRedmond, sdModelId: "storybookRedmond"}, 
    { sd_name: "sdxlUnstableDiffusers_v11Rundiffusion.safetensors [dda8c0514c]", show_name: "手繪風格", image_path: storybookIllustration, sdModelId: "storybookIllustration"},
    { sd_name: "SD XL v1.0 VAE Fix.safetensors [e6bb9ea85b]", show_name: "立體卡通風格", image_path: cartoon3d, sdModelId: "cartoon3d"},
]

export interface bookManageList {
    bookName: string,               // 顯示的書本名字
    bookId: string,                 // 書本id storyId
    bookFirstImageBase64: string    // 封面頁的圖片base64 code
}