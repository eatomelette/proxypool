const Database = require('better-sqlite3')
const dbconfig = require('../config').db

class ProxyDB{
    constructor(){
        console.log(dbconfig.dbpath)
        this.db = new Database(dbconfig.dbpath, { verbose: console.log });
        const stmt = this.db.prepare(`CREATE TABLE IF NOT EXISTS proxy(
            host TEXT PRIMARY KEY NOT NULL UNIQUE,
            delay INTEGER,
            t TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
        `);
        stmt.run();
        this.insertExpense = this.db.prepare(`INSERT OR REPLACE INTO proxy (host, delay) VALUES (@host, @delay)`);
        this.deleteExpense = this.db.prepare(`DELETE FROM proxy WHERE host = ?`)
    };
/**
 * 
 * @param {string} host 代理地址-ip:端口 
 * @param {number} delay 延迟 ms
 */
    insert(host, delay){
        this.insertExpense.run(host, delay)
    }
/**
 * @param {list} hostList 代理地址列表 [{host,delay},...]
 */
    insertMany = (hostList)=>{
        for(const host of hostList) this.insertExpense.run(host);
    };
/**
 * 
 * @param {string} host 代理地址-ip:端口
 */
    delete(host){
        this.deleteExpense.run(host)
    }
/**
 * 
 * @param {List} hostList 代理地址列表 [host,...]
 */
    deleteMany = (hostList)=>{
        for(const host of hostList) this.deleteExpense.run(host)
    };
/**
 * 
 * @param {number} some 随机选取some个代理地址
 */
    get(some){
        return this.db.prepare(`SELECT * FROM proxy ORDER BY RANDOM() LIMIT ?`)
            .get(some);
    };
/**
 * 查询全部可用代理
 */
    getAll(){
        return this.db.prepare(`SELECT * FORM proxy`)
            .all();
    }

}

module.exports = ProxyDB;
// console.log(dbconfig.dbpath)
// new ProxyDB