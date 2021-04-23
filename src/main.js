import chalk from "chalk";
import fs from "fs";
import Listr from "listr";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function createFile(options) {
  fs.mkdirSync(`./${options.name}Module`);
}

async function copyTemplateFiles(options) {
  return copy(
    options.templateDirectory,
    options.targetDirectory + `/${options.name}Module`,
    {
      clobber: false,
    }
  );
}

async function write(options) {
  const path = options.targetDirectory + `/${options.name}Module/index.tsx`;
  const path2 =
    options.targetDirectory +
    `/${options.name}Module/__tests__/index.stories.tsx`;
  fs.readFile(path, function (err, data) {
    if (err) {
      return console.error(err);
    }
    let dataStr = data.toString();
    dataStr = dataStr.replace("$NAME", options.name);
    dataStr = dataStr.replace("$NAME", options.name);
    fs.writeFile(path, dataStr, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  });
  fs.readFile(path2, function (err, data) {
    if (err) {
      return console.error(err);
    }
    let dataStr = data.toString();
    dataStr = dataStr.replace("$NAME", options.name);
    fs.writeFile(path2, dataStr, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  });
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  const fullPathName = new URL(import.meta.url).pathname;
  const templateDir = path.resolve(
    fullPathName.substr(fullPathName.indexOf("/")),
    "../../templates"
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr(
    [
      {
        title: "Create File",
        task: () => createFile(options),
      },
      {
        title: "Copy project files",
        task: () => copyTemplateFiles(options),
      },
      {
        title: "Editing Module name",
        task: () => write(options),
      },
    ],
    {
      exitOnError: false,
    }
  );

  await tasks.run();
  console.log("%s Module Generated!", chalk.green.bold("DONE"));
  return true;
}
