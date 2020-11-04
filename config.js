const path = require('path')
const proxy = {
    TIMEOUT:800,
    DURATION:500,
    RETRYTIMES:5
};

const db = {
    dbpath: path.join(__dirname,'proxies.db')
};

const test = {
    TIMEOUT:800,
}



module.exports = {
    proxy: proxy,
    db: db,
    test: test
};