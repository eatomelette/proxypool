const request = require('request')
BaseCrawler = require('../crawlers/BaseCrawler')
const testconfig = require('../config').test

var OPTION = {
    timeout: testconfig.TIMEOUT,
    time: true
}

const TARGETURL = `https://httpbin.org/ip`

class Tester extends BaseCrawler{
    /**
     * 
     * @param {object} proxies 代理列表[ip:port,...]
     */
    constructor(proxies){
        super()
        this.proxies = proxies;
        this.option = OPTION
    };

    async testOne(proxy){
        this.option.proxy = `http://${proxy}`;
        return new Promise((resolve)=>{
            this.retryFetch(TARGETURL)
            .then(req=>{
                let ip = JSON.parse(req.body).origin;
                if(ip==proxy.split(":")[0]){
                    resolve({host:proxy, delay:req.delay});
                }else{resolve(`Error:origin Ip != host`)}
            })
            .catch(err=>console.log(err), resolve(err.toString()))
        });
    };
/**
 * 返回值 {host:proxy, delay:delay}
 */
    test(){
        const _add = (a1, a2)=>a1.concat(a2);
        const f = (a)=>typeof(a)=='string'? false: true;
        let _promises = this.proxies.map(p=>testOne(p));
        let _res = await Promise.all(_promises)
        return _res.fillter(f).reduce(_add,[])
    };

};

module.exports = Tester