/**
 * Create a new library from the template
 */
const fs = require("fs-extra")

/**
 * Duplicate a file or folder from src to destination
 * @param {string} from Source path
 * @param {string} to Destination path
 */
const duplicate = async (from, to) => {
    try {
        await fs.copy(from, to)
    } catch (err) {
        process.exit(1)
    }
}

/**
 * Rename a list of files
 * @param {Object[]} files List of objects specifying from path and to path
 */
const rename = async (files) => {
    await Promise.all(
        files.map(async (file) => {
            // Skip if same (index.ts)
            if (file.from === file.to) return

            try {
                await fs.move(file.from, file.to)
            } catch (err) {
                console.error(`Failed renaming file ${file.from}`, err)
                process.exit(1)
            }
        })
    )
}

/**
 *
 * @param {Object[]} replace
 */
const replace = (path, replace) => {
    const content = fs.readFileSync(path).toString()

    let newContent = replace.reduce((acc, replace) => {
        return acc.replace(replace.from, replace.to)
    }, content)

    fs.writeFileSync(path, newContent)
}

/**
 * Delete a directory and all its contents
 * @param {*} path Directory path
 */
const deleteFolder = (path) => {
    fs.rmSync(path, { recursive: true, force: true })
}

/**
 * Duplicate template and set the project name to the given name
 * @param {String} name Project name
 */
const main = async (name) => {
    if (!name) throw new Error("Please enter a name")

    name = name.toLowerCase()

    // Duplicate folder
    await duplicate("../template", `../`)

    // Rename files from template to module name
    const schema = JSON.parse(
        fs
            .readFileSync("./schema.json")
            .toString()
            .replace(/\$\{name\}/g, name)
    ).files

    await rename(schema)

    // Replace all occurences of the word "Template"
    schema.forEach((fileSet) => {
        replace(fileSet.to, [
            {
                from: /Template/g,
                to: name.charAt(0).toUpperCase() + name.slice(1)
            },
            {
                from: /template/g,
                to: name.toLowerCase()
            },
            {
                from: /TEMPLATE/g,
                to: name.toUpperCase()
            }
        ])
    })

    deleteFolder("../template")
    deleteFolder("../setup")
}

main(process.argv[2])
