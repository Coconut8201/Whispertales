import illustriousStorybook from '../images/illustrious_storybook_landscapes_animals.png';

const Test = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '0px', 
            alignItems: 'center',
            maxWidth: '100%',
        }}>
            <div style={{ 
                width: '50%',
                overflow: 'hidden', 
                position: 'relative',
                borderRight: '1px solid #ccc'
            }}>
                <img 
                    src={illustriousStorybook}
                    alt="左側頁面"
                    style={{ 
                        width: '200%',  // 設為200%使圖片實際大小
                        height: 'auto',
                        display: 'block'
                    }}
                />
            </div>
            <div style={{ 
                width: '50%',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <img 
                    src={illustriousStorybook}
                    alt="右側頁面"
                    style={{ 
                        width: '200%',  // 設為200%使圖片實際大小
                        height: 'auto',
                        display: 'block',
                        transform: 'translateX(-50%)'  // 使用 transform 替代 marginLeft
                    }}
                />
            </div>
        </div>
    );
};

export default Test;
