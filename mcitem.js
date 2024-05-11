// ==UserScript==
// @name         宏图在线、考试星视频自动播放
// @namespace    https://github.com/mcitem
// @version      2024-05-11
// @description  宏图在线、考试星视频自动播放，由于不知道有没有倍速检测，干脆搞个简单脚本自动播放
// @author       MCitem
// @match        https://v.kaoshixing.com/exam/pc/course/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kaoshixing.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var enable = false;
    
    // 悬浮窗结构
    const floatingWindow = document.createElement('div');
    floatingWindow.style.position = 'fixed';
    floatingWindow.style.top = '10px';
    floatingWindow.style.right = '10px';
    // floatingWindow.style.backgroundColor = '#ffffff';
    floatingWindow.style.borderRadius = '5px';
    floatingWindow.style.padding = '10px';
    floatingWindow.style.zIndex = '9999';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '启动';
    const mylog = document.createElement('textarea');
    floatingWindow.appendChild(toggleButton);
    floatingWindow.appendChild(mylog);


    var toggleRUN = false; // 主执行器开关

    toggleButton.addEventListener('click', function() {
        if (!enable) {
            enable = true;
            toggleButton.textContent= "停止";
            console.log('main()');

            main();
            
        } else {
            enable = false;
            toggleButton.textContent= "启动";
            toggleRUN = false;
        }

    });
    var unfinished = []; // 未完成章节列表
    function main() {

        let itotal = Number(document.getElementsByClassName("finished-trifle")[0].innerText); //已完成章节数 != 应完成顺序
        let jtotal = Number(document.getElementsByClassName("total-trifle")[0].innerText);   //当前页章节总数

        if (itotal>=jtotal) {
            mylog.textContent="-1:本章节已全部完成";
            toggleButton.textContent = "执行结束";
            enable = false;
            return;
        }else if (itotal<jtotal) {

            //本页还有未完成的 开始加载
            const el = document.getElementsByClassName('catalog-item'); // 章节列表

            if ( el.length == jtotal ) {

                mylog.textContent = "加载成功1";
                // main_run
                console.log('mainrun');
                toggleRUN = true;

                //加载未完成列表
                const unfinished_dom = document.getElementsByClassName("el-progress__text");
                for (let i = 0; i < unfinished_dom.length; i++) {
                    if(unfinished_dom[i].innerText != "100%"){
                        unfinished.push(i+1);
                    }
                }
                console.log('unf',unfinished,unfinished.length); // denug

                if(unfinished.length>0){
                    run(itotal,jtotal,unfinished);
                }

            }else if(el.length != jtotal){
                mylog.textContent = "加载异常";
                return;
            }
            
        }
    }



    function run(itotal,jtotal,unfinished) {
        console.log("inrun");
        let i = 0;

        async function globalloop(itotal,jtotal) {

            const fin = document.getElementsByClassName("countdown");  //任务完成倒计时
            if(fin&&unfinished.length>=i+1){ // i 0,1,2...  //length 1,2,3...
                mylog.textContent = fin[0].innerText;

                if (fin[0].innerText=="00:00:00"&&
                    document.getElementsByClassName("el-progress__text")[unfinished[i]].innerText!='100%'
                ){
                    await PlayVideo(itotal+1); //播放视频
                    i = i + 1;
                }
            }

            if(toggleRUN){setTimeout(()=>globalloop(itotal,jtotal), 1000);}
        }
        globalloop(itotal,jtotal);
    }
    

    function PlayVideo(playNo) {
        return new Promise((resolve) => {

            let activeNo = GetActiveNo();
            const el = document.getElementsByClassName('catalog-item');

            if (playNo == activeNo) {
                console.log("已在未完成章节");
            } else if (playNo != activeNo) {
                console.log("切换章节");
                el[playNo - 1].click();
            }

            var VideoPlayed = false;
            async function loop(){

                if(activeNo == playNo){
                    // console.log("重载完成 启用播放");
                    const playVideoButton = document.getElementsByClassName("vjs-big-play-button");
                    playVideoButton[0].click();
                    console.log('resolve',document.getElementById("myVideo").classList.contains("vjs-playing"),document.getElementById("myVideo").classList.contains("vjs-has-started"),document.getElementsByClassName("countdown")[0].innerText);
                    if (document.getElementById("myVideo").classList.contains("vjs-playing")&&
                        document.getElementById("myVideo").classList.contains("vjs-has-started")&&
                        document.getElementsByClassName("countdown")[0].innerText=="00:00:00"
                    ){
                        // console.log("resolve ending ");
                        resolve();
                        VideoPlayed = true;
                    }
                }
                if(!VideoPlayed){setTimeout(loop, 1000);}
            }
            loop();
        });
    };

    // 获取当前所在的章节数
    function GetActiveNo(){
        const el = document.getElementsByClassName('catalog-item');
        for (let i = 0; i < el.length; i++) {
            if (el[i].classList.contains("active")) {
            //activeNo 1,2,3,4...
            return i+1;
            }
        }
    }

    document.body.appendChild(floatingWindow);
})();