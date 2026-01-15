/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import * as uuid from "uuid";

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Analyse UUID operation
 */
class AnalyseUUID extends Operation {

    /**
     * AnalyseUUID constructor
     */
    constructor() {
        super();

        this.name = "解析UUID";
        this.module = "Crypto";
        this.description = "尝试解析给定UUID的信息，并推测其可能基于哪个版本标准生成。";
        this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const uuidVersion = uuid.version(input);
            return "UUID版本：" + uuidVersion;
        } catch (error) {
            throw new OperationError("无效的UUID");
        }
    }

}

export default AnalyseUUID;
