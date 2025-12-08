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
import { Button } from '../ui/button';
import { ArrowLeft, Book, Mic, Trash2, RefreshCcw, Sparkles, BookOpen } from 'lucide-react';
import { Loading } from '../ui/loading';

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
    <div className="min-h-screen bg-gradient-to-br from-children-bg-primary to-children-bg-secondary p-4 sm:p-6 pb-20">
      {/* 加載遮罩 */}
      {formState.isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <Loading size="lg" emoji="🎨" message="正在創造你的故事..." />
            <p className="text-gray-500 mt-4 text-sm">
              請稍等片刻，AI 正在努力工作！
            </p>
          </div>
        </div>
      )}

      {/* 頁面標題 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-children-primary mb-2">
          🌟 WHISPER TALES - 進階故事創作 🌟
        </h1>
        <p className="text-children-text-secondary">
          填寫下方的魔法表單，創造屬於你的獨特故事！
        </p>
      </div>

      {/* 導航按鈕 */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap justify-center gap-4">
        <Button onClick={() => navigate('/style')} variant="outline" className="bg-white/80 hover:bg-white border-children-primary text-children-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首頁
        </Button>
        <Button onClick={() => navigate('/bookmanage')} variant="secondary" className="bg-white/80 hover:bg-white text-children-secondary">
          <Book className="w-4 h-4 mr-2" />
          書本管理
        </Button>
        <Button onClick={() => navigate('/voice')} variant="secondary" className="bg-white/80 hover:bg-white text-children-secondary">
          <Mic className="w-4 h-4 mr-2" />
          語音管理
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側表單區域 */}
        <div className="lg:col-span-8 space-y-6">

          {/* 語音和繪本類型選擇 (並排) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] text-lg py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-gradient-to-r from-children-primary to-children-accent border-none"
              disabled={formState.isLoading}
            >
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              生成我的故事
            </Button>

            <Button
              onClick={handleClearForm}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg py-6 border-2 border-orange-200 hover:bg-orange-50 text-orange-500"
              disabled={formState.isLoading}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              清除重寫
            </Button>
          </div>

          {formState.shouldReload && (
            <div className="text-center mt-4">
              <Button
                onClick={handleRegenerate}
                variant="secondary"
                disabled={formState.isLoading}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
            </div>
          )}

          {formState.errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center font-bold mt-4 shadow-sm">
              ⚠️ {formState.errors.submit}
            </div>
          )}
        </div>

        {/* 右側預覽/結果展示 (在桌面版固定，移動版流式) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-children-md p-6 text-center border-2 border-children-secondary/20 hover:border-children-secondary/50 transition-colors">
              <h3 className="text-xl font-bold text-children-secondary mb-4 flex items-center justify-center gap-2">
                <BookOpen className="w-6 h-6" />
                故事預覽
              </h3>

              <div className="rounded-xl overflow-hidden shadow-inner mb-4 border-2 border-children-bg-secondary">
                <img
                  src={previewImage}
                  alt="故事風格預覽"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Assets/default-style-preview.png';
                  }}
                />
              </div>

              {formState.isGenerated && storyId ? (
                <div className="animate-fade-in space-y-4">
                  <div className="text-green-500 text-lg font-bold flex items-center justify-center gap-2">
                    <span>🎉</span> 故事創作完成！
                  </div>
                  <Button
                    onClick={handleStartStory}
                    variant="success"
                    size="lg"
                    className="w-full py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    開始閱讀故事
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed">
                  💡 填寫左側表單後，點擊「生成我的故事」按鈕，就能看到你專屬的故事書！
                </p>
              )}
            </div>

            {/* 小提示卡片 */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-600">
              <p className="font-bold mb-1">💡 小撇步</p>
              <p>描述越詳細，生成的故事越精彩喔！試著描述角色的外觀、性格和發生了什麼有趣的事。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedForm;