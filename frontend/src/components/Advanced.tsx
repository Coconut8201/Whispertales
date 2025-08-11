import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GenStory, getVoiceList } from "../utils/tools/fetch";
import { sdmodel, sdmodel_list } from "../utils/sdmodel_list";
import "../styles/Advanced.css";
import { roleRelative } from "../utils/tools/roleRelateList";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons';
import { bookType } from "../utils/bookType";

const options: sdmodel[] = sdmodel_list;
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Advanced: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("query") || "無搜索內容";
  const styleOptions = [
    searchQuery,
    ...options.map((option) => option.show_name),
  ];
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>(searchQuery);
  const [character1, setCharacter1] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [characters, setCharacters] = useState<string[]>([""]);
  const [storyId, setStoryId] = useState<string>("66a52f72b5993b79132a3fac");
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isLoad, setIsLoad] = useState<string>("");
  const [reLoad, setReLoad] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(
    "src/images/StorybookRedmond.png"
  );
  const [voiceOptions, setVoiceOptions] = useState<string[]>([]);
  const [bookTypeOptions, setBookTypeOptions] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedBookType, setSelectedBookType] = useState<string>("");
  const [isTemplateAccordionOpen, setIsTemplateAccordionOpen] =
    useState<boolean>(false);
  const [relationships, setRelationships] = useState([{ characterA: '', characterB: '', relation: '' }]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);  // 添加 ref 來存儲 recognition 實例

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = true;

    let lastResult = '';  // 追蹤上一次的結果

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {  // 從 resultIndex 開始
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          if (transcript !== lastResult) {  // 只有當結果不同時才添加
            finalTranscript += transcript;
            lastResult = transcript;
          }
        }
      }
      if (finalTranscript) {
        setDescription(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('語音識別錯誤:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {  // 如果還在錄音狀態，就重新開始錄音
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const addCharacter = () => {
    setCharacters([...characters, ""]);
  };

  const removeCharacter = (index: number) => {
    const newCharacters = [...characters];
    newCharacters.splice(index, 1);
    setCharacters(newCharacters);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("請輸入故事內容");
      return;
    }
    // if (!selectedVoice) {
    //   alert("請選擇語音");
    //   return;
    // }
    if (!selectedBookType) {
      alert("請選擇繪本種類");
      return;
    }
    const targetModel = options.find(
      (model) => model.show_name === selectedStyle
    );
    setIsLoad("loading"); // 設置為loading狀態
    const formattedRelationship = formatRelationships();
    const data = {
      style: targetModel?.sd_name || "fantasyWorld_v10.safetensors",
      bookType: selectedBookType,
      mainCharacter: character1,
      description,
      otherCharacters: characters.filter((character) => character !== ""),
      sdModelId: targetModel?.sdModelId || "",
      relationships: formattedRelationship,
    };

    const result = await GenStory(data, selectedVoice);
    setIsLoad("finish"); // 設置為finish狀態
    if (result && result.success) {
      setIsGenerated(true);
      setStoryId(result.storyId);
      console.log("API 回應:", result);
    } else {
      setReLoad(true);
      setIsLoad(""); // 重置loading狀態
      console.error("提交失敗或出錯");
    }
  };

  const handleSubmitReGen = async () => {
    console.log("handleSubmitReGen");
    handleSubmit();
    setReLoad(false);
  };

  const handleStartStory = () => {
    navigate(`/style/role/startStory?query=${encodeURIComponent(storyId)}`);
  };

  useEffect(() => {
    const targetImage = options.find(
      (model) => model.show_name === selectedStyle
    );
    if (targetImage) {
      setImageSrc(targetImage.image_path);
    }
  }, [selectedStyle]);

  useEffect(() => {
    setBookTypeOptions(bookType);
    const fetchVoiceList = async () => {
      const result = await getVoiceList();
      console.log(`語音列表結果:`, result);
      if (result.success && Array.isArray(result.data)) {
        setVoiceOptions(result.data);
      } else {
        console.error("獲取語音列表失敗:", result.message);
      }
    };

    fetchVoiceList();
  }, []);

  const addRelationship = () => {
    setRelationships([...relationships, { characterA: '', characterB: '', relation: '' }]);
  };

  const removeRelationship = (index: number) => {
    const newRelationships = relationships.filter((_, i) => i !== index);
    setRelationships(newRelationships);
  };

  const updateRelationship = (index: number, field: string, value: string) => {
    const newRelationships = [...relationships];
    newRelationships[index] = { ...newRelationships[index], [field]: value };
    setRelationships(newRelationships);
  };

  const formatRelationships = () => {
    return relationships
      .filter(rel => rel.characterA && rel.characterB && rel.relation)
      .map(rel => ({
        role1: rel.characterA,
        role2: rel.characterB,
        role12Relative: rel.relation
      }));
  };

  return (
    <div className="container-fluid">
      <div className={`overlay ${isLoad === "loading" ? "visible" : ""}`}>
        <div className="loading">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className="header text-center py-3">
        <div className="header-content">WHISPER TALES</div>
        <button onClick={() => navigate('/bookmanage')} className="login">
          書本管理
        </button>
        <button onClick={() => navigate('/voice')} className="login">
          語音管理
        </button>
        <button onClick={() => navigate('/style')} className="login-in">
          返回故事生成
        </button>
      </div>
      <div className="content-container">
        <div className="form-section">
          <div className="form-content">
            {/* 語音與下拉式選單 */}
            <div className="row align-items-center mb-4">
              <div className="col-md-3 d-flex align-items-center justify-content-end">
                <label htmlFor="voice" className="label-spacing">
                  語&emsp;&emsp;音：
                </label>
              </div>
              <div className="col-md-9">
                <select
                  id="voice"
                  className="form-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <option key="default" value="">
                    請選擇語音
                  </option>
                  {voiceOptions.map((voice, index) => (
                    <option key={index} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
            </div>           
            {/* 繪本分類 */}
            <div className="row align-items-center mb-4">
              <div className="col-md-3 d-flex align-items-center justify-content-end">
                <label htmlFor="voice" className="label-spacing">
                  繪本種類：
                </label>
              </div>
              <div className="col-md-9">
                <select
                  id="voice"
                  className="form-select"
                  value={selectedBookType}
                  onChange={(e) => setSelectedBookType(e.target.value)}
                >
                  <option key="default" value="">
                    請選擇繪本種類
                  </option>
                  {bookTypeOptions.map((bookType, index) => (
                    <option key={index} value={bookType}>
                      {bookType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* 風格與下拉式選單 */}
            <div className="row align-items-center mb-4">
              <div className="col-md-3 d-flex align-items-center justify-content-end">
                <label htmlFor="style" className="label-spacing">
                  風&emsp;&emsp;格：
                </label>
              </div>
              <div className="col-md-9">
                <select
                  id="style"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  {styleOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 角色與文字輸入框 */}
            <div className="row align-items-center mb-4">
              <div className="col-md-3 d-flex align-items-center justify-content-end">
                <label htmlFor="character1" className="label-spacing">
                  角&emsp;&ensp;色1：
                </label>
              </div>
              <div className="col-md-9">
                <input
                  style={{ backgroundColor: "RGB(231, 232, 238)" }}
                  id="character1"
                  type="text"
                  value={character1}
                  onChange={(e) => setCharacter1(e.target.value)}
                  placeholder="角色名字"
                />
              </div>
            </div>

            {/* 動態角色區塊 */}
            {characters.map((character, index) => (
              <div key={index} className="row align-items-center mb-4">
                <div className="col-md-3 d-flex align-items-center justify-content-end">
                  <label
                    htmlFor={`character${index + 2}`}
                    className="label-spacing"
                  >
                    {`角\u2003\u2002色${index + 2}`}：
                  </label>
                </div>
                <div className="col-md-6">
                  <input
                    style={{ backgroundColor: "RGB(231, 232, 238)" }}
                    id={`character${index + 2}`}
                    type="text"
                    value={character}
                    onChange={(e) => {
                      const newCharacters = [...characters];
                      newCharacters[index] = e.target.value;
                      setCharacters(newCharacters);
                    }}
                    placeholder={`角色名字`}
                  />
                </div>
                <div className="col-md-3">
                  <button
                    onClick={() => removeCharacter(index)}
                    className="btn button-submit"
                  >
                    刪除角色
                  </button>
                </div>
              </div>
            ))}

            {/* 新增角色按鈕 */}
            <div className="row align-items-center mb-4">
              <div className="col-md-12 text-center">
                <button onClick={addCharacter} className="btn button-submit">
                  新增角色
                </button>
              </div>
            </div>

            {/* 進階角設定 */}
            <div className="row align-items-start mb-4">
              <div className="col-md-3 d-flex align-items-start justify-content-end">
                <label htmlFor="advanced-settings" className="label-spacing">
                  進階設定：
                </label>
              </div>
              <div className="col-md-9">
                <div className="accordion-wrapper">
                  <div className="accordion-container">
                    <div
                      className="accordion-header"
                      onClick={() =>
                        setIsTemplateAccordionOpen(!isTemplateAccordionOpen)
                      }
                    >
                      <span>進階角色設定</span>
                      <span
                        className={`accordion-icon ${isTemplateAccordionOpen ? "open" : ""
                          }`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                  {isTemplateAccordionOpen && (
                    <div className="accordion-content">
                      <div className="relationship-setting d-flex flex-wrap align-items-center">

                      </div>
                      {relationships.map((rel, index) => (
                        <div key={index} className="relationship-setting d-flex flex-wrap align-items-center mb-2">
                          <div className="me-2 mb-2 mb-md-0">
                            <select
                              className="form-select form-select-sm fixed-width-select truncate-text"
                              value={rel.characterA}
                              onChange={(e) => updateRelationship(index, 'characterA', e.target.value)}
                            >
                              <option value="">角色1</option>
                              {[character1, ...characters].filter(char => char).map((char, i) => (
                                <option key={i} value={char}>{char}</option>
                              ))}
                            </select>
                          </div>
                          <div className="me-2 mb-2 mb-md-0">與</div>
                          <div className="me-2 mb-2 mb-md-0">
                            <select
                              className="form-select form-select-sm fixed-width-select truncate-text"
                              value={rel.characterB}
                              onChange={(e) => updateRelationship(index, 'characterB', e.target.value)}
                            >
                              <option value="">角色2</option>
                              {[character1, ...characters].filter(char => char && char !== rel.characterA).map((char, i) => (
                                <option key={i} value={char}>{char}</option>
                              ))}
                            </select>
                          </div>
                          <div className="me-2 mb-2 mb-md-0">的關係為</div>
                          <div className="d-flex align-items-center mb-2 mb-md-0">
                            <select
                              className={`form-select form-select-sm fixed-width-select truncate-text ${index === 0 ? 'relation-select-first' : ''}`}
                              value={rel.relation}
                              onChange={(e) => updateRelationship(index, 'relation', e.target.value)}
                            >
                              <option value="">關係</option>
                              {roleRelative.map((relation, i) => (
                                <option key={i} value={relation}>{relation}</option>
                              ))}
                            </select>
                            {index > 0 && (
                              <button
                                className="btn btn-sm btn-link text-danger ms-1 p-0 d-flex align-items-center justify-content-center"
                                onClick={() => removeRelationship(index)}
                                style={{ width: '20px', height: '20px' }}
                              >
                                <FontAwesomeIcon icon={faMinus} size="xs" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        className="btn btn-sm btn-primary mt-2 d-flex align-items-center"
                        onClick={addRelationship}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        新增角色關係
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 內容與文字輸入框 */}
            <div className="row align-items-start mb-4">
              <div className="col-md-3 d-flex align-items-end justify-content-end">
                <label htmlFor="description" className="textarea-label">
                  內 &emsp;&ensp; 容 :
                </label>
              </div>
              <div className="col-md-9 d-flex align-items-end">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="故事內容(必填)"
                  required
                  style={{
                    height: "210px",
                    backgroundColor: "RGB(231, 232, 238)",
                    border: description ? "1px solid #ced4da" : "1px solid #dc3545"
                  }}
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`btn ${isRecording ? 'btn-danger' : 'btn-success'} ms-2`}
                >
                  <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
                </button>
              </div>
            </div>

            {/* 按鈕區塊 */}
            <div className="row mb-4">
              <div className="col-md-9 offset-md-3 text-center">
                <button onClick={handleSubmit} className="btn button-submit">
                  生成
                </button>
                <button className="btn button-submit">清除</button>
              </div>
              {reLoad && (
                <div className="col-md-9 offset-md-3 text-center">
                  <button
                    onClick={handleSubmitReGen}
                    className="btn button-submit"
                  >
                    重新生成
                  </button>
                </div>
              )}
            </div>

            {isLoad === "loading" && <p>loading</p>}
            {isLoad === "finish" && <p>load finish</p>}
          </div>
        </div>
        <div className="image-section">
          <div className="image-container">
            <img src={imageSrc} alt="Preview" className="preview-image" />
          </div>
          {isGenerated && (
            <button onClick={handleStartStory} className="button-secondary">
              <div className="triangle-icon"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advanced;
