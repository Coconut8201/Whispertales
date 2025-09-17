import React, { useState } from 'react';
import { CharacterRelationship, RelationshipManager, CharacterManager } from '../../utils/formHelpers';
import { roleRelative } from '../../utils/tools/roleRelateList';
import '../../styles/ChildrenTheme.css';

interface RelationshipFormProps {
  relationships: CharacterRelationship[];
  mainCharacter: string;
  otherCharacters: string[];
  onRelationshipsChange: (relationships: CharacterRelationship[]) => void;
  disabled?: boolean;
}

const RelationshipForm: React.FC<RelationshipFormProps> = ({
  relationships,
  mainCharacter,
  otherCharacters,
  onRelationshipsChange,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const allCharacters = CharacterManager.getAllValidCharacters(mainCharacter, otherCharacters);
  
  // 如果角色少於2個，不顯示關係設定
  if (allCharacters.length < 2) {
    return null;
  }

  const handleAddRelationship = () => {
    const newRelationships = RelationshipManager.addRelationship(relationships);
    onRelationshipsChange(newRelationships);
  };

  const handleRemoveRelationship = (index: number) => {
    const newRelationships = RelationshipManager.removeRelationship(relationships, index);
    onRelationshipsChange(newRelationships);
  };

  const handleUpdateRelationship = (index: number, field: keyof CharacterRelationship, value: string) => {
    const newRelationships = RelationshipManager.updateRelationship(relationships, index, field, value);
    onRelationshipsChange(newRelationships);
  };

  const getAvailableCharactersB = (characterA: string) => {
    return allCharacters.filter(char => char !== characterA);
  };

  return (
    <div className="children-card">
      <div 
        className="children-accordion-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <span>🤝 角色關係設定（可選）</span>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ⬇️
        </span>
      </div>
      
      {isExpanded && (
        <div className="children-accordion-content">
          <div style={{ marginBottom: '16px', color: '#636e72', fontSize: '14px' }}>
            💡 設定角色之間的關係，讓故事更有趣！
          </div>
          
          {relationships.map((relationship, index) => (
            <div key={index} className="children-card" style={{ marginBottom: '16px', padding: '16px' }}>
              <div className="children-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* 角色A選擇 */}
                <div style={{ minWidth: '120px' }}>
                  <select
                    className="children-select"
                    value={relationship.characterA}
                    onChange={(e) => handleUpdateRelationship(index, 'characterA', e.target.value)}
                    disabled={disabled}
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  >
                    <option value="">選擇角色</option>
                    {allCharacters.map((char, i) => (
                      <option key={i} value={char}>{char}</option>
                    ))}
                  </select>
                </div>
                
                <span style={{ color: '#636e72', fontWeight: 'bold' }}>和</span>
                
                {/* 角色B選擇 */}
                <div style={{ minWidth: '120px' }}>
                  <select
                    className="children-select"
                    value={relationship.characterB}
                    onChange={(e) => handleUpdateRelationship(index, 'characterB', e.target.value)}
                    disabled={disabled}
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  >
                    <option value="">選擇角色</option>
                    {getAvailableCharactersB(relationship.characterA).map((char, i) => (
                      <option key={i} value={char}>{char}</option>
                    ))}
                  </select>
                </div>
                
                <span style={{ color: '#636e72', fontWeight: 'bold' }}>的關係是</span>
                
                {/* 關係選擇 */}
                <div style={{ minWidth: '120px' }}>
                  <select
                    className="children-select"
                    value={relationship.relation}
                    onChange={(e) => handleUpdateRelationship(index, 'relation', e.target.value)}
                    disabled={disabled}
                    style={{ fontSize: '14px', padding: '8px 12px' }}
                  >
                    <option value="">選擇關係</option>
                    {roleRelative.map((relation, i) => (
                      <option key={i} value={relation}>{relation}</option>
                    ))}
                  </select>
                </div>
                
                {/* 刪除按鈕 */}
                {index > 0 && (
                  <button
                    onClick={() => handleRemoveRelationship(index)}
                    className="children-btn children-btn-warning"
                    disabled={disabled}
                    style={{ 
                      padding: '8px 16px',
                      fontSize: '14px',
                      minWidth: 'auto'
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* 新增關係按鈕 */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handleAddRelationship}
              className="children-btn children-btn-secondary"
              disabled={disabled || allCharacters.length < 2}
            >
              ➕ 新增關係
            </button>
          </div>
          
          {allCharacters.length < 2 && (
            <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
              💡 需要至少 2 個角色才能設定關係
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelationshipForm;