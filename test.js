async function sleep(){
    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function main(){
    return new Promise((resolve) => {
        sleep().then(() => {resolve();});
    });
}

async function main_run_test(){
    return new Promise((resolve)=>{

        return new Promise((resolve)=>{
            setTimeout(resolve, 10000);
        }).then(()=>{
            console.log('完成');
            resolve();

        });
    })
}

main().then(() => {
    console.log('done');
});
main_run_test().then(() => {
    console.log('done');
});
