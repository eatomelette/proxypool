const DB = require('../storages/ProxyDB');
const crawler_1 = require('../crawlers/public/daili66');
const Tester = require('../testProxies/Tester');

async function mission(){
    var _tester = new Tester
    var _crawler_1 = new crawler_1
    var db = new DB
    proxies = await _crawler_1.crawl();
    proxiesList = await _tester.test(proxies);
    db.insertMany(proxiesList)
}
mission()