const request = require('request');
const proxyconfig = require('../config').proxy
const path = require('path');
const { html } = require('cheerio');
const { promises } = require('fs');

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

var OPTION = {
  timeout: proxyconfig.TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
  }
}

const RETRYTIMES = proxyconfig.RETRYTIMES //错误尝试次数
const DURATION = proxyconfig.DURATION //重试等待时间
/**
 * BASEOBJECT
 */
class BaseCrawler{
  constructor(){
    this.urls = [];
    this.option = OPTION
  }

  /**
   * 
   * @param {string} url url
   */
  fetch(url){
    return new Promise((resolve, reject)=>{
      //backoff(5, req, 200);
      request.get(url, this.option,(error, response, body)=>{
        if(error){
          reject(error);
        }else if(response.statusCode == 200){
          resolve(this.option.time
            ?{body:body, delay:response.timingPhases.firstByte}
            :body);
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
  async retryFetch(url, retries = RETRYTIMES, delay = DURATION){
    return new Promise((resolve, reject)=>{
      this.fetch(url)
      .then((body)=>{
        resolve(body);
      })
      .catch(async(err)=>{
        if(retries>1){
          await pause(delay);
          this.retryFetch(url, retries-1, delay);
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
    /**
     * 
     * @param {string} url 单个url
     */
    const _proxiesGetter = async(url)=>{
      let html = await this.retryFetch(url);
      return this.parse(html);
    };
    /**
     * 
     * @param {object} a 结果列表[host:port,...]
     * @param {object} b 结果列表[host:port,...]
     */
    const addRes = (a,b) => a.concat(b);
    
    const proxiesGetter = this.urls.map(url=>_proxiesGetter(url));
    let resList = await Promise.all(proxiesGetter);
    return resList.reduce(addRes,[]);
  };

};

module.exports = BaseCrawler