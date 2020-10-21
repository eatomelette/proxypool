const request = require('request');
const proxyconfig = require('../config').proxy
const path = require('path');
const { html } = require('cheerio');

const fake_UA = ()=>{
  return new Promise((reslove,reject)=>{
    fs.readFile(path.join(__dirname, 'faskeUserAgent.json'), 'utf-8', (err, data)=>{
      if(err){
        reject(err);
      }else{
        reslove(JSON.parse(data));
      }
    });
  });
};

/**
 * 暂停
 * @param {number} duration 暂停时间(ms);
*/
const pause = (duration) => new Promise((reslove) => setTimeout(reslove, duration));

/**
 * retry funtion
 * @param {number} retries 尝试次数;
 * @param {object} fn 执行函数;
 * @param {number} delay 延迟执行等待时间;
 */
const backoff = (retries, fn, delay = 500) => {
  try{
    return fn();
  }catch(err){
    retries>1
    ? pause(delay).then(()=> backoff(retries-1, fn, delay))
    : Promise.reject(err)
  }
};

var OPTION = {
  timeout: 200,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
  }
}

/**
 * BASEOBJECT
 */
class BaseCrawler{
  constructor(){
    this.urls = [];
    this.proxies = [];
    this.proxyconfig = proxyconfig
    this.option = OPTION
    this.option.timeout = this.proxyconfig.TIMEOUT
  }

  /**
   * 
   * @param {string} url url
   */
  fetch(url){
    return new Promise((resolve, reject)=>{
      //backoff(5, req, 200);
      const req = request.get(url, this.option,(error, response, body)=>{
        if(error){
          reject(error);
        }else if(response.statusCode == 200){
          resolve(body);
        }else{
          reject(`response.statusCode=${response.statusCode}!`);
        }
      });
    });
  };

/**
 * 
 * @param {string} url 
 * @param {number} retries 
 * @param {number} delay 
 */
  async retry_fetch(url, retries = this.proxyconfig.RETRYTIMES, delay = this.proxyconfig.DURATION){
    return new Promise((resolve, reject)=>{
      this.fetch(url)
      .then((html)=>{
        resolve(html);
      })
      .catch(async(err)=>{
        if(retries>1){
          await pause(delay);
          this.retry_fetch(url, retries-1, delay);
        }else{
          reject(err);
        };
      });
    })    
  }

/**
 * crawl
 */
  async crawl(){
    for(const url of this.urls){
      let html = await this.retry_fetch(url);
      this.proxies.concat(this.parse(html));
    };
    return this.proxies
  };

};

module.exports = BaseCrawler