const fs = require('fs');

function import_data(path) {
    let text = fs.readFileSync(path, "utf-8");
    let lines = text.split("\r\n");
    lines.splice(0,1);

    var genes = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let arr = line.split("\t");
        genes.push(arr);
    }

    return genes;
}

module.exports = import_data;