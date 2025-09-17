import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getVoiceList } from '../../utils/tools/fetch';
import { bookType } from '../../utils/bookType';
import { getStyleOptions, findModelByStyleName, generateStory, StoryFormData } from '../../utils/storyGeneration';
import { FormStateManager } from '../../utils/formHelpers';
import VoiceSelector from './VoiceSelector';
import BookTypeSelector from './BookTypeSelector';
import StyleSelector from './StyleSelector';
import CharacterForm from './CharacterForm';
import RelationshipForm from './RelationshipForm';
import DescriptionForm from './DescriptionForm';
import '../../styles/ChildrenTheme.css';

const AdvancedForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 從URL獲取搜索參數
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("query") || "無搜索內容";
  
  // 表單狀態
  const [formState, setFormState] = useState(() => {
    const initial = FormStateManager.getInitialState();
    return {
      ...initial,
      selectedStyle: searchQuery
    };
  });
  
  // 選項數據
  const [voiceOptions, setVoiceOptions] = useState<string[]>([]);
  const [bookTypeOptions, setBookTypeOptions] = useState<string[]>([]);
  const [styleOptions, setStyleOptions] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("src/images/StorybookRedmond.png");
  const [storyId, setStoryId] = useState<string>("");

  // 初始化數據
  useEffect(() => {
    setStyleOptions(getStyleOptions(searchQuery));
    setBookTypeOptions(bookType);
    
    const fetchVoiceList = async () => {
      try {
        const result = await getVoiceList();
        if (result.success && Array.isArray(result.data)) {
          setVoiceOptions(result.data);
        } else {
          console.error("獲取語音列表失敗:", result.message);
        }
      } catch (error) {
        console.error("獲取語音列表錯誤:", error);
      }
    };

    fetchVoiceList();
  }, [searchQuery]);

  // 更新預覽圖片
  useEffect(() => {
    const targetModel = findModelByStyleName(formState.selectedStyle);
    if (targetModel) {
      setPreviewImage(targetModel.image_path);
    }
  }, [formState.selectedStyle]);

  // 更新表單狀態的輔助函數
  const updateFormState = (updates: Partial<typeof formState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const clearFieldError = (fieldName: string) => {
    updateFormState({
      errors: FormStateManager.clearFieldError(formState.errors, fieldName)
    });
  };

  // 生成故事
  const handleSubmit = async () => {
    updateFormState({ isLoading: true, errors: {} });

    const storyData: StoryFormData = {
      style: formState.selectedStyle,
      bookType: formState.selectedBookType,
      mainCharacter: formState.mainCharacter,
      description: formState.description,
      otherCharacters: formState.otherCharacters,
      relationships: formState.relationships,
      selectedVoice: formState.selectedVoice
    };

    const result = await generateStory(storyData);

    if (result.success && result.storyId) {
      updateFormState({ 
        isLoading: false, 
        isGenerated: true,
        shouldReload: false
      });
      setStoryId(result.storyId);
    } else {
      updateFormState({ 
        isLoading: false, 
        shouldReload: true,
        errors: { submit: result.message || '生成失敗' }
      });
    }
  };

  // 重新生成故事
  const handleRegenerate = () => {
    updateFormState({ shouldReload: false });
    handleSubmit();
  };

  // 開始閱讀故事
  const handleStartStory = () => {
    navigate(`/style/role/startStory?query=${encodeURIComponent(storyId)}`);
  };

  // 清除表單
  const handleClearForm = () => {
    const clearedState = FormStateManager.resetForm();
    setFormState({
      ...clearedState,
      selectedStyle: searchQuery
    });
    setStoryId("");
  };

  return (
    <div className="children-theme">
      {/* 加載遮罩 */}
      {formState.isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="children-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="children-loading-spinner" style={{ margin: '0 auto 20px' }}></div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>
              🎨 正在創造你的故事...
            </div>
            <div style={{ fontSize: '14px', color: '#636e72', marginTop: '8px' }}>
              請稍等片刻，AI 正在努力工作！
            </div>
          </div>
        </div>
      )}

      {/* 頁面標題 */}
      <div className="children-header">
        <h1>🌟 WHISPER TALES - 進階故事創作 🌟</h1>
      </div>

      {/* 導航按鈕 */}
      <div className="children-container">
        <div className="children-row" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/bookmanage')} 
            className="children-btn children-btn-secondary"
          >
            📚 書本管理
          </button>
          <button 
            onClick={() => navigate('/voice')} 
            className="children-btn children-btn-secondary"
          >
            🎵 語音管理
          </button>
          <button 
            onClick={() => navigate('/style')} 
            className="children-btn children-btn-primary"
          >
            🏠 返回首頁
          </button>
        </div>

        {/* 表單內容 */}
        <div className="children-row">
          {/* 左側表單 */}
          <div style={{ flex: 2, marginRight: '20px' }}>
            {/* 語音和繪本類型選擇 */}
            <div className="children-row">
              <VoiceSelector
                selectedVoice={formState.selectedVoice}
                voiceOptions={voiceOptions}
                onVoiceChange={(voice) => {
                  updateFormState({ selectedVoice: voice });
                  clearFieldError('selectedVoice');
                }}
                disabled={formState.isLoading}
              />
              
              <BookTypeSelector
                selectedBookType={formState.selectedBookType}
                bookTypeOptions={bookTypeOptions}
                onBookTypeChange={(bookType) => {
                  updateFormState({ selectedBookType: bookType });
                  clearFieldError('selectedBookType');
                }}
                disabled={formState.isLoading}
                error={formState.errors.selectedBookType}
              />
            </div>

            {/* 風格選擇器 */}
            <StyleSelector
              selectedStyle={formState.selectedStyle}
              styleOptions={styleOptions}
              onStyleChange={(style) => {
                updateFormState({ selectedStyle: style });
                clearFieldError('selectedStyle');
              }}
              previewImage={previewImage}
              disabled={formState.isLoading}
            />

            {/* 角色表單 */}
            <CharacterForm
              mainCharacter={formState.mainCharacter}
              otherCharacters={formState.otherCharacters}
              onMainCharacterChange={(mainCharacter) => {
                updateFormState({ mainCharacter });
                clearFieldError('mainCharacter');
                clearFieldError('characters');
              }}
              onOtherCharactersChange={(otherCharacters) => {
                updateFormState({ otherCharacters });
                clearFieldError('characters');
              }}
              disabled={formState.isLoading}
              errors={formState.errors}
            />

            {/* 關係表單 */}
            <RelationshipForm
              relationships={formState.relationships}
              mainCharacter={formState.mainCharacter}
              otherCharacters={formState.otherCharacters}
              onRelationshipsChange={(relationships) => {
                updateFormState({ relationships });
              }}
              disabled={formState.isLoading}
            />

            {/* 故事描述表單 */}
            <DescriptionForm
              description={formState.description}
              onDescriptionChange={(description) => {
                updateFormState({ description });
                clearFieldError('description');
              }}
              disabled={formState.isLoading}
              error={formState.errors.description}
            />

            {/* 操作按鈕 */}
            <div className="children-card">
              <div className="children-row" style={{ justifyContent: 'center', gap: '16px' }}>
                <button
                  onClick={handleSubmit}
                  className="children-btn children-btn-primary children-btn-large"
                  disabled={formState.isLoading}
                >
                  ✨ 生成我的故事
                </button>
                
                <button
                  onClick={handleClearForm}
                  className="children-btn children-btn-warning"
                  disabled={formState.isLoading}
                >
                  🗑️ 清除重寫
                </button>
              </div>

              {formState.shouldReload && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    onClick={handleRegenerate}
                    className="children-btn children-btn-secondary"
                    disabled={formState.isLoading}
                  >
                    🔄 重新生成
                  </button>
                </div>
              )}

              {formState.errors.submit && (
                <div style={{ 
                  color: '#ff6b6b', 
                  textAlign: 'center', 
                  marginTop: '16px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ⚠️ {formState.errors.submit}
                </div>
              )}
            </div>
          </div>

          {/* 右側結果展示 */}
          <div style={{ flex: 1 }}>
            <div className="children-card" style={{ textAlign: 'center', height: 'fit-content' }}>
              <h3 style={{ color: '#ff6b6b', marginBottom: '20px' }}>🎭 故事預覽</h3>
              
              <img 
                src={previewImage} 
                alt="故事風格預覽" 
                className="children-image-preview"
                style={{ 
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  marginBottom: '20px'
                }}
              />
              
              {formState.isGenerated && storyId && (
                <div>
                  <div style={{ 
                    color: '#6bcf7f', 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}>
                    🎉 故事創作完成！
                  </div>
                  <button
                    onClick={handleStartStory}
                    className="children-btn children-btn-success children-btn-large"
                  >
                    📖 開始閱讀故事
                  </button>
                </div>
              )}
              
              {!formState.isGenerated && !formState.isLoading && (
                <div style={{ color: '#636e72', fontSize: '14px' }}>
                  💡 填寫左側表單後，點擊「生成我的故事」按鈕，就能看到你專屬的故事書！
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedForm;