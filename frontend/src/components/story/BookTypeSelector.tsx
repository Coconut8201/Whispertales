import React from 'react';
import '../../styles/ChildrenTheme.css';

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
    <div className="children-card">
      <label className="children-label">
        📚 選擇繪本種類
      </label>
      <select
        className="children-select"
        value={selectedBookType}
        onChange={(e) => onBookTypeChange(e.target.value)}
        disabled={disabled}
        style={{
          borderColor: error ? '#ff6b6b' : undefined
        }}
      >
        <option value="">請選擇繪本種類</option>
        {bookTypeOptions.map((bookType, index) => (
          <option key={index} value={bookType}>
            📖 {bookType}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>
          ⚠️ {error}
        </div>
      )}
      {!selectedBookType && !error && (
        <div style={{ color: '#74b9ff', fontSize: '14px', marginTop: '8px' }}>
          💡 選擇想要創作的繪本類型！
        </div>
      )}
    </div>
  );
};

export default BookTypeSelector;