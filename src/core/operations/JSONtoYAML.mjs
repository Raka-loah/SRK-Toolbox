/**
 * @author ccarpo [ccarpo@gmx.net]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import YAML from "yaml";

/**
 * JSON to YAML operation
 */
class JSONtoYAML extends Operation {

    /**
     * JSONtoYAML constructor
     */
    constructor() {
        super();

        this.name = "JSON转YAML";
        this.module = "Default";
        this.description = "将JSON对象转换为YAML";
        this.infoURL = "https://en.wikipedia.org/wiki/YAML";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            return YAML.stringify(input);
        } catch (err) {
            throw new OperationError("转换失败");
        }
    }

}

export default JSONtoYAML;
