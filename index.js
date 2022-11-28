const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

module.exports = ({ context, applyMethod }, options) => {
  const { rootDir } = context;

  // 根据参数获取ice的文件夹路径
  const getRootPath = (filepath) => {
    return path.resolve(`${rootDir}/.ice`, filepath);
  };

  // 根据字符串获取ejs文件路径
  const ejsPath = (str = "", type = "api") => {
    return path.join(__dirname, `./template/${type}/ejs/${str}.ts.ejs`);
  };

  // 判断api文件夹是否存在，不存在就会创建
  if (!fs.existsSync(path.join(rootDir, "./src/api/"))) {
    fs.mkdirSync(path.join(rootDir, "./src/api/"));
  }

  // 判断api下的 index.ts 文件是否存在，不存在就会创建
  if (!fs.existsSync(path.join(rootDir, "./src/api/index.ts"))) {
    fs.writeFileSync(
      "./src/api/index.ts",
      ejs.render(fs.readFileSync(ejsPath("api"), "utf-8"))
    );
  }

  // 判断api下的 config.ts 文件是否存在，不存在就会创建
  if (!fs.existsSync(path.join(rootDir, "./src/api/config.ts"))) {
    fs.writeFileSync(
      "./src/api/config.ts",
      ejs.render(fs.readFileSync(ejsPath("config"), "utf-8"))
    );
  }

  // 生成 /template/api/index.ts 文件
  const result = fs.readFileSync(ejsPath("index"), "utf-8");
  fs.writeFileSync(
    path.join(__dirname, "./template/api/index.ts"),
    ejs.render(result, { rootDir })
  );
  // 将生成的 文件 使用 addRenderFile 增加到 .ice/api 文件夹里
  applyMethod(
    "addRenderFile",
    path.join(__dirname, "./template/api/index.ts"),
    getRootPath("api/index.ts")
  );

  // 对外暴露api属性
  applyMethod("addExport", { source: "./api", exportName: "api" });

  if (options.host && options.project && options.logstore) {
    // 生成 /template/logger/index.ts 文件
    const logger = fs.readFileSync(ejsPath("index", "logger"), "utf-8");
    fs.writeFileSync(
      path.join(__dirname, "./template/logger/index.ts"),
      ejs.render(logger, { ...options })
    );

    // 将生成的 文件 使用 addRenderFile 增加到 .ice/logger 文件夹里
    fs.unlinkSync(getRootPath("plugins/logger/index.ts"));
    applyMethod(
      "addRenderFile",
      path.join(__dirname, "./template/logger/index.ts"),
      getRootPath("plugins/logger/index.ts")
    );

    // 对外暴露api属性
    // applyMethod("addExport", { source: "./logger", exportName: "logger" });
  }
};
