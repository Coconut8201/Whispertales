import React from 'react';
import { CharacterManager } from '../../utils/formHelpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2, User, Users } from 'lucide-react';

interface CharacterFormProps {
  mainCharacter: string;
  otherCharacters: string[];
  onMainCharacterChange: (value: string) => void;
  onOtherCharactersChange: (characters: string[]) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

const CharacterForm = ({
  mainCharacter,
  otherCharacters,
  onMainCharacterChange,
  onOtherCharactersChange,
  disabled = false,
  errors = {}
}: CharacterFormProps) => {
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
    <Card className="border-2 border-children-primary/20 shadow-children-sm hover:shadow-children-md transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-children-primary flex items-center gap-2">
          <Users className="w-6 h-6" />
          故事角色設定
        </CardTitle>
        <CardDescription>
          設定故事中的主角和其他重要的配角
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 主角色輸入 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-children-text-primary flex items-center gap-2">
            <User className="w-4 h-4 text-children-accent" />
            主角色名字
          </label>
          <Input
            type="text"
            value={mainCharacter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMainCharacterChange(e.target.value)}
            placeholder="例如：勇敢的小老虎、聰明的愛麗絲..."
            disabled={disabled}
            className={`border-2 ${errors.mainCharacter ? 'border-red-400 focus-visible:ring-red-400' : 'border-children-primary/30 focus-visible:ring-children-primary'}`}
          />
          {errors.mainCharacter && (
            <p className="text-sm text-red-500 font-bold flex items-center gap-1">
              ⚠️ {errors.mainCharacter}
            </p>
          )}
        </div>

        {/* 其他角色輸入 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-children-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-children-secondary" />
              其他角色
            </label>
            <span className="text-xs text-children-text-secondary bg-children-bg-secondary px-2 py-1 rounded-full">
              目前 {otherCharacters.length} / 5 位
            </span>
          </div>

          <div className="space-y-3">
            {otherCharacters.map((character, index) => (
              <div key={index} className="flex gap-2 items-center group">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={character}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateCharacter(index, e.target.value)}
                    placeholder={`角色 ${index + 2} 的名字...`}
                    disabled={disabled}
                    className="border-2 border-children-secondary/30 focus-visible:ring-children-secondary bg-white"
                  />
                </div>
                <Button
                  onClick={() => handleRemoveCharacter(index)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  disabled={disabled}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          {/* 新增角色按鈕 */}
          <div className="pt-2">
            <Button
              onClick={handleAddCharacter}
              variant="outline"
              disabled={disabled || otherCharacters.length >= 5}
              className="w-full border-dashed border-2 hover:border-children-secondary hover:text-children-secondary transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增一位角色
            </Button>
          </div>

          {errors.characters ? (
            <p className="text-sm text-red-500 font-bold text-center mt-2">
              ⚠️ {errors.characters}
            </p>
          ) : (
            <p className="text-xs text-children-text-secondary text-center mt-2">
              💡 主角和配角會一起展開冒險喔！
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterForm;