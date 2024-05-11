
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

document.body.appendChild(floatingWindow);

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

function sleep(ms=1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            console.log('unflist',unfinished,unfinished.length); // denug

            if(unfinished.length>0){
                mainrun(itotal,jtotal,unfinished);
            }

        }else if(el.length != jtotal){
            mylog.textContent = "加载异常";
            toggleButton.textContent = "异常";
            enable = false;
            return;
        }
        
    }
}

async function mainrun(itotal,jtotal,unfinished) {
    let i = 0;
    console.log('in_mainrun');
    while(toggleRUN){ //main loop
        await sleep();
        const fin = document.getElementsByClassName("countdown");
        if(fin&&unfinished.length>=i+1){ // i 0,1,2...  //length 1,2,3...
            mylog.textContent = fin[0].innerText;

            if (fin[0].innerText=="00:00:00"&&
                document.getElementsByClassName("el-progress__text")[unfinished[i]].innerText!='100%'
            ){
                await sleep(2000);
                await PlayVideo(itotal+1); //播放视频
                console.log('play',itotal+1);
                i = i + 1;
            }
        }
    }

}


function PlayVideo(playNo) {
    return new Promise(async (resolve) => {

        let activeNo = GetActiveNo();
        const el = document.getElementsByClassName('catalog-item');
        if (playNo == activeNo) {
            console.log("已在未完成章节");
        } else if (playNo != activeNo) {
            console.log("切换章节");
            el[playNo - 1].click();
        }
        let loop = true;

        while(loop){
            await sleep(1000);
            activeNo = GetActiveNo();
            if (activeNo == playNo) {
                const playVideoButton = document.getElementsByClassName("vjs-big-play-button");
                playVideoButton[0].click();
                if (document.getElementById("myVideo").classList.contains("vjs-playing")&&
                document.getElementById("myVideo").classList.contains("vjs-has-started")&&
                document.getElementsByClassName("countdown")[0].innerText!="00:00:00"
                ){
                    await sleep(1000);
                    resolve();
                    loop = false;
                }
            }
        };

    });
}
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