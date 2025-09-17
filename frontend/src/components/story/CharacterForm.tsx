import React from 'react';
import { CharacterManager } from '../../utils/formHelpers';
import '../../styles/ChildrenTheme.css';

interface CharacterFormProps {
  mainCharacter: string;
  otherCharacters: string[];
  onMainCharacterChange: (value: string) => void;
  onOtherCharactersChange: (characters: string[]) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  mainCharacter,
  otherCharacters,
  onMainCharacterChange,
  onOtherCharactersChange,
  disabled = false,
  errors = {}
}) => {
  const handleAddCharacter = () => {
    const newCharacters = CharacterManager.addCharacter(otherCharacters);
    onOtherCharactersChange(newCharacters);
  };

  const handleRemoveCharacter = (index: number) => {
    const newCharacters = CharacterManager.removeCharacter(otherCharacters, index);
    onOtherCharactersChange(newCharacters);
  };

  const handleUpdateCharacter = (index: number, value: string) => {
    const newCharacters = CharacterManager.updateCharacter(otherCharacters, index, value);
    onOtherCharactersChange(newCharacters);
  };

  return (
    <div className="children-card">
      <label className="children-label">
        👥 故事角色設定
      </label>
      
      {/* 主角色輸入 */}
      <div style={{ marginBottom: '20px' }}>
        <label className="children-label" style={{ fontSize: '16px', marginBottom: '8px' }}>
          🌟 主角色名字
        </label>
        <input
          type="text"
          className="children-input"
          value={mainCharacter}
          onChange={(e) => onMainCharacterChange(e.target.value)}
          placeholder="輸入主角色的名字..."
          disabled={disabled}
          style={{
            borderColor: errors.mainCharacter ? '#ff6b6b' : undefined
          }}
        />
        {errors.mainCharacter && (
          <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>
            ⚠️ {errors.mainCharacter}
          </div>
        )}
      </div>

      {/* 其他角色輸入 */}
      <div>
        <label className="children-label" style={{ fontSize: '16px', marginBottom: '12px' }}>
          👫 其他角色
        </label>
        
        {otherCharacters.map((character, index) => (
          <div key={index} className="children-row" style={{ marginBottom: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="children-input"
                value={character}
                onChange={(e) => handleUpdateCharacter(index, e.target.value)}
                placeholder={`角色 ${index + 2} 的名字...`}
                disabled={disabled}
                style={{ marginBottom: 0 }}
              />
            </div>
            <button
              onClick={() => handleRemoveCharacter(index)}
              className="children-btn children-btn-warning"
              disabled={disabled}
              style={{ 
                marginLeft: '12px',
                padding: '12px 20px',
                minWidth: 'auto'
              }}
            >
              🗑️ 刪除
            </button>
          </div>
        ))}
        
        {/* 新增角色按鈕 */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={handleAddCharacter}
            className="children-btn children-btn-secondary"
            disabled={disabled}
          >
            ➕ 新增角色
          </button>
        </div>
        
        {errors.characters && (
          <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            ⚠️ {errors.characters}
          </div>
        )}
        
        {!errors.characters && (
          <div style={{ color: '#4ecdc4', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            💡 最多可以添加 5 個角色，讓故事更精彩！
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterForm;