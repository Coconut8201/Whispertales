import React, { useState } from 'react';
import { CharacterRelationship, RelationshipManager, CharacterManager } from '../../utils/formHelpers';
import { roleRelative } from '../../utils/tools/roleRelateList';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2, HeartHandshake } from 'lucide-react';

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
    <Card className="border-2 border-children-info/20 shadow-children-sm hover:shadow-children-md transition-all">
      <CardHeader
        className="cursor-pointer pb-2 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-children-info flex items-center gap-2">
            <HeartHandshake className="w-5 h-5" />
            角色關係設定（可選）
          </CardTitle>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <p className="mb-4 text-sm text-gray-500">
            💡 設定角色之間的關係，讓故事更有趣！
          </p>

          <div className="space-y-3">
            {relationships.map((relationship, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm relative group">
                <div className="flex flex-wrap items-center gap-2">
                  {/* 角色A選擇 */}
                  <select
                    className="flex-1 min-w-[100px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={relationship.characterA}
                    onChange={(e) => handleUpdateRelationship(index, 'characterA', e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">選擇角色</option>
                    {allCharacters.map((char, i) => (
                      <option key={i} value={char}>{char}</option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-gray-400">和</span>

                  {/* 角色B選擇 */}
                  <select
                    className="flex-1 min-w-[100px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={relationship.characterB}
                    onChange={(e) => handleUpdateRelationship(index, 'characterB', e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">選擇角色</option>
                    {getAvailableCharactersB(relationship.characterA).map((char, i) => (
                      <option key={i} value={char}>{char}</option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-gray-400">是</span>

                  {/* 關係選擇 */}
                  <select
                    className="flex-1 min-w-[100px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={relationship.relation}
                    onChange={(e) => handleUpdateRelationship(index, 'relation', e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">選擇關係</option>
                    {roleRelative.map((relation, i) => (
                      <option key={i} value={relation}>{relation}</option>
                    ))}
                  </select>

                  {/* 刪除按鈕 */}
                  {index > 0 && (
                    <Button
                      onClick={() => handleRemoveRelationship(index)}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      disabled={disabled}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 新增關係按鈕 */}
          <div className="mt-4 text-center">
            <Button
              onClick={handleAddRelationship}
              variant="outline"
              disabled={disabled || allCharacters.length < 2}
              className="border-dashed border-2 hover:border-children-info hover:text-children-info"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增一組關係
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default RelationshipForm;