/**
 * 当前文件用于配置从前端服务传递到前端浏览器参数
 * module.exports的数据在前端JS中可以通过全局的process.env对象获得对应的值
 * 通常用于存放项目个性化的配置数据，例如连接服务，项目名称、项目唯一id等
 * 重置这些参数需要重新编译NodeJS项目
 * @type {any}
 */
const commandArgs = require('yargs').argv;
module.exports = {
    //从入口JS的参数appKey中获得对应的appKey值
    appKey              : commandArgs.appKey || 'defaultAppKey',
    hydrocarbonServer   : commandArgs.hydrocarbonServer || 'http://47.100.187.235:7080/hydrocarbon-api/'
}