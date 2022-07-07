const express = require('express');
const app = express();

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path')
const favicon = require('serve-favicon');


var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


const search = require('./src/scripts/hugoSearch');
const MetaToPath = require('./src/scripts/metaToPath');
const PathToProcess = require('./src/scripts/pathToProcess');
const Cache = require('./src/scripts/cache');

app.use(favicon(path.join('src', 'img', 'mass.jpg')));

var genes = [];

app.get("/", (request, response) => {
    response.redirect("Home");
})

app.get("/:redirect", (request, response) => {
    const path = __dirname + "/src/html/" + request.params.redirect + ".html";
    if (fs.existsSync(path))
        response.sendFile(path);
    else
        response.status(404).send("Not found.");
})

app.get("/api/:func/:input", async (req, res) => {
    switch (req.params.func) {
        case "find":
            const body = await Cache.get("meta", "find", req.params.input);
            res.status(200).send(body);
            break;
        case "findpathway":
            const body2 = await Cache.get("path", "find", req.params.input);
            res.status(200).send(body2);
            break;
        case "get":
            const body3 = await Cache.get("meta", "get", req.params.input);
            res.status(200).send(body3);
            break;
        case "convert":
            let arr = req.params.input.split("\n");

            for (let i = 0; i < arr.length; i++) {
                const el = arr[i];
                if (el.trim() == "") {
                    arr.splice(i,1);
                }
            }

            const path = await MetaToPath.create2DPathways(arr);
            const csv = MetaToPath.arrToCSV(path);
            res.send(csv);
            break;
        case "convert_process":
            let arr2 = req.params.input.split("\n");

            for (let i = 0; i < arr2.length; i++) {
                const el = arr2[i];
                if (el.trim() == "") {
                    arr2.splice(i,1);
                }
            }

            const path2 = await PathToProcess.create2DProcess(arr2);
            const csv2 = PathToProcess.createCSV(path2);
            res.send(csv2);
            break;
        case "names_to_id":
            let arr3 = req.params.input.split("||");

            const result = await PathToProcess.convertNameToID(arr3);
            res.send(JSON.stringify(result));
            break;
        default:
            break;
    }
})

app.get("/img/:img_name", (req, res) => {
    const path = __dirname + "/src/img/" + req.params.img_name;
    if (fs.existsSync(path))
        res.status(200).sendFile(path);
    else
        res.status(404).send("Not found.");
})

app.post("/submit_genes", jsonParser, (req, res) => {
    // --calculate genes--

    // get requested genes
    let req_genes = req.body.genes;
    // get requested type
    let req_type = req.body.type;
    // get requested syns
    let req_syn = req.body.symbols.split("\n");

    if (req_type == "not-selected") {

        res.status(400).send("select-type");

        return;
    }

    // parse type
    // Approved = 0, NCBI = 3, Ensembl = 4
    var type = 20;
    switch (req_type) {
        case "SYMBOL":
            type = 0;
            break;
        case "NCBI":
            type = 3;
            break;
        case "ENSEMBL":
            type = 4;
            break;
        case "SYNONYMS":
            type = 10;
            break;
        default:
            type = 20;
            break;
    }

    if (type == NaN || type == 20) {
        res.status(400).send("bad-type");
        return;
    }

    // array of requested genes
    var requested = req_genes.split("\n");

    // found genes
    var found = [];

    for (let i = 0; i < requested.length; i++) {
        var gene = requested[i];
        gene = gene.trim();

        if (gene == "") {
            found.push("empty");
            continue;
        }
        
        
        const found_gene = genes.find(e => {
            for (let a = 0; a < e.length; a++) {
                if (e[a].split(",").includes(gene))
                    return true;

                if (e[a].split(" ").includes(gene))
                    return true;
                
                if (e[a] == gene)
                    return true;
            }

            return false;
        });

        if (found_gene == undefined) {
            found.push("not-found");
        } else {
            if (type == 10) {
                var founded = "";
                for (let b = 0; b < found_gene.length; b++) {
                    const gene_name = found_gene[b];
                    var gene_name_arr = gene_name.split(",");
                    for (let c = 0; c < gene_name_arr.length; c++) {
                        const gen = gene_name_arr[c];
                        if (req_syn.includes(gen) && [1,2].includes(b))
                        founded += gen + ",";
                    }

                }

                if (founded.trim() != "")
                    found.push(founded.substring(0, founded.length - 1));
                else
                    found.push(found_gene[0]);
            } else {
                found.push(found_gene[type]);
            }
        }
    }

    res.status = 200;
    res.send(JSON.stringify(found));
});

const PORT = 80;

app.listen(PORT, () => {
    console.log("Server started at port " + PORT);
    genes = search("./hugo.txt");
})

function log_err(err){
    console.log(err);
}