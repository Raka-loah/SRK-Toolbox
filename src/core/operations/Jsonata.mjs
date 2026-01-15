/**
 * @author Jon K (jon@ajarsoftware.com)
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import jsonata from "jsonata";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Jsonata Query operation
 */
class JsonataQuery extends Operation {
    /**
     * JsonataQuery constructor
     */
    constructor() {
        super();

        this.name = "Jsonata查询";
        this.module = "Code";
        this.description =
            "使用Jsonata表达式查询与转换JSON数据。";
        this.infoURL = "https://docs.jsonata.org/overview.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "查询",
                type: "text",
                value: "string",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [query] = args;
        let result, jsonObj;

        try {
            jsonObj = JSON.parse(input);
        } catch (err) {
            throw new OperationError(`输入的JSON无效：${err.message}`);
        }

        try {
            const expression = jsonata(query);
            result = await expression.evaluate(jsonObj);
        } catch (err) {
            throw new OperationError(
                `无效的Jsonata表达式：${err.message}`
            );
        }

        return JSON.stringify(result === undefined ? "" : result);
    }
}

export default JsonataQuery;
