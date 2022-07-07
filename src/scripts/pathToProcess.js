const { path } = require('express/lib/application');
var fetch = require('node-fetch');
const Cache = require('./cache')

class PathToProcess {
    /**
     * 
     * @param {Array} input_arr 
     */
    static async create2DProcess(input_arr) {
        var processes = [];
        console.log("input_arr", input_arr.length);
        var notfound = 0;
        for (let i = 0; i < input_arr.length; i++) {
            console.log("path", i,"/",input_arr.length);
            let pathway = input_arr[i].trim();
            if (pathway.startsWith("not found")) {
                processes.push({ input: pathway, name: "not found", process: "unknown" });
                notfound++;
                continue;
            }
            const body = await Cache.get("path", "get", pathway.replace(/\-/g, " "));

            var _name = "";

            var lines = body.split("\n");
            var pushed = false;
            for (let a = 0; a < lines.length; a++) {
                const line = lines[a];
                if (line.startsWith("NAME")) {
                    _name = line.split("        ")[1];
                }

                if (!line.startsWith("CLASS"))
                    continue;
                
                const className = line.split("       ")[1];
                processes.push({ input: pathway, name: _name, process: className.replace(/\,/g, "||") });
                pushed = true;
                break;
            }

            if (!pushed) {
                processes.push({ input: pathway, name: "not found", process: "unknown" });
            }
        }
        console.log("notfound", notfound);
        console.log("processes", processes.length);
        return processes;
    }

    /**
     * 
     * @param {Array} process_arr 
     */
    static getProcesses(process_arr) {
        var processes = [];

        for (let i = 0; i < process_arr.length; i++) {
            const pro = process_arr[i].process;
            if (!processes.includes(pro))
                processes.push(pro);
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
            console.log("name_to_id", i, "/", name_arr.length);
            const name = name_arr[i];
            const body = await Cache.get("path", "find", name.replace(/\-/g, " "));

            if (body.trim() == "") {

                ids.push("not found: " + name);
                console.log("not found", name);
                console.log(body);
                console.log("replaced", name.replace(/\-/g, ""))
                console.log(body);
                continue;
            }

            const id = body.split(":")[1].split("	")[0];
            ids.push(id);
        }
        return ids;
    }
}

module.exports = PathToProcess;