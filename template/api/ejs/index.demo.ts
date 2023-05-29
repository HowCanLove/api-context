import { request } from "<%-rootDir%>/.ice";
import apiObj from "<%-rootDir%>/src/api";

interface apiItem {
	url: string;
	method?: string;
	headers?: {
		[name: string]: any;
	};
	defaultData?: {
		[name: string]: any;
	};
	formatResult?: Function;
}
interface ApiObj {
	[name: string]: string | ApiObj | apiItem;
}

type apiFunction = (params?: { [name: string]: any }) => Promise<any>;

type Partial2<T> = { [P in keyof T]: Partial3<T[P]> };
type Partial3<T> = T extends string
	? apiFunction
	: T extends apiItem
	? apiFunction
	: Partial2<T>;

function formatApiList<T extends object>(obj: T): Partial2<T> {
	const formatApi = {} as Partial2<T>;
	for (const key in obj) {
		const item = obj[key] as unknown as ApiObj;
		if (typeof item === "string" || typeof item.url === "string") {
			let apiConfig: apiItem;
			if (typeof item === "string") {
				apiConfig = { url: item };
			} else {
				apiConfig = item as unknown as apiItem;
			}

			const {
				url,
				defaultData = {},
				formatResult = (_) => _,
				headers: defaultHeaders,
				method: defaultMethod,
				...otherConfig
			} = apiConfig;

			const method = (defaultMethod || "GET").toLocaleUpperCase();

			Object.assign(formatApi, {
				[key]: async (params?: { [name: string]: any }): Promise<any> => {
					let send;
					if (params instanceof FormData) {
						send = params;
					} else {
						send = { ...defaultData, ...params };
					}
					Object.keys(send.sort || {}).length > 0 && delete send.sort;

					let requestFun;
					const headers = {
						...defaultHeaders,
					};

					if (method === "GET") {
						requestFun = request.get(url, {
							params: send,
							headers,
							...otherConfig,
						});
					} else if (method === "POST") {
						requestFun = request.post(url, send, {
							headers,
							...otherConfig,
						});
					}

					if (requestFun) {
						const requestFunResult = requestFun
							.then((result) => {
								const finalResult = formatResult(result);
								return finalResult;
							})
							.catch((err) => {
								return Promise.reject(err);
							});
						return requestFunResult;
					}
					throw new Error("请求方式不正确");
				},
			});
		} else {
			// @ts-ignore
			formatApi[key] = formatApiList(obj[key]);
		}
	}
	return formatApi;
}

export default formatApiList(apiObj);
