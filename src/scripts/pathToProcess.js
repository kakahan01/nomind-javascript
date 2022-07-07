var fetch = require('node-fetch');
const Cache = require('./cache')

class PathToProcess {
    /**
     * 
     * @param {Array} input_arr 
     */
    static async create2DProcess(input_arr) {
        var processes = [];

        for (let i = 0; i < input_arr.length; i++) {
            let pathway = input_arr[i].trim();
            const body = await Cache.get("path", "get", pathway);

            var _name = "";

            var lines = body.split("\n");
            for (let a = 0; a < lines.length; a++) {
                const line = lines[a];
                if (line.startsWith("NAME")) {
                    _name = line.split("        ")[1];
                }

                if (!line.startsWith("CLASS"))
                    continue;
                
                const className = line.split("       ")[1];
                processes.push({ input: pathway, name: _name, process: [className] });
                
                break;
            }
        }

        return processes;
    }

    /**
     * 
     * @param {Array} process_arr 
     */
    static getProcesses(process_arr) {
        var processes = [];

        for (let i = 0; i < process_arr.length; i++) {
            const process = process_arr[i];
            for (let a = 0; a < process.process.length; a++) {
                const pro = process.process[a];
                if (!processes.includes(pro))
                    processes.push(pro);
            }
        }

        return processes;
    }

    /**
     * 
     * @param {Array} converted 
     */
    static createCSV(converted) {
        var processes = this.getProcesses(converted);
        var str = "ID,Name,";

        str += processes.join(",");
        str += "\n";

        for (let i = 0; i < converted.length; i++) {
            const con = converted[i];

            str += con.input + "," + con.name.replace(/\,/g, ";") + ",";

            for (let a = 0; a < processes.length; a++) {
                const process = processes[a];
                if (con.process.includes(process)) {
                    str += "1"
                } else {
                    str += "0"
                }

                str += ","
            }

            str = str.substring(0, str.length - 1);
            str += "\n";
        }

        str = str.substring(0, str.length - 1);

        return str;
    }

    static async convertNameToID(name_arr) {
        var ids = [];

        for (let i = 0; i < name_arr.length; i++) {
            const name = name_arr[i];
            const body = await Cache.get("path", "find", name);

            if (body.trim() == "") {
                continue;
            }

            const id = body.split(":")[1].split("	")[0];
            ids.push(id);
        }

        return ids;
    }
}

module.exports = PathToProcess;