const fs = require('fs');
const path = require('path');

var load = (_path, _name)=>{
    if(_name){
        return require(_path.join(path,_name));
    }
    return require(path);
};

module.exports = (dir)=>{
    patcher = {};
    fs.readdirSync(dir).forEach((filename)=>{
        if (!/\.js$/.test(filename)) {
            return;
        };
        var name = path.basename(filename, '.js');
        var _load = load.bind(null, './' + dir + '/', name);
        patcher.__defineGetter__(name, _load);
    })
};