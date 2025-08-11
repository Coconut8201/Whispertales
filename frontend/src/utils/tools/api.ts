// back_port = 7943;

export const enum apis {
    //dev
    startStory = `http://localhost:7943/story/startstory`,
    GetStoryList = `http://localhost:7943/story/getstorylist_fdb`,
    LLMGenStory = `http://localhost:7943/story/llm/genstory`,
    GenImagePrompt = `http://localhost:7943/story/llm/genimageprompt`,
    makeZhuyin = "http://localhost:7943/story/makezhuyin",
    GetVoice = `http://localhost:7943/voiceset/take_voice`,
    GetNewaudio = `https://163.13.202.128/audio`,
    getAllSDModel = `https://163.13.202.128/sd/sdapi/v1/sd-models`,
    uploadVoice = `http://localhost:7943/voiceset/uploadvoices`,
    userLogin = "http://localhost:7943/user/login",
    userRegister = "http://localhost:7943/user/adduser",
    getVoiceList = "http://localhost:7943/voiceset/getVoiceList",
    verifyAuth = "http://localhost:7943/user/verify-auth",
    verifyStoryOwnership = "http://localhost:7943/user/verify-ownership",
    userLogout = "http://localhost:7943/user/logout",


    // // using in Nginx
    // startStory = `https://163.13.202.128/api/story/startstory`,
    // GetStoryList = `https://163.13.202.128/api/story/getstorylist_fdb`,
    // LLMGenStory = `https://163.13.202.128/api/story/llm/genstory`,
    // GenImagePrompt = `https://163.13.202.128/api/story/llm/genimageprompt`,
    // makeZhuyin = "https://163.13.202.128/api/story/makezhuyin",
    // GetVoice = `https://163.13.202.128/api/voiceset/take_voice`,
    // GetNewaudio = `https://163.13.202.128/audio`,
    // getAllSDModel = `https://163.13.202.128/sd/sdapi/v1/sd-models`,
    // uploadVoice = `https://163.13.202.128/api/voiceset/uploadvoices`,
    // userLogin = "https://163.13.202.128/api/user/login",
    // userRegister = "https://163.13.202.128/api/user/adduser",
    // getVoiceList = "https://163.13.202.128/api/voiceset/getVoiceList",
    // verifyAuth = "https://163.13.202.128/api/user/verify-auth",
    // verifyStoryOwnership = "https://163.13.202.128/api/user/verify-ownership",
    // userLogout = "https://163.13.202.128/api/user/logout",
}
