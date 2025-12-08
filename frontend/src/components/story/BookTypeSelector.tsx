import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen } from 'lucide-react';

interface BookTypeSelectorProps {
  selectedBookType: string;
  bookTypeOptions: string[];
  onBookTypeChange: (bookType: string) => void;
  disabled?: boolean;
  error?: string;
}

const BookTypeSelector: React.FC<BookTypeSelectorProps> = ({
  selectedBookType,
  bookTypeOptions,
  onBookTypeChange,
  disabled = false,
  error
}) => {
  return (
    <Card className={`h-full border-2 shadow-children-sm hover:shadow-children-md transition-all ${error ? 'border-red-300' : 'border-children-primary/20'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${error ? 'text-red-500' : 'text-children-primary'}`}>
          <BookOpen className="w-5 h-5" />
          選擇繪本種類
        </CardTitle>
      </CardHeader>
      <CardContent>
        <select
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-children-primary/30 focus-visible:ring-children-primary'}`}
          value={selectedBookType}
          onChange={(e) => onBookTypeChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">請選擇繪本種類</option>
          {bookTypeOptions.map((bookType, index) => (
            <option key={index} value={bookType}>
              📖 {bookType}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-xs text-red-500 font-bold">
            ⚠️ {error}
          </p>
        )}
        {!selectedBookType && !error && (
          <p className="mt-2 text-xs text-blue-400">
            💡 選擇想要創作的繪本類型！
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BookTypeSelector;