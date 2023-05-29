const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

module.exports = ({ context, applyMethod }, options) => {
	const { rootDir } = context;

	// 根据参数获取ice的文件夹路径
	console.log("根据参数获取ice的文件夹路径");
	const getRootPath = (filepath) => {
		return path.resolve(`${rootDir}/.ice`, filepath);
	};

	// 根据字符串获取ejs文件路径
	console.log("根据字符串获取ejs文件路径");
	const ejsPath = (str = "", type = "api") => {
		return path.join(__dirname, `./template/${type}/ejs/${str}.ts.ejs`);
	};

	// 判断api文件夹是否存在，不存在就会创建
	console.log("判断api文件夹是否存在，不存在就会创建");
	if (!fs.existsSync(path.join(rootDir, "./src/api/"))) {
		fs.mkdirSync(path.join(rootDir, "./src/api/"));
	}

	// 判断api下的 index.ts 文件是否存在，不存在就会创建
	console.log("判断api下的 index.ts 文件是否存在，不存在就会创建");
	if (!fs.existsSync(path.join(rootDir, "./src/api/index.ts"))) {
		fs.writeFileSync(
			"./src/api/index.ts",
			ejs.render(fs.readFileSync(ejsPath("api"), "utf-8"))
		);
	}

	// 如果没有生成api/index.ts文件的话，则生成该文件
	console.log("如果没有生成api/index.ts文件的话，则生成该文件");
	if (!fs.existsSync(getRootPath("api/index.ts"))) {
		// 生成 /template/api/index.ts 文件
		console.log("生成 /template/api/index.ts 文件");
		const result = fs.readFileSync(ejsPath("index"), "utf-8");
		fs.writeFileSync(
			path.join(__dirname, "./template/api/index.ts"),
			ejs.render(result, { rootDir })
		);
		// 将生成的 文件 使用 addRenderFile 增加到 .ice/api 文件夹里
		console.log(
			"将生成的 api 文件 使用 addRenderFile 增加到 .ice/api 文件夹里"
		);
		applyMethod(
			"addRenderFile",
			path.join(__dirname, "./template/api/index.ts"),
			getRootPath("api/index.ts")
		);

		// 对外暴露api属性
		console.log("对外暴露api属性");
		applyMethod("addExport", { source: "./api", exportName: "api" });
	}

	if (!fs.existsSync(getRootPath("logger/index.ts"))) {
		const hasLogger = Object.keys(options).length > 0;
		if (hasLogger) {
			const logger = fs.readFileSync(ejsPath("index", "logger"), "utf-8");

			fs.writeFileSync(
				path.join(__dirname, "./template/logger/index.ts"),
				ejs.render(logger, { ...options })
			);

			console.log(
				"将生成的 logger 文件 使用 addRenderFile 增加到 .ice/api 文件夹里"
			);
			applyMethod(
				"addRenderFile",
				path.join(__dirname, "./template/logger/index.ts"),
				getRootPath("logger/index.ts")
			);
			console.log("对外暴露api属性");
			applyMethod("addExport", { source: "./logger", exportName: "slsLog" });
		}
	}
};
