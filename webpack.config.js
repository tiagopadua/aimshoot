const path = require("path");
const FileSystem = require("fs");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const glob = require("glob");

const BUILD_PATH = 'dist';
const VERSION = require("./package.json").version + "-" + Date.now().toString();

/* Replacement plugin */
function ReplacePlugin(options) {
    this.options = options;

    if (typeof(options) !== "object") {
        throw new Error("Replace parameters must be an object!");
    }
    if (typeof(options.entry) !== "string") {
        throw new Error("Parameter 'entry' must be a string. Received: " + typeof(options.entry));
    }
    if (typeof(options.path) !== "string") {
        throw new Error("Parameter 'path' must be a string containing the destination folder. Received: " + typeof(options.entry));
    }
    for (itemName in options.replaces) {
        if (!options.replaces.hasOwnProperty(itemName)) {
            continue;
        }
        const itemValue = options.replaces[itemName];
        if (typeof(itemValue) !== "string") {
            throw new Error("Item '" + itemName + "' of 'replaces' parameter must contain a string. Received: " + typeof(itemValue));
        }
    }
}
ReplacePlugin.prototype.apply = function(compiler) {
    compiler.plugin("done", () => {
        // First find all files to replace
        glob.sync(this.options.entry).some(fileName => {
            console.log("Replacing content in file", fileName);
            let originalContent = FileSystem.readFileSync(path.join(__dirname, fileName), "utf8");
            let replacedContent = originalContent;

            // Now replace all occurrences
            for (replaceFrom in this.options.replaces) {
                // This regex matches   [ replace: KEY_NAME ]
                let regexFrom = new RegExp("\\[\\s*replace\\s*:\\s*" + replaceFrom + "\\s*\\]", "gi"); // Replace all occurrences & ignore case
                let replaceTo = this.options.replaces[replaceFrom];
                console.log("      [" + replaceFrom + "]  ->  [" + replaceTo + "]", regexFrom);
                replacedContent = replacedContent.replace(regexFrom, replaceTo);
            }

            console.log("Writing", path.join(this.options.path, path.basename(fileName)));
            console.log("");
            FileSystem.writeFileSync(path.join(__dirname, this.options.path, path.basename(fileName)), replacedContent)
        });
    });
}

module.exports = {
    entry: {
        "aimshoot": "./src/js/aimshoot.js"
    },
    output: {
        filename: "js/[name]-" + VERSION + ".min.js",
        path: path.resolve(__dirname, BUILD_PATH)
    },
    plugins: [
        new MinifyPlugin(), // Minify javascript
        new ExtractTextPlugin("css/[name]-" + VERSION + ".css"), // Rename CSS files
        new CopyPlugin([{
            from: "static",
            to: "."
        }]),
        // Replace the includes in HTML files to point to new minified ones, with timestamp on the name
        new ReplacePlugin({
            entry: "./src/*.html",
            path: BUILD_PATH,
            replaces: {
                "VERSION": VERSION
            }
        })
    ],
    module: {
        rules: [{
            // Compile SASS to CSS
            test: /\.s[a|c]ss$/i,
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: "css-loader!sass-loader"
            })
        }, {
            test: /\.(png|jpg|jpeg|ttf)$/i,
            use: "url-loader"
        }]
    }
};
