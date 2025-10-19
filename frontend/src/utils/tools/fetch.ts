// import { storyInterface } from "../../components/StartStory";
import { apis } from "./api"; // 假設這是你的 API 配置文件的路徑
import { ResponseHandler } from "../responseHandler";

// bookManageList 類型定義
interface bookManageList {
  bookId: string;
  bookName: string;
  bookFirstImageBase64?: string;
}

// storyInterface 類型定義
interface storyInterface {
  storyId: string;
  [key: string]: any;
}

// 定義 GenStory 函數，它接收 RoleForm 對象並返回 Promise
export async function GenStory(
  RoleForm: Object,
  voiceModelName: string,
): Promise<any> {
  let playload = {
    roleform: RoleForm,
    voiceModelName: voiceModelName,
  };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);

    const response = await fetch(apis.LLMGenStory, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      console.error("提交失敗:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("提交時出錯:", error);
    return 1;
  }
}

export async function StartStory_api(storyIdinput: string): Promise<any> {
  try {
    const response = await fetch(apis.startStory, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storyId: storyIdinput }),
    });
    if (!response.ok) {
      throw new Error(`StartStory_api error! status: ${response.status}`);
    }
    const option_json: storyInterface = await response.json();
    return option_json;
  } catch (error) {
    console.error("StartStory_api, Failed to fetch story:", error);
    throw error;
  }
}

export async function makeZhuyin(
  storyTale: string,
): Promise<string[][] | { error: boolean; message: string }> {
  if (!storyTale) {
    return { error: true, message: "文字不能為空" };
  }

  try {
    const response = await fetch(apis.makeZhuyin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ text: storyTale }),
    });

    if (!response.ok) {
      throw new Error(
        `makeZhuyin API responded with status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.zhuyin;
  } catch (error) {
    console.error("makeZhuyin error:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "轉換注音失敗",
    };
  }
}

export async function GetVoice(
  storyId: string,
  pageIndex: number,
): Promise<Blob | null> {
  try {
    const playload = {
      storyId: storyId,
      pageIndex: pageIndex,
    };
    console.log(`playload: ${JSON.stringify(playload)}`);
    const response = await fetch(apis.GetVoice, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playload),
    });

    // 如果狀態碼是 404，返回 null 而不是拋出錯誤
    if (response.status === 404) {
      console.log("找不到對應的音頻文件");
      return null;
    }

    if (!response.ok) {
      throw new Error(`GetVoice error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.log("GetVoice, Failed to fetch audio:", error);
    return null; // 返回 null 而不是拋出錯誤
  }
}

export async function UploadVoice(
  audioBlob: Blob,
  audioName: string,
): Promise<{ result: boolean; message: string }> {
  const formData = new FormData();
  formData.append("files", audioBlob, `${audioName}.wav`);
  formData.append("audioName", audioName);

  try {
    const response = await fetch(apis.uploadVoice, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (response.ok) {
      return { result: true, message: "UploadVoice success" };
    } else {
      const errorMessage = `UploadVoice failed with status: ${response.status}`;
      console.log(errorMessage);
      return { result: false, message: errorMessage };
    }
  } catch (error) {
    const errorMessage = `UploadVoice failed: ${error}`;
    console.log(errorMessage);
    return { result: false, message: errorMessage };
  }
}

export async function userLogin(
  userName: string,
  userPassword: string,
): Promise<{
  success: boolean;
  user?: { id: string; username: string };
  token?: string;
}> {
  // 使用統一的響應處理器
  const result = await ResponseHandler.post<{ id: string; username: string }>(
    apis.userLogin,
    { userName, userPassword },
  );

  if (result.success && result.data) {
    console.log("登入成功");
    return {
      success: true,
      user: result.data, // data 中包含 { id, username }
    };
  } else {
    console.error("登入失敗：", result.message);
    return {
      success: false,
    };
  }
}

export async function userLogout(): Promise<{ success: boolean }> {
  try {
    // 1. 先發送登出請求
    const response = await fetch(apis.userLogout, {
      method: "GET",
      credentials: "include",
    });

    // 2. 無論伺服器回應如何，都清除本地 cookie
    const domains = ["", ".localhost", window.location.hostname];
    const paths = ["/", "/api"];

    // 使用純 JavaScript 清除 cookie
    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? `; domain=${domain}` : ""}; samesite=lax;`;
      });
    });

    // 3. 處理伺服器回應
    if (!response.ok) {
      console.error("登出請求失敗：", response.statusText);
      return { success: false };
    }

    const data = await response.json();
    return { success: data.success || false };
  } catch (error) {
    console.error("登出過程中發生錯誤：", error);
    return { success: false };
  }
}

export async function userRegister(
  userName: string,
  userPassword: string,
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    const response = await fetch(apis.userRegister, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: userName, userPassword: userPassword }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      if (data.success) {
        return { success: true, code: 200, message: "註冊成功" };
      } else {
        console.error(`註冊失敗：HTTP狀態碼 ${data.status} ${data.message}`);
        return { success: false, code: data.status, message: data.message };
      }
    } else {
      if (response.status === 200) {
        const textResponse = await response.text();
        if (
          textResponse.includes("SaveNewUser") &&
          textResponse.includes("success")
        ) {
          return { success: true, code: 200, message: "註冊成功" };
        }
      }
      const textResponse = await response.text();
      console.error(`註冊失敗：非JSON回應 ${response.status} ${textResponse}`);
      return { success: false, code: response.status, message: textResponse };
    }
  } catch (error) {
    console.error("註冊過程中發生錯誤：", error);
    return {
      success: false,
      code: 500,
      message: error instanceof Error ? error.message : "未知錯誤",
    };
  }
}

export async function getVoiceList(): Promise<{
  success: boolean;
  code: number;
  message: string;
  data?: any;
}> {
  try {
    const response = await fetch(apis.getVoiceList, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log("data.listData: ", data.listData);
      return {
        success: true,
        code: 200,
        message: "獲取語音列表成功",
        data: data.listData,
      };
    } else {
      const errorMessage = `獲取語音列表失敗：HTTP狀態碼 ${response.status}`;
      console.error(errorMessage);
      return { success: false, code: response.status, message: errorMessage };
    }
  } catch (error) {
    console.error("獲取語音列表過程中發生錯誤：", error);
    return {
      success: false,
      code: 500,
      message: error instanceof Error ? error.message : "未知錯誤",
    };
  }
}

export async function verifyAuth(): Promise<{ isAuthenticated: boolean }> {
  try {
    const response = await fetch(apis.verifyAuth, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    // console.log('完整響應:', response);
    // console.log('響應頭:', Object.fromEntries(response.headers));

    if (response.ok) {
      return { isAuthenticated: true };
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error("verifyAuth fail:", error);
    return { isAuthenticated: false };
  }
}

export async function getBookList(): Promise<any> {
  try {
    const response = await fetch(apis.GetStoryList, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseData: {
      success: boolean;
      data?: bookManageList;
      message: string;
    } = await response.json();
    if (!response.ok || !responseData.data) {
      return;
    }
    return responseData.data;
  } catch (error) {
    console.error("getBookList fail: ", error);
    return;
  }
}

export async function verifyStoryOwnership(
  storyId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${apis.verifyStoryOwnership}?storyId=${storyId}`,
      {
        method: "GET",
        credentials: "include", // 添加認證信息
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const responseData: { success: boolean; message: string } =
      await response.json();
    if (!response.ok || !responseData.success) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("verifyStoryOwnership fail: ", error);
    return { success: false };
  }
}

export async function genImagePrompt(
  storyArray: string[],
  storyId: string,
  roleform: any,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(apis.GenImagePrompt, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storyArray,
        storyId,
        roleform,
      }),
    });

    const responseData: { success: boolean; message: string } =
      await response.json();
    if (!response.ok || !responseData.success) {
      return {
        success: false,
        message: responseData.message || `HTTP Error: ${response.status}`,
      };
    }
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("genImagePrompt fail: ", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "生成圖片提示詞失敗",
    };
  }
}
