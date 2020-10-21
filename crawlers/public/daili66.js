BaseCrawler = require('../BaseCrawler')
const cheerio = require('cheerio')
const iconv = require('iconv-lite');

var BASE_URL = `http://www.66ip.cn/{page}.html`;
const MAX_PAGE = 5;

class Daili66Crawler extends BaseCrawler{
    constructor(){
        super()
        for(let i = 1; i <= MAX_PAGE; i++){
            this.urls.push(BASE_URL.replace('{page}',i));
        }
        this.option.encoding = null //取消默认转码
    }

    parse(html){
        let _proxies = [];
        let host = 0, port = 0;
        const $ = cheerio.load(iconv.decode(html, 'gb2312').toString());
        let trs = $('.containerbox table tbody tr');
        let _trs = trs.slice(1,trs.length)
        _trs.each((i, elem)=>{
            host = $(elem).children('td').eq(0).text();
            //console.log(host)
            port = $(elem).children('td').eq(1).text();
            //console.log(`host:${host},port:${port}`);
            _proxies.push([host,port]);
        });
        return _proxies
    }
}

var crawler = new Daili66Crawler
crawler.crawl().then(x=>console.log(s))
