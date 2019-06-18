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
console.log(argv);
console.log('Key是', argv.key);