'use strict';

/*const args = process.argv.slice(2);
console.log('传入参数：', args);
let key = 'defaultKey';
for(let i in args) {
    let snippet = args[i];
    if(!key){
        //获得key
        let keyMatcher = /^--key=([\w\d]+)/.exec(snippet);
        if (keyMatcher) {
            key = keyMatcher[1];
            break;
        }
    }
}*/
const argv = require('yargs').argv;
const { spawn } = require('child_process');

if(argv.nginx) {
    require('./build').then(()=>{
        const targetFolder = `D://Server/nginx-1.17.0/html/${argv.nginx}`;
        console.log(`开始部署文件到nginx目录${targetFolder}`);
        spawn('rmdir', [targetFolder]);
        spawn('mkdir', [targetFolder]);
        spawn('robocopy', ['build', targetFolder, '/e', '/s'], );
        console.log('文件复制成功');
    });

}

//spawn('rmdir', [targetFolder]);

/*
require('./build');
let nodeCmd = require('node-cmd');
if(argv.nginx){
    let targetFolder = `D://Server/nginx-1.17.0/html/${argv.nginx}/`;
    console.log(`开始部署文件到nginx目录${targetFolder}`);
    nodeCmd.run(`rm ${targetFolder}`);
    nodeCmd.run(`mkdir ${targetFolder}`);
    nodeCmd.run(`cp /build/!* d:/server/nginx/html/${argv.nginx}`);
    console.log('文件复制成功，启动nginx服务');
    nodeCmd.run(`D://Server/nginx-1.17.0/nginx.exe`);
}*/
