import { BrowserRouter, Routes, Route } from "react-router-dom";

import Instruction from './view/Instruction';
import UserSetting from './view/UserSetting';
import Faq from './view/Faq';
import AboutUs from './view/AboutUs';

import Creating from "./components/Creating";
import Voice from "./components/Voice";
import Advanced from "./components/Advanced";
import StartStory from "./components/StartStory";

import MyBook from "./components/Mybook";
import PdfTest from "./components/PdfTest";
import Login from "./components/Login";
import Register from "./components/Register";
import BookManage from "./components/BookManage";
import Test from "./components/Test";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            {/** http://localhost:3151/login */}
            <Route path="login" element={<Login />}></Route>
            {/** http://localhost:3151/login/register */}
            <Route path="login/register" element={<Register />}></Route>
            {/** http://localhost:3151/style */}
            <Route path="style" element={<Creating />}></Route>
            {/** http://localhost:3151/style/role */}
            <Route path="style/role" element={<Advanced />}></Route>
            {/** http://localhost:3151/style/role/startStory */}
            <Route path="style/role/startStory" element={<StartStory />}></Route>
            {/** http://localhost:3151/voice */}
            <Route path="voice" element={<Voice />}></Route>
            {/** http://localhost:3151/bookmanage */}
            <Route path="bookmanage" element={<BookManage />}></Route>

            {/**  http://localhost:3151/generate/mybook */}
            <Route path="mybook" index element={<MyBook />} ></Route>

            {/**  http://localhost:3151/generate/PdfTest */}
            <Route path="PdfTest" index element={<PdfTest />} ></Route>
          </Route>

          <Route path="/">
            {/* http://localhost:3151/instruction */}
            <Route path='instruction' element={<Instruction />}></Route>
            {/* {http://localhost:3151/user_setting} */}
            <Route path='user_setting' element={<UserSetting />}></Route>
            {/* {http://localhost:3151/faq} */}
            <Route path='faq' element={<Faq />}></Route>
            {/* {http://localhost:3151/about_us} */}
            <Route path='about_us' element={<AboutUs />}></Route>
            {/* {http://localhost:3151/test} */}
            <Route path='test' element={<Test />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
